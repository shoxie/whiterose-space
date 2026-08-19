import { Snippet } from ".contentlayer/generated";
import { motion, useScroll } from "framer-motion";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import Header from "../Pages/components/header";
import Footer from "../Pages/components/footer";

export default function SnippetLayout({
  children,
  snippet,
}: {
  children: React.ReactNode;
  snippet: Snippet;
}) {
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

  return (
    <div>
      <div className="fixed top-0 left-0 z-50 w-full">
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
      <Header />
      <div className="max-w-screen-lg px-5 mx-auto lg:px-0">
        <article>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-subtle">
            {moment(snippet.date).format("LL")}
          </p>
          <div className="flex items-center gap-3 mb-4 mt-2">
            <img
              src={snippet.logo}
              alt=""
              className="object-contain rounded-full w-14"
            />
            <h1 className="font-display text-3xl font-black text-pine md:text-5xl">
              {snippet.title}
            </h1>
          </div>
          <div className=" border-b border-highlightHigh pb-4">
            <p className="text-lg text-text">{snippet.description}</p>
          </div>
          <div className="mt-8 prose prose-xl" ref={ref}>
            {children}
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}
