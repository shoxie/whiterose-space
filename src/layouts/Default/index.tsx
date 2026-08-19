import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

type Props = {
  children: React.ReactNode;
};

const DefaultLayout = ({ children }: Props) => {
  const router = useRouter();
  
  return (
    <>
      <AnimatePresence initial={false}>
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
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default DefaultLayout;
