import React, { useCallback, useRef, useState } from "react";
import { animate, useMotionValue, useTransform, MotionValue } from "framer-motion";
import KamuiOverlay from "@/modules/Home/components/KamuiOverlay";

export type KamuiOrigin = { x: number; y: number }; // percent 0..100

export function useKamuiTransition(options?: {
  durationMs?: number;
  onComplete?: () => void;
}) {
  const duration = options?.durationMs ?? 1080;
  const [active, setActive] = useState(false);
  const [origin, setOrigin] = useState<KamuiOrigin>({ x: 50, y: 50 });
  const progress: MotionValue<number> = useMotionValue(0);
  const intensityRef = useRef(0);

  // Keep intensityRef in sync with motion value (for WebGL shader which reads ref)
  const scale = useTransform(progress, [0, 1], [1, 0.04]);
  const rotate = useTransform(progress, [0, 1], [0, 1080]);
  const opacity = useTransform(progress, [0, 0.82, 1], [1, 1, 0]);
  const blurPx = useTransform(progress, [0, 1], [0, 14]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);
  const pageStyle = { scale, rotate, opacity, filter };

  const start = useCallback(
    (o: KamuiOrigin, done?: () => void) => {
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        done?.();
        options?.onComplete?.();
        return;
      }
      if (active) return;
      setOrigin(o);
      setActive(true);
      progress.set(0);
      intensityRef.current = 0;

      // drive progress 0->1
      const controls = animate(progress, 1, {
        duration: duration / 1000,
        ease: [0.7, 0, 0.3, 1],
      });

      // keep intensityRef mirrored for shader (rAF loop will lerp, but we also directly set)
      const unsub = progress.on("change", (v) => {
        intensityRef.current = v;
      });

      window.setTimeout(() => {
        unsub();
        controls.stop();
        done?.();
        options?.onComplete?.();
        // keep overlay up until caller unmounts; we auto-reset after 400ms fade? caller controls
      }, duration);
    },
    [active, duration, progress, options]
  );

  const reset = useCallback(() => {
    setActive(false);
    progress.set(0);
    intensityRef.current = 0;
  }, [progress]);

  const overlay = active ? (
    // @ts-ignore — KamuiOverlay supports controlledProgress for sync
    <KamuiOverlay x={origin.x} y={origin.y} progress={progress} intensityRef={intensityRef} onComplete={reset} />
  ) : null;

  return {
    active,
    isTransitioning: active,
    origin,
    progress,
    intensityRef,
    pageStyle,
    start,
    reset,
    overlay,
  };
}
