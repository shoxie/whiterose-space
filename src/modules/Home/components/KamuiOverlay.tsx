import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useDeviceTier, getDprForTier } from "@/hooks/useDeviceCapabilities";

// ─────────────────────────────────────────────────────────────────────────────
// Kamui — Screen-space vortex shader + particle absorption
// Implements: polar swirl offset = swirl(UV, distance, intensity, speed)
//             black-hole core + chromatic aberration + rim refraction
//             page transition masking (suck into focal point)
// Spec: centered at target point (eyeAt % or mouse), intensity 0->1 over 1.1s
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  x?: number; // percent 0-100 (left)
  y?: number; // percent 0-100 (top)
  /** optional element to suck — if not provided, whole page is sucked via CSS scale */
  targetRef?: React.RefObject<HTMLElement>;
  onComplete?: () => void;
  /** controlled progress 0->1 (from useKamuiTransition). If provided, internal RAF is bypassed */
  progress?: import("framer-motion").MotionValue<number>;
  /** shared intensity ref for shader — when progress provided, this is driven by progress */
  intensityRef?: React.MutableRefObject<number>;
};

// ── GLSL Vortex ────────────────────────────────────────────────────────────
const vortexVert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const vortexFrag = `
precision highp float;
varying vec2 vUv;
uniform vec2 uCenter;    // 0..1, y 0 at bottom
uniform float uTime;
uniform float uIntensity; // 0..1
uniform float uRadius;    // 0..1
uniform vec2 uResolution;

// helpers
vec2 swirlUv(vec2 uv, vec2 center, float radius, float intensity, float time){
  vec2 d = uv - center;
  float dist = length(d);
  float pct = 1.0 - smoothstep(0.0, radius, dist); // 1 at center
  float decay = pow(pct, 2.2);
  float angle = intensity * 6.2831853 * decay * 1.42 + time * decay * 1.1;
  float s = sin(angle); float c = cos(angle);
  mat2 rot = mat2(c, -s, s, c);
  // inward collapse: radius shrinks toward center as intensity grows
  float collapse = 1.0 - decay * intensity * 0.42;
  return center + rot * d * collapse;
}

void main(){
  vec2 uv = vUv;
  vec2 center = uCenter;
  float intensity = clamp(uIntensity, 0.0, 1.0);
  float radius = max(uRadius, 0.12);

  // distance from vortex center (for ring/chromatic masks)
  vec2 d = uv - center;
  float dist = length(d);
  float pctCenter = 1.0 - smoothstep(0.0, radius, dist);

  // swirled sampling coordinate
  vec2 suv = swirlUv(uv, center, radius, intensity, uTime);
  vec2 suvR = swirlUv(uv + vec2(0.004,0.0), center, radius, intensity, uTime);
  vec2 suvB = swirlUv(uv - vec2(0.004,0.0), center, radius, intensity, uTime);

  // ── procedural spiral pattern (polar sin) ──
  // Use swirled polar coords to generate tight spiral lines
  vec2 p = suv - center;
  float r = length(p);
  float theta = atan(p.y, p.x);
  // 3-arm spiral: phase = theta*3 + r*22 - time*3
  float spiral = sin(theta*3.0 + r*22.0 - uTime*3.4) * exp(-r*2.8);
  float spiral2 = sin(theta*2.0 - r*16.0 + uTime*2.1) * exp(-r*3.2);
  // tighten near center
  float tight = pow(pctCenter, 0.62);
  spiral *= tight;
  spiral2 *= tight * 0.55;

  // r/G/B — chromatic aberration sampled on offset UVs (rim only)
  float rim = smoothstep(0.14, 0.28, dist) * smoothstep(0.68, 0.32, dist) * intensity;
  float cr = sin(atan((suvR - center).y, (suvR - center).x)*3.0 + length(suvR-center)*22.0 - uTime*3.4) * exp(-length(suvR-center)*2.8) * tight;
  float cb = sin(atan((suvB - center).y, (suvB - center).x)*3.0 + length(suvB-center)*22.0 - uTime*3.4) * exp(-length(suvB-center)*2.8) * tight;

  // base palette — deep near-black with crimson spiral
  vec3 bg = vec3(0.012, 0.008, 0.014);
  vec3 spiralCol = vec3(1.0, 0.12, 0.26);
  vec3 spiralCol2 = vec3(0.52, 0.82, 0.80); // teal counter-swirl
  vec3 col = bg;
  col = mix(col, spiralCol, clamp(spiral*0.55 + 0.5, 0.0, 1.0) * intensity * (0.72 + rim*0.35));
  col = mix(col, spiralCol2, clamp(spiral2*0.42 + 0.5, 0.0, 1.0) * intensity * 0.28);
  // chromatic rim tint
  col.r += cr * 0.08 * rim;
  col.b += cb * 0.06 * rim;
  // radial falloff — vignette around vortex
  float vignette = 1.0 - smoothstep(0.35, 1.15, dist) * 0.55 * intensity;
  col *= vignette;
  // inner glow near center
  float innerGlow = exp(-r*9.0) * 0.55 * intensity;
  col += vec3(1.0, 0.18, 0.32) * innerGlow;

  // black-hole core — smooth disc
  float hole = smoothstep(0.045, 0.018, r) * intensity;
  // outer hole rim darkening
  float holeRim = smoothstep(0.09, 0.05, r) * smoothstep(0.02, 0.06, r) * intensity;
  col = mix(col, vec3(0.0), hole*0.98);
  // thin crimson ring at event horizon
  float eventRing = smoothstep(0.006, 0.0, abs(r - 0.032) - 0.004) * intensity;
  col += vec3(1.0, 0.14, 0.30) * eventRing * 0.65;
  col = mix(col, vec3(0.02,0.01,0.015), holeRim*0.35);

  // edge refraction shimmer (subtle)
  float refract = sin(theta*12.0 + r*38.0 - uTime*6.0) * 0.015 * rim * intensity;
  col += vec3(refract);

  // global fade in with intensity (avoid flash)
  float alpha = 0.92 + 0.08*intensity;
  // fade out far from vortex to keep page visible at edges early
  alpha *= mix(0.0, 1.0, smoothstep(0.0, 0.18, intensity));

  gl_FragColor = vec4(col, alpha);
}
`;

// ── Fullscreen quad mesh ────────────────────────────────────────────────────
function VortexPlane({ center, intensityRef }: { center: THREE.Vector2; intensityRef: React.MutableRefObject<number> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uCenter: { value: center.clone() },
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uRadius: { value: 0.42 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033);
    uniforms.uTime.value += dt;
    // lerp intensity for silk-smooth ramp (avoid step)
    uniforms.uIntensity.value = THREE.MathUtils.lerp(uniforms.uIntensity.value, intensityRef.current, 0.09);
    // animate radius slightly with intensity
    uniforms.uRadius.value = 0.38 + intensityRef.current * 0.14 + Math.sin(uniforms.uTime.value * 0.9) * 0.012;
    // sync resolution for DPR-aware effects (not strictly needed but reserved)
    const { width, height } = state.size;
    uniforms.uResolution.value.set(width, height);
    // keep center in sync if window resized (center is ref, copied each frame)
    uniforms.uCenter.value.copy(center);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vortexVert}
        fragmentShader={vortexFrag}
        uniforms={uniforms}
        transparent={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// ── Particles — lightweight absorption physics ───────────────────────────────
function KamuiParticles({ center, intensityRef }: { center: THREE.Vector2; intensityRef: React.MutableRefObject<number> }) {
  const tier = useDeviceTier();
  const count = tier === "low" ? 42 : 90;
  const pointsRef = useRef<THREE.Points>(null);
  const geomRef = useRef<THREE.BufferGeometry>(null);

  // positions in clip space -1..1 (planeGeometry 2x2 maps directly to NDC)
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      const rad = 0.35 + Math.random() * 0.85; // in NDC units (half-screen)
      const cx = center.x * 2 - 1;
      const cy = center.y * 2 - 1;
      pos[i * 3] = cx + Math.cos(ang) * rad;
      pos[i * 3 + 1] = cy + Math.sin(ang) * rad;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
      vel[i * 3] = -Math.sin(ang) * (0.12 + Math.random() * 0.18);
      vel[i * 3 + 1] = Math.cos(ang) * (0.12 + Math.random() * 0.18);
      vel[i * 3 + 2] = 0;
    }
    return { positions: pos, velocities: vel };
  }, [center]);

  const posAttr = useRef<THREE.BufferAttribute | null>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.033) * 60; // normalize to ~60fps units
    const intensity = intensityRef.current;
    const cx = center.x * 2 - 1;
    const cy = center.y * 2 - 1;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const x = positions[ix];
      const y = positions[ix + 1];
      const dx = cx - x;
      const dy = cy - y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const normX = dx / dist;
      const normY = dy / dist;
      // tangential component (perp to radial)
      const tx = -normY;
      const ty = normX;
      // pull increases as we near center (inverse distance² but clamped)
      const pull = 0.0028 * (1.0 + intensity * 2.2) * (1.0 / (0.18 + dist * 1.8));
      const swirl = 0.0065 * (0.6 + intensity * 0.9);
      // decay factor — tighten spiral as we collapse
      const decay = Math.pow(1.0 - Math.min(dist / 1.4, 1.0), 1.6);
      velocities[ix] += (tx * swirl * decay + normX * pull * decay) * dt;
      velocities[ix + 1] += (ty * swirl * decay + normY * pull * decay) * dt;
      // damping
      velocities[ix] *= 0.987;
      velocities[ix + 1] *= 0.987;
      positions[ix] += velocities[ix] * dt * 0.42;
      positions[ix + 1] += velocities[ix + 1] * dt * 0.42;

      if (dist < 0.035) {
        const ang = Math.random() * Math.PI * 2;
        const rad = 0.82 + Math.random() * 0.62;
        positions[ix] = cx + Math.cos(ang) * rad;
        positions[ix + 1] = cy + Math.sin(ang) * rad;
        velocities[ix] = -Math.sin(ang) * (0.12 + Math.random() * 0.18);
        velocities[ix + 1] = Math.cos(ang) * (0.12 + Math.random() * 0.18);
      }
    }
    if (posAttr.current) {
      posAttr.current.needsUpdate = true;
    }
    if (pointsRef.current) {
      // fade particles with intensity
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.12 + intensity * 0.58;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          ref={posAttr as any}
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.0}
        color="#E8D9C8"
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexColors={false}
      />
    </points>
  );
}

// ── Overlay wrapper (keeps previous SVG for glow + new shader underneath) ──
const KamuiOverlay = ({ x = 44.28, y = 33.56, onComplete, progress, intensityRef: controlledRef }: Props) => {
  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tier = useDeviceTier();
  const dpr = getDprForTier(tier);

  // center in shader space 0..1 (uv origin bottom-left)
  // DOM x% is from left, y% from top — flip y for uv
  const center = useMemo(() => new THREE.Vector2(x / 100, 1 - y / 100), [x, y]);
  const internalRef = useRef(0);
  const intensityRef = controlledRef ?? internalRef;

  const isControlled = !!progress;

  useEffect(() => {
    if (isControlled && progress) {
      // sync from external MotionValue
      const unsub = progress.on("change", (v) => {
        intensityRef.current = v;
      });
      // also catch initial value
      intensityRef.current = progress.get();
      return () => unsub();
    }
    if (prefersReduced) {
      intensityRef.current = 1;
      onComplete?.();
      return;
    }
    // ramp intensity 0->1 (uncontrolled mode)
    let raf = 0;
    const start = performance.now();
    const dur = 1080;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      // ease: [0.7,0,0.3,1] approximation
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      intensityRef.current = eased;
      if (t < 1) raf = requestAnimationFrame(tick);
      else onComplete?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReduced, onComplete, isControlled, progress, intensityRef]);

  if (prefersReduced) {
    return (
      <motion.div
        className="fixed inset-0 z-[2000] bg-[#020208]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28 }}
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.div
      data-testid="kamui-overlay"
      className="fixed inset-0 z-[2000] overflow-hidden bg-[#020208]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.28 }}
      aria-hidden="true"
    >
      {/* WebGL vortex — fills screen, centered at eye */}
      <div className="absolute inset-0" data-testid="kamui-vortex-canvas">
        <Canvas
          dpr={dpr as any}
          gl={{ antialias: false, alpha: false, powerPreference: tier === "low" ? "low-power" : "high-performance" }}
          camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x020208, 1);
            gl.domElement.setAttribute("data-testid", "kamui-webgl-canvas");
          }}
        >
          <VortexPlane center={center} intensityRef={intensityRef} />
          <KamuiParticles center={center} intensityRef={intensityRef} />
        </Canvas>
      </div>

      {/* SVG spirals overlay for crisp vector detail (composited over shader) */}
      <div
        className="pointer-events-none absolute h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${x}%`, top: `${y}%` }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          initial={{ rotate: 0, scale: 0.08, opacity: 0 }}
          animate={{ rotate: -720, scale: 1, opacity: 0.9 }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <path
            d={spiralPath(5, 1.15)}
            fill="none"
            stroke="#1A0A12"
            strokeWidth="7.5"
            strokeLinecap="round"
            opacity="0.95"
          />
        </motion.svg>

        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          initial={{ rotate: 18, scale: 0.06, opacity: 0 }}
          animate={{ rotate: 620, scale: 1, opacity: 1 }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="kamui-red" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF1840" stopOpacity="0" />
              <stop offset="22%" stopColor="#FF1840" stopOpacity="1" />
              <stop offset="78%" stopColor="#FF3B57" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFB3C0" stopOpacity="0" />
            </linearGradient>
            <filter id="kamui-glow">
              <feGaussianBlur stdDeviation="0.7" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d={spiralPath(3.2, 1)}
            fill="none"
            stroke="url(#kamui-red)"
            strokeWidth="1.9"
            strokeLinecap="round"
            filter="url(#kamui-glow)"
            opacity="0.96"
          />
          <path
            d={spiralPath(3.2, 1)}
            fill="none"
            stroke="#FF6B7A"
            strokeWidth="0.45"
            strokeLinecap="round"
            opacity="0.5"
          />
        </motion.svg>

        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full opacity-60"
          initial={{ rotate: -24, scale: 0.1 }}
          animate={{ rotate: -540, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          aria-hidden="true"
        >
          <path
            d={spiralPath(2.6, -0.92)}
            fill="none"
            stroke="#7EC8C0"
            strokeWidth="0.9"
            strokeLinecap="round"
            opacity="0.32"
          />
        </motion.svg>

        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-[42%] h-[16%] w-[16%]"
          initial={{ rotate: 0 }}
          animate={{ rotate: 900 }}
          transition={{ duration: 1.1, ease: "linear" }}
          aria-hidden="true"
        >
          <path
            d={spiralPath(2, 1)}
            fill="none"
            stroke="#FF1840"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </motion.svg>

        <motion.div
          className="absolute left-1/2 top-1/2 h-[3.2%] w-[3.2%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_18px_rgba(0,0,0,0.9),0_0_32px_rgba(255,24,64,0.45)]"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.42 }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[1.1%] w-[1.1%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF3B57]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.32, duration: 0.28 }}
          aria-hidden="true"
        />
      </div>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_38%,_rgba(2,2,8,0.88)_78%)]" />

      {/* sucking distortion rings — same origin */}
      <motion.div
        className="absolute h-[18vmax] w-[18vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF3B57]/15"
        style={{ left: `${x}%`, top: `${y}%` }}
        initial={{ scale: 0.2, opacity: 0.7 }}
        animate={{ scale: 4.2, opacity: 0 }}
        transition={{ duration: 1.05, ease: "easeOut", delay: 0.12 }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute h-[18vmax] w-[18vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        style={{ left: `${x}%`, top: `${y}%` }}
        initial={{ scale: 0.2, opacity: 0.5 }}
        animate={{ scale: 5.6, opacity: 0 }}
        transition={{ duration: 1.05, ease: "easeOut", delay: 0.28 }}
        aria-hidden="true"
      />
    </motion.div>
  );
};

function spiralPath(turns = 3, tightness = 1) {
  const pts: string[] = [];
  const N = 320;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const easedT = 1 - Math.pow(1 - t, 1.6);
    const a = t * turns * 2 * Math.PI * tightness;
    const r = 1 + 46 * easedT;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(" L")}`;
}

// ── Hook + helper for element sucking ──────────────────────────────────────
// Usage:
// const { trigger, overlay } = useKamui()
// <div ref={ref}>content</div>
// <button onClick={()=>trigger(ref)}>Kamui!</button>
// {overlay}

export function useKamui() {
  const targetRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [center, setCenter] = useState({ x: 50, y: 50 });

  const trigger = (ref?: React.RefObject<HTMLElement>, mouseEvent?: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(false);
      return;
    }
    let x = 50,
      y = 50;
    if (mouseEvent) {
      x = (mouseEvent.clientX / window.innerWidth) * 100;
      y = (mouseEvent.clientY / window.innerHeight) * 100;
    } else if (ref?.current) {
      const r = ref.current.getBoundingClientRect();
      x = ((r.left + r.width / 2) / window.innerWidth) * 100;
      y = ((r.top + r.height / 2) / window.innerHeight) * 100;
    } else if (targetRef.current) {
      const r = targetRef.current.getBoundingClientRect();
      x = ((r.left + r.width / 2) / window.innerWidth) * 100;
      y = ((r.top + r.height / 2) / window.innerHeight) * 100;
    }
    setCenter({ x, y });
    setActive(true);
  };

  const overlay = active ? <KamuiOverlay x={center.x} y={center.y} onComplete={() => setActive(false)} /> : null;

  // helper to get suck transform for target element (CSS fallback masking)
  const suckStyle = (isActive: boolean): React.CSSProperties =>
    isActive
      ? {
          transformOrigin: `${center.x}% ${center.y}%`,
          transform: "scale(0.04) rotate(1080deg)",
          filter: "blur(14px)",
          opacity: 0,
          transition: "transform 1.08s cubic-bezier(0.7,0,0.3,1), filter 1.08s, opacity 0.9s",
        }
      : {};

  return { targetRef, active, center, trigger, overlay, suckStyle, setActive };
}

export default KamuiOverlay;
