import { useTheme } from "next-themes";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const NAV = [
  { href: "/blog", label: "Blog" },
  { href: "/snippet", label: "Snippet" },
  { href: "/about", label: "About" },
  { href: "/static/CV.pdf", label: "CV", external: true },
  {
    href: "https://wordie-game.vercel.app/",
    label: "Wordie",
    external: true,
  },
];

const SOCIALS = [{ href: "https://github.com/shoxie", label: "GitHub" }];

/** Theme pill — same visual grammar as the portfolio's langswitch. */
function ThemePill({ variant }: { variant?: "mob" }) {
  const { theme, setTheme } = useTheme();
  const pick = (t: "moon" | "dawn") => (
    <button
      type="button"
      className={`langswitch__btn ${theme === t ? "is-active" : ""}`}
      aria-pressed={theme === t}
      onClick={() => setTheme(t)}
    >
      {variant === "mob"
        ? t === "moon"
          ? "Moon (tối)"
          : "Dawn (sáng)"
        : t === "moon"
          ? "MOON"
          : "DAWN"}
    </button>
  );
  return (
    <div
      className={`langswitch ${variant === "mob" ? "langswitch--mob" : ""}`}
      role="group"
      aria-label="Theme / Giao diện"
    >
      {pick("moon")}
      {pick("dawn")}
    </div>
  );
}

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const lastY = useRef(0);
  const navOpenRef = useRef(false);

  useEffect(() => {
    navOpenRef.current = navOpen;
  }, [navOpen]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(navOpenRef.current ? false : y > lastY.current && y > 400);
      lastY.current = y;
      ticking = false;
    };
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const closeNav = useCallback(() => setNavOpen(false), []);

  useEffect(() => {
    document.body.classList.toggle("is-locked", navOpen);
    return () => document.body.classList.remove("is-locked");
  }, [navOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && navOpen) setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <>
      <header
        className={`header ${solid ? "is-solid" : ""} ${
          hidden && !navOpen ? "is-hidden" : ""
        }`}
      >
        <Link className="header__brand" href="/">
          <span className="header__dot" />
          <span className="header__name">WhiteRose</span>
          <span className="header__alias">/ 白薔薇</span>
        </Link>
        <nav className="header__nav" aria-label="Primary">
          {NAV.map((n) =>
            n.external ? (
              <a key={n.href} href={n.href} target="_blank" rel="noopener">
                {n.label}
              </a>
            ) : (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ),
          )}
        </nav>
        <ThemePill />
        <button
          className="header__burger"
          aria-label={navOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={navOpen}
          aria-controls="mobileNav"
          onClick={() => setNavOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>

      <AnimatePresence>
        {navOpen && (
          <motion.div
            id="mobileNav"
            className="mobnav"
            aria-hidden={!navOpen}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <nav className="mobnav__list">
              {NAV.map((n, i) =>
                n.external ? (
                  <a
                    key={n.href}
                    href={n.href}
                    target="_blank"
                    rel="noopener"
                    onClick={closeNav}
                  >
                    <em>0{i + 1}</em> <span>{n.label}</span>
                  </a>
                ) : (
                  <Link key={n.href} href={n.href} onClick={closeNav}>
                    <em>0{i + 1}</em> <span>{n.label}</span>
                  </Link>
                ),
              )}
            </nav>
            <ThemePill variant="mob" />
            <div className="mobnav__social">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener"
                  onClick={closeNav}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
