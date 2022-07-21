import Header from "./components/header";
import Footer from "./components/footer";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

type Props = {
  children: React.ReactNode;
};

const DefaultLayout = ({ children }: Props) => {
  const router = useRouter();
  
  return (
    <>
      {/* <Header /> */}
      <AnimatePresence initial={false} exitBeforeEnter>
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
          <motion.main>{children}</motion.main>
        </motion.div>
      </AnimatePresence>
      {/* <Footer /> */}
    </>
  );
};

export default DefaultLayout;