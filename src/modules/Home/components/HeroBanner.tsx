import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Texts = [
  "Hello, I'm Tuan Anh",
  "I'm a frontend developer",
  "I don't know what to put here",
  "Please help me improve this :(",
];

const HeroBanner = () => {
  const [selectedText, setSelectedText] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedText(selectedText + 1);
      if (selectedText === Texts.length - 1) {
        setSelectedText(0);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedText]);

  return (
    <div className="relative flex-col items-center hidden lg:flex">
      {Texts.map((text, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: Texts[selectedText] === text ? 1 : 0,
            y: -100,
          }}
          animate={{
            opacity: Texts[selectedText] === text ? 1 : 0,
            y: Texts[selectedText] === text ? 0 : 100,
          }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
          className="absolute text-lg font-bold lg:text-3xl"
        >
          <h1>{text}</h1>
        </motion.div>
      ))}
    </div>
  );
};

export default HeroBanner;
