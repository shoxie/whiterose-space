import { motion, useScroll, Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Footer from "./components/footer";
import Header from "./components/header";
import { AiOutlineArrowUp } from "react-icons/ai";

type Props = {
  children: React.ReactNode;
};

const PagesLayout = ({ children }: Props) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const [percent, setpercent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    setHasFinePointer(query.matches);
    const onChange = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const unsub = scrollY.onChange((value) => {
      if (ref.current != null) {
        const height = ref.current.clientHeight;
        setpercent(Math.min(value / height, 1));
      }
    });
    return () => {
      unsub();
    };
  }, [scrollY]);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const wheelEvent = () => {
      const percent =
        ((document.documentElement.scrollTop + document.body.scrollTop) /
          (document.documentElement.scrollHeight -
            document.documentElement.clientHeight)) *
        100;

      setScrolled(percent);
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("scroll", wheelEvent);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("scroll", wheelEvent);
    };
  }, []);

  const variants: Variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      transition: { duration: 0.1 },
    },
    text: {
      height: 150,
      width: 150,
      x: mousePosition.x - 75,
      y: mousePosition.y - 75,
      backgroundColor: "#E11D2E",
      mixBlendMode: "difference",
    },
  };

  return (
    <>
      <Header />
      <div className="fixed top-0 left-0 z-[9999] w-full">
        <motion.div
          animate={{ opacity: percent > 0 ? 1 : 0 }}
          className="h-1 bg-highlightHigh"
        >
          <motion.div
            className="h-1 bg-love"
            animate={{ scaleX: percent }}
            style={{ originX: 0, originY: 0 }}
          />
        </motion.div>
      </div>
      {hasFinePointer && (
        <motion.div
          className="cursor"
          variants={variants}
          animate={cursorVariant}
          aria-hidden="true"
          onMouseEnter={() => setCursorVariant("default")}
        />
      )}
      <motion.button
        type="button"
        className="fixed right-6 rounded-full border-2 border-love bg-surface p-3 text-love shadow-[0_0_18px_rgba(225,29,46,0.25)] transition-colors hover:bg-love hover:text-[#0A070D]"
        animate={{
          bottom: scrolled > 5 ? 40 : -100,
          transition: { duration: 0.5 },
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll To Top"
      >
        <AiOutlineArrowUp className="text-xl" aria-hidden="true" />
      </motion.button>
      <motion.main
        className="mx-auto max-w-screen-lg px-5 lg:px-0"
        ref={ref}
        onMouseEnter={() => setCursorVariant("default")}
        onMouseOver={(e: React.MouseEvent<HTMLElement>) => {
          const target = e.target as HTMLElement;
          setCursorVariant(
            target.closest("a, button, input, [role='button']")
              ? "text"
              : "default"
          );
        }}
      >
        {children}
      </motion.main>
      <Footer />
    </>
  );
};

export default PagesLayout;
