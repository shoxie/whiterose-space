import { AnimatePresence, motion, useScroll, Variants } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Footer from "./components/footer";
import Header from "./components/header";
import { AiOutlineArrowUp } from "react-icons/ai";

type Props = {
  children: React.ReactNode;
};

const PagesLayout = ({ children }: Props) => {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [cursorVariant, setCursorVariant] = useState("default");
  const [scrolled, setScrolled] = useState(0);
  const router = useRouter();
  const [percent, setpercent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

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

  const variants: Variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      transition: {
        duration: 0.1,
      },
    },
    text: {
      height: 150,
      width: 150,
      x: mousePosition.x - 75,
      y: mousePosition.y - 75,
      backgroundColor: "yellow",
      mixBlendMode: "difference",
    },
  };

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
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
  });

  const textEnter = () => setCursorVariant("text");
  const textLeave = () => setCursorVariant("default");

  return (
    <>
      <Header />
      <div className="fixed top-0 left-0 z-[9999] w-full">
        <motion.div
          animate={{ opacity: percent > 0 ? 1 : 0 }}
          className="h-1 bg-hightlight-high"
        >
          <motion.div
            className="h-1 bg-iris"
            animate={{ scaleX: percent }}
            style={{ originX: 0, originY: 0 }}
          />
        </motion.div>
      </div>
      <motion.div
        className="cursor"
        variants={variants}
        animate={cursorVariant}
      />
      <motion.button type="button"
        className="fixed p-4 border border-gray-400 rounded-full right-10"
        animate={{
          bottom: scrolled > 5 ? 40 : -100,
          transition: {
            duration: 0.5
          }
        }}
        style={{
          overflow: "hidden",
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth"})}
        aria-label="Scroll To Top"
      >
        <AiOutlineArrowUp className="text-xl" />
      </motion.button>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={router.asPath}
          initial={{
            opacity: 0,
            y: 50,
          }}
          layout
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          <motion.main className="max-w-screen-lg px-5 mx-auto lg:px-0" ref={ref}>
            {children}
          </motion.main>
        </motion.div>
      </AnimatePresence>
      <Footer />
    </>
  );
};

export default PagesLayout;
