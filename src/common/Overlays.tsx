import { useEffect, useRef } from "react";

/**
 * Overlay trio ported verbatim from F:/code/portfolio.
 * Grain + Scanline are pure decoration; ScrollProgress tracks scroll depth.
 */

export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}

export function Scanline() {
  return <div className="scanline" aria-hidden="true" />;
}

export function ScrollProgress() {
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (bar.current) {
        bar.current.style.width =
          (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
      }
      ticking = false;
    };
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <i ref={bar} />
    </div>
  );
}
