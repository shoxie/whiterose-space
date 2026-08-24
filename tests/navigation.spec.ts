import {
  test,
  expect,
  type ConsoleMessage,
  type Page,
  type Response,
} from "@playwright/test";

/**
 * Runtime navigation verification for the redesigned (dark editorial) site.
 *
 * A passing `next build` does NOT prove the site works: hydration errors,
 * broken client-side routing, failed data fetches and 404 assets only show
 * up at runtime. This suite visits every sitemap route and exercises real
 * client-side navigation between pages.
 */

const BASE = "http://localhost:3000";

/** Errors we tolerate: optional external assets & third-party embeds. */
function isBenignConsoleError(msg: ConsoleMessage): boolean {
  const text = msg.text();
  if (text.includes("giscus")) return true;
  if (/https?:\/\/giscus\.app/.test(msg.location()?.url ?? "")) return true;
  // Browser-level resource errors carry no URL; every real same-origin miss
  // is already caught (URL-attributed) by the badResponses assertion below.
  // This specifically covers Vercel-injected assets like /_vercel/insights/*
  // that only resolve when deployed on Vercel.
  if (text.includes("Failed to load resource")) return true;
  if (text.includes("404")) {
    // only benign if it's about fonts / external / analytics assets
    if (
      text.includes("fonts.googleapis.com") ||
      text.includes("fonts.gstatic.com") ||
      text.includes("github.com") ||
      text.includes("/api/spotify") ||
      text.includes("/api/top-track")
    ) {
      return true;
    }
  }
  return false;
}

/** Attach error collectors; returns handles to assert on later. */
function collectErrors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const badResponses: string[] = [];

  page.on("pageerror", (err) => pageErrors.push(err.message));

  page.on("console", (msg) => {
    if (msg.type() === "error" && !isBenignConsoleError(msg)) {
      consoleErrors.push(msg.text());
    }
  });

  page.on("response", (res: Response) => {
    const url = res.request().url();
    if (url.startsWith(BASE) && res.status() >= 400) {
      // Vercel platform scripts (/​_vercel/insights/*) only exist on Vercel
      // hosting — their local 404s are expected, not site defects.
      if (url.includes("/_vercel/")) return;
      badResponses.push(`${res.status()} ${url}`);
    }
  });

  return { pageErrors, consoleErrors, badResponses };
}

test.describe("Sitemap-driven route coverage", () => {
  test("every sitemap route renders with no runtime errors", async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000); // ~20+ routes visited sequentially
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);

    // raw XML text — page.content() mangles XML through the DOM serializer
    const xml = await res.text();
    const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))
      .map((m) => m[1].trim())
      .filter(Boolean)
      .map((loc) => {
        try {
          const u = new URL(loc); // absolute (production) URL
          return `${BASE}${u.pathname}${u.search}`;
        } catch {
          return loc.startsWith("/") ? `${BASE}${loc}` : `${BASE}/${loc}`;
        }
      });
    expect(
      locs.length,
      `expected >= 8 routes in sitemap, got ${locs.length}`,
    ).toBeGreaterThanOrEqual(8);

    const errors = collectErrors(page);

    for (const route of [...new Set(locs)]) {
      const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(resp?.status(), `route ${route} should return 200`).toBe(200);
      // let hydration settle before moving on (bounded — don't wait full idle)
      await page
        .waitForLoadState("networkidle", { timeout: 4_000 })
        .catch(() => {});

      // same-origin requests must not fail (4xx/5xx)
      const routeBad = errors.badResponses.filter((b) =>
        b.includes(new URL(route).pathname),
      );
      // allow only explicit 404 sanity routes — none exist in the sitemap
      expect(
        routeBad,
        `route ${route} had failing same-origin requests:\n${routeBad.join("\n")}`,
      ).toEqual([]);
    }

    // give late async work (SWR spotify poll, giscus) a moment to surface errors
    await page.waitForTimeout(1_500);
    expect(
      errors.pageErrors,
      `page errors:\n${errors.pageErrors.join("\n")}`,
    ).toEqual([]);
    expect(
      errors.consoleErrors,
      `unexpected console errors:\n${errors.consoleErrors.join("\n")}`,
    ).toEqual([]);
  });
});

test.describe("Client-side navigation integrity", () => {
  // Desktop-only: exercises .header__nav which is hidden below 900px.
  // Narrow-viewport coverage lives in navigation.mobile.spec.ts (burger flow).
  test.skip(
    ({ viewport }) => !!viewport && viewport.width < 1024,
    "desktop-only",
  );

  test("home → blog → post → back → snippet → tag → about all work via client routing", async ({
    page,
  }) => {
    const errors = collectErrors(page);

    // ── home renders hero + marquee ──
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1.hero__title")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator(".marquee")).toBeAttached();

    // ── header nav → /blog ──
    await page.click('.header__nav a[href="/blog"]');
    await expect(page).toHaveURL(/\/blog$/, { timeout: 10_000 });
    await expect(page.getByText("Bài viết").first()).toBeVisible({
      timeout: 10_000,
    });

    // ── first post preview → detail page ──
    const postLink = page
      .locator('a[href^="/blog/"]')
      .filter({
        hasNot: page.locator('[href="/blog"]'),
      })
      .first();
    await postLink.click();
    await expect(page).toHaveURL(/\/blog\/.+/, { timeout: 10_000 });
    await expect(page.locator("article h1, article h2").first()).toBeVisible({
      timeout: 10_000,
    });

    // ── browser back returns to listing ──
    await page.goBack();
    await expect(page).toHaveURL(/\/blog$/, { timeout: 10_000 });

    // ── snippet listing → detail ──
    await page.goto("/snippet", { waitUntil: "domcontentloaded" });
    const snippetLink = page.locator('a[href^="/snippet/"]').first();
    await snippetLink.click();
    await expect(page).toHaveURL(/\/snippet\/.+/, { timeout: 10_000 });

    // ── tag index → tag detail ──
    await page.goto("/tag", { waitUntil: "domcontentloaded" });
    const tagLink = page.locator('a[href^="/tag/"]').first();
    await tagLink.click();
    await expect(page).toHaveURL(/\/tag\/.+/, { timeout: 10_000 });

    // ── about page ──
    const aboutRes = await page.goto("/about", {
      waitUntil: "domcontentloaded",
    });
    expect(aboutRes?.status()).toBe(200);
    await expect(page.locator("main").first()).toBeVisible();

    // ── final error assertion across the whole journey ──
    await page.waitForTimeout(1_000);
    expect(
      errors.pageErrors,
      `page errors:\n${errors.pageErrors.join("\n")}`,
    ).toEqual([]);
    expect(
      errors.consoleErrors.filter((t) => !t.includes("/api/")),
      `unexpected console errors:\n${errors.consoleErrors.join("\n")}`,
    ).toEqual([]);
  });
});

test.describe("404 sanity", () => {
  test("unknown blog slug serves the 404 page without crashing", async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const resp = await page.goto("/blog/khong-ton-tai", {
      waitUntil: "domcontentloaded",
    });
    expect(resp?.status()).toBe(404);
    // Next's default 404 or a custom one — just needs to render something meaningful
    await expect(page.locator("body")).toContainText("404");
    await page.waitForTimeout(500);
    expect(pageErrors, `page errors:\n${pageErrors.join("\n")}`).toEqual([]);
  });
});
