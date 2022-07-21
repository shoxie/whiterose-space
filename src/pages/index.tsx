import Link from "next/link";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import DefaultLayout from "@/layouts/Default";

const TransitionLTR = {
  initial: {
    opacity: 0,
    x: -100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const TransitionRTL = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const Home = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "moon" ? "dawn" : "moon");
  };

  return (
    <AnimatePresence exitBeforeEnter>
      <div className="relative h-screen px-16 py-10 mx-auto max-w-scren-xl">
        <div
          className="absolute right-0 flex flex-row items-center px-16 space-y-5 text-lg -translate-y-1/2 top-1/2"
          style={{
            textOrientation: "mixed",
            writingMode: "vertical-lr",
          }}
        >
          <Link href="/about" passHref>
            <a>About</a>
          </Link>
          <Link href="/about" passHref>
            <a>About</a>
          </Link>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className="flex flex-row items-center justify-between">
            <motion.div
              variants={TransitionLTR}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Link href="/" passHref>
                <a className="text-2xl font-bold">WR</a>
              </Link>
            </motion.div>
            <span className="text-lg">say hi.</span>
          </div>
          <div className="flex flex-row items-center justify-between text-lg font-semibold">
            <motion.button
              type="button"
              onClick={toggleTheme}
              variants={TransitionLTR}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              toggle themes.
            </motion.button>
            <div className="flex flex-row space-x-3">
              <a href="">Facebook</a>
              <a href="">Linkedin</a>
              <a href="">Call me</a>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

Home.Layout = DefaultLayout;

export default Home;