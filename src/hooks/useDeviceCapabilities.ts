import { useEffect, useState } from "react";

export type DeviceTier = "high" | "low";

export function isLowPowerDevice(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const nav = navigator as any;
  const mem = nav.deviceMemory; // 0.25 - 8
  const cores = nav.hardwareConcurrency;
  const conn = nav.connection as any;
  if (mem !== undefined && mem <= 4) return true;
  if (cores !== undefined && cores <= 4) return true;
  if (conn) {
    if (conn.saveData) return true;
    if (conn.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return true;
  }
  // coarse: slow single-core check via UA? fallback
  return false;
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("high");
  useEffect(() => {
    setTier(isLowPowerDevice() ? "low" : "high");
  }, []);
  return tier;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function getDprForTier(tier: DeviceTier): [number, number] {
  if (tier === "low") return [1, 1];
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  return [1, Math.min(dpr, 1.85)];
}

export function shouldUseWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl") || c.getContext("webgl2"));
  } catch {
    return false;
  }
}
