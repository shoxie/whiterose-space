import { useTheme } from "next-themes";
import Link from "next/link";
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import UndelinedLinks from "@/common/UnderlinedLinks";
import { GoKebabHorizontal } from "react-icons/go";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";

const menuItems = [
  {
    name: "Blog",
    href: "/blog",
    mobile: false,
  },
  {
    name: "Snippet",
    href: "/snippet",
    mobile: false,
  },
  {
    name: "About",
    href: "/about",
    mobile: false,
  },
  {
    name: "My resume",
    href: "/static/CV.pdf",
    mobile: false,
  },
  {
    name: "Wordie game",
    href: "https://wordie-game.vercel.app/",
    mobile: false,
  },
];

const Wordmark = () => (
  <Link
    href="/"
    className="group flex items-center gap-2 text-xl"
    aria-label="WhiteRose Space — về trang chủ"
  >
    <span
      className="font-display text-2xl font-black tracking-tight text-text transition-colors duration-200 group-hover:text-love"
      aria-hidden="true"
    >
      WhiteRose
    </span>
    <span
      className="text-xs font-semibold tracking-[0.3em] text-love"
      aria-hidden="true"
    >
      白薔薇
    </span>
  </Link>
);

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "moon";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "dawn" : "moon")}
      aria-label={isDark ? "Chuyển sang theme sáng" : "Chuyển sang theme tối"}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-highlightHigh text-xl transition-colors duration-200 hover:border-love"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.25 }}
          className="absolute"
          aria-hidden="true"
        >
          {isDark ? (
            <BsFillSunFill className="text-[#F6C177]" />
          ) : (
            <BsFillMoonFill className="text-text" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

const Header = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const headerContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerContainer) return;
    setHeaderHeight(headerContainer.current?.clientHeight ?? 0);
  }, [headerContainer]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <>
      <header className="relative z-50 mx-auto max-w-screen-xl px-5 py-5 md:px-10">
        <div className="flex-row items-center justify-between hidden lg:flex">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Wordmark />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-row items-center justify-center hidden space-x-6 lg:flex"
          >
            <UndelinedLinks items={menuItems} />
            <ThemeToggle />
          </motion.div>
        </div>
        <div
          className="flex items-center justify-between lg:hidden"
          ref={headerContainer}
        >
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={mobileNavOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-highlightHigh text-xl transition-colors hover:border-love"
          >
            <GoKebabHorizontal aria-hidden="true" />
          </button>
          <Wordmark />
          <ThemeToggle />
        </div>
      </header>
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              top: headerHeight ?? 0,
              height: `calc(100vh - ${headerHeight}px)`,
            }}
            className="fixed left-0 z-40 w-screen bg-base/95 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          >
            <nav
              className="flex flex-col space-y-3 px-8 pt-10"
              aria-label="Mobile menu"
            >
              {menuItems.map((nav, idx) => (
                <motion.div
                  key={nav.name}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + idx * 0.06 }}
                >
                  <Link
                    href={nav.href}
                    className={classNames(
                      "block border-b border-highlightHigh py-4 font-display text-2xl font-bold text-text transition-colors hover:text-love"
                    )}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {nav.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
