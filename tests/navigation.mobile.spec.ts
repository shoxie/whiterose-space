import { test, expect } from "@playwright/test";

/**
 * Mobile navigation — runs in the 'mobile' project (Pixel 5 viewport).
 * Verifies the burger opens the fullscreen .mobnav overlay and its links route.
 */
test.describe("Mobile navigation", () => {
  // Only meaningful where the burger is visible (nav hidden below 900px CSS).
  test.skip(
    ({ viewport }) => !viewport || viewport.width >= 900,
    "narrow viewports only",
  );

  test("burger opens mobnav and navigates to /blog", async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1.hero__title")).toBeVisible({
      timeout: 10_000,
    });

    const burger = page.locator(".header__burger");
    await expect(burger).toBeVisible();
    await burger.click();

    const mobnav = page.locator(".mobnav");
    await expect(mobnav).toBeVisible({ timeout: 5_000 });

    await mobnav.locator('a[href="/blog"]').click();
    await expect(page).toHaveURL(/\/blog$/, { timeout: 10_000 });
    // header nav is hidden behind burger on mobile; listing must render
    await expect(page.getByText("Bài viết").first()).toBeVisible({
      timeout: 10_000,
    });

    await page.waitForTimeout(500);
    expect(pageErrors, `page errors:\n${pageErrors.join("\n")}`).toEqual([]);
  });
});
