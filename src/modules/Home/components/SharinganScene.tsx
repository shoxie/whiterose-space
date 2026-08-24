import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getDprForTier, useDeviceTier, shouldUseWebGL } from "@/hooks/useDeviceCapabilities";
import StaticSharingan from "./StaticSharingan";

// ─────────────────────────────────────────────────────────────────────────────
// Sharingan — 4-state machine + procedural shader
// State 0: Sclera + brown iris (normal eye)
// State 1: Spin-up — iris lerp to #E60000, tomoe spin & lock
// State 2: Mangekyo — tomoe bleed into blade pattern
// State 3: Idle pulse — subtle bloom / emissive
// Interaction: hover | click | scroll-trigger (IntersectionObserver) | auto
// ─────────────────────────────────────────────────────────────────────────────

export type SharinganState = 0 | 1 | 2 | 3;

type Props = {
  onEnter?: () => void;
  className?: string;
  /** external control — if provided, internal machine is bypassed */
  state?: SharinganState;
  /** how activation is triggered when uncontrolled */
  trigger?: "hover" | "click" | "scroll" | "auto";
};

// ── GLSL ────────────────────────────────────────────────────────────────────
const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uActivation; // 0..1 : State 0 -> 1
uniform float uMorph;      // 0..1 : State 1 -> 2
uniform float uPulse;      // 0..1 : State 3 breathing
uniform float uSpin;

const vec3 C_SCLERA = vec3(0.96,0.94,0.90);
const vec3 C_IRIS_BROWN0 = vec3(0.42,0.22,0.14);
const vec3 C_IRIS_BROWN1 = vec3(0.28,0.16,0.10);
const vec3 C_IRIS_RED0 = vec3(1.0,0.08,0.18);
const vec3 C_IRIS_RED1 = vec3(0.62,0.04,0.14);
const vec3 C_IRIS_RED2 = vec3(0.18,0.02,0.05);
const vec3 C_TOMOE = vec3(0.02,0.01,0.02);
const vec3 C_MANGEKYO = vec3(0.02,0.01,0.02);

// tomoe SDF — comma shape via two circles + cut
float tomoeSDF(vec2 p, float r){
  // head circle
  float dHead = length(p) - r*0.38;
  // tail offset circle
  vec2 tc = vec2(r*0.20, 0.0);
  float dTail = length(p - tc) - r*0.52;
  float d = min(dHead, dTail);
  // inner cut to form crescent
  float dCut = length(p + vec2(r*0.10, 0.0)) - r*0.20;
  return max(d, -dCut);
}

// mangekyo blade SDF — 3-fold radial blades
float mangekyoSDF(vec2 p){
  float a = atan(p.y, p.x);
  float r = length(p);
  // normalize to 0..120deg wedge
  float wedge = 2.0943951; // 120°
  a = mod(a + wedge*0.5, wedge) - wedge*0.5;
  a = abs(a);
  // blade is thin triangle curving outward
  float blade = r - (0.22 + a*0.52);
  // thin edge
  float edge = abs(a - 0.18 - r*0.28) - 0.06*(1.0 - r*0.5);
  // combine
  float d = max(blade, -edge);
  // center triangle hole negative
  float center = r - 0.06;
  d = min(d, center);
  return d;
}

void main(){
  vec2 uv = vUv * 2.0 - 1.0;
  float d = length(uv);

  // masks
  float irisMask = smoothstep(0.92, 0.88, d);
  float pupilMask = smoothstep(0.19, 0.17, d);
  float scleraMask = 1.0 - irisMask;

  // base iris color — brown -> red with activation
  vec3 irisCol = mix(
    mix(C_IRIS_BROWN0, C_IRIS_BROWN1, smoothstep(0.0,0.7,d)),
    mix(mix(C_IRIS_RED0, C_IRIS_RED1, smoothstep(0.0,0.45,d)), C_IRIS_RED2, smoothstep(0.65,0.92,d)),
    uActivation
  );
  // sclera outside iris
  vec3 col = mix(irisCol, C_SCLERA, scleraMask * (1.0 - uActivation*0.85));
  // desaturate sclera when activated
  if(uActivation > 0.5){
    col = mix(col, irisCol, smoothstep(0.88,0.92,d) * uActivation);
  }
  // pupil (always black, rim light)
  col = mix(col, vec3(0.01,0.005,0.015), pupilMask * 0.96);
  // iris rim dark ring
  float rim = smoothstep(0.885,0.88,d) * smoothstep(0.82,0.86,d);
  col = mix(col, vec3(0.04,0.01,0.02), rim * 0.9);

  // ── Tomoe / Mangekyo layer (in iris) ──
  if(irisMask > 0.01){
    // rotate domain by spin
    float s = sin(uSpin), c = cos(uSpin);
    mat2 R = mat2(c,-s,s,c);
    vec2 ru = R * uv;

    float tomoeField = 1.0;
    for(int i=0;i<3;i++){
      float ang = 1.5707963 + float(i)*2.0943951;
      vec2 ctr = vec2(cos(ang), sin(ang)) * 0.42;
      vec2 lp = ru - ctr;
      // rotate each tomoe to point tangentially
      float ca = cos(ang+1.5708), sa = sin(ang+1.5708);
      mat2 RT = mat2(ca,-sa,sa,ca);
      lp = RT * lp;
      float sd = tomoeSDF(lp, 0.155);
      // shave for tomoe tear size — attenuation with morph
      tomoeField = min(tomoeField, sd);
    }
    float tomoeMask = smoothstep(0.008, -0.008, tomoeField);
    // mangekyo pattern in same domain
    float mSDF = mangekyoSDF(ru);
    float mangeMask = smoothstep(0.012, -0.006, mSDF);
    // circumference ring for mangekyo
    float ring = smoothstep(0.015, -0.005, abs(d - 0.62) - 0.011);
    mangeMask = max(mangeMask, ring*0.85);

    // cross-fade: tomoe -> mangekyo with uMorph
    float tomoeAlpha = tomoeMask * (1.0 - uMorph) * step(d, 0.78) * irisMask;
    float mangeAlpha = mangeMask * uMorph * step(d, 0.82) * irisMask;

    col = mix(col, C_TOMOE, tomoeAlpha*0.96);
    col = mix(col, C_MANGEKYO, mangeAlpha*0.96);
  }

  // subtle highlight (Cornea reflection)
  vec2 hl = uv - vec2(-0.22, 0.28);
  float highlight = exp(-dot(hl,hl)*42.0) * 0.18 * irisMask * (0.5 + 0.5*uActivation);
  col += vec3(1.0,0.92,0.92) * highlight;

  // idle pulse emissive bloom (state 3)
  col += vec3(1.0,0.22,0.32) * 0.14 * exp(-d*2.8) * uPulse * irisMask;
  // activation glow intensifies
  col += vec3(1.0,0.18,0.28) * 0.08 * uActivation * exp(-d*3.2);

  float alpha = irisMask * 0.985 + scleraMask * (1.0 - uActivation*0.08);
  // feather outer edge
  alpha *= smoothstep(0.98, 0.88, d);
  gl_FragColor = vec4(col, alpha);
}
`;

// ── Eye Mesh ────────────────────────────────────────────────────────────────

function EyeMesh({
  onEnter,
  targetState,
  reduced,
}: {
  onEnter?: () => void;
  targetState: SharinganState;
  reduced: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);

  // uniforms — single source of truth, lerped in rAF (no React re-render per frame)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uActivation: { value: 0 },
      uMorph: { value: 0 },
      uPulse: { value: 0 },
      uSpin: { value: 0 },
    }),
    []
  );

  // internal animated values (avoid React state thrash)
  const anim = useRef({ activation: 0, morph: 0, spin: 0, pulse: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033);
    uniforms.uTime.value += dt;

    const t = targetState;
    const targetActivation = t >= 1 ? 1 : t === 0 ? 0 : 0;
    const targetMorph = t >= 2 ? 1 : 0;
    const targetPulse = t >= 3 ? 1 : 0;

    // reduced-motion: snap instantly, no spin
    if (reduced) {
      anim.current.activation = targetActivation;
      anim.current.morph = targetMorph;
      anim.current.pulse = targetPulse ? 0.28 : 0;
      anim.current.spin = 0;
    } else {
      // critically damped lerp
      anim.current.activation = THREE.MathUtils.lerp(anim.current.activation, targetActivation, 0.08);
      anim.current.morph = THREE.MathUtils.lerp(anim.current.morph, targetMorph, 0.05);
      // spin: continuous when active, eased lock when inactive
      const spinSpeed = t >= 1 ? 1.35 : 0.0;
      anim.current.spin += dt * spinSpeed;
      // add wobble on activation start
      if (t === 1 && anim.current.activation < 0.92) {
        anim.current.spin += dt * 4.0 * (1.0 - anim.current.activation);
      }
      // pulse breathing
      const pulseTarget = targetPulse ? (0.55 + Math.sin(uniforms.uTime.value * 1.9) * 0.45) : 0;
      anim.current.pulse = THREE.MathUtils.lerp(anim.current.pulse, pulseTarget, 0.06);
    }

    uniforms.uActivation.value = anim.current.activation;
    uniforms.uMorph.value = anim.current.morph;
    uniforms.uPulse.value = anim.current.pulse;
    uniforms.uSpin.value = anim.current.spin;

    if (!groupRef.current) return;
    if (reduced) return;
    // flat spin + subtle pointer follow (same feel as before)
    groupRef.current.rotation.z = anim.current.spin * 0.18; // slow overall disc spin
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.09, 0.06);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.pointer.x * -0.11, 0.06);
  });

  // dispose safety
  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <group ref={groupRef}>
      {/* primary iris disc */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onEnter?.();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <circleGeometry args={[1.02, 64]} />
        {/* ShaderMaterial - use raw to avoid 3 includes cost */}
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* outer additive glow — visibility tied to activation via opacity in JSX */}
      <Glow activationRef={anim} reduced={reduced} />
    </group>
  );
}

function Glow({
  activationRef,
  reduced,
}: {
  activationRef: React.MutableRefObject<{ activation: number; pulse: number }>;
  reduced: boolean;
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (!matRef.current || reduced) return;
    matRef.current.opacity = 0.10 + activationRef.current.activation * 0.16 + activationRef.current.pulse * 0.06;
  });
  return (
    <mesh position={[0, 0, -0.02]}>
      <circleGeometry args={[1.34, 32]} />
      <meshBasicMaterial
        ref={matRef}
        color="#FF1840"
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Public component ───────────────────────────────────────────────────────
export default function SharinganScene({ onEnter, className, state, trigger = "hover" }: Props) {
  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tier = useDeviceTier();
  const hasWebGL = shouldUseWebGL();
  const dpr = getDprForTier(tier);
  const antialias = tier === "high" && hasWebGL;
  const [internalState, setInternalState] = useState<SharinganState>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isControlled = state !== undefined;
  const activeState = isControlled ? state! : internalState;

  // scroll trigger via IntersectionObserver
  useEffect(() => {
    if (isControlled || trigger !== "scroll") return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInternalState((s) => (s === 0 ? 1 : s));
          // progress to mangekyo then idle
          window.setTimeout(() => setInternalState((s) => (s === 1 ? 2 : s)), 900);
          window.setTimeout(() => setInternalState((s) => (s === 2 ? 3 : s)), 1650);
        }
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isControlled, trigger]);

  // hover trigger timers
  const hoverTimer = useRef<number | null>(null);
  const handlePointerEnter = () => {
    if (isControlled || trigger !== "hover") return;
    if (activeState !== 0) return;
    setInternalState(1);
    hoverTimer.current = window.setTimeout(() => {
      setInternalState((s) => (s === 1 ? 2 : s));
      window.setTimeout(() => setInternalState((s) => (s === 2 ? 3 : s)), 700);
    }, 820);
  };
  const handlePointerLeave = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    // keep locked once activated — no revert (feels more Uchiha)
  };
  const handleClick = () => {
    if (!isControlled && trigger === "click" && activeState === 0) {
      setInternalState(1);
      window.setTimeout(() => setInternalState(2), 700);
      window.setTimeout(() => setInternalState(3), 1350);
      // still fire enter after morph
      window.setTimeout(() => onEnter?.(), 420);
      return;
    }
    onEnter?.();
  };

  // auto play (idle demo)
  useEffect(() => {
    if (isControlled || trigger !== "auto") return;
    const t1 = window.setTimeout(() => setInternalState(1), 400);
    const t2 = window.setTimeout(() => setInternalState(2), 1250);
    const t3 = window.setTimeout(() => setInternalState(3), 1950);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [isControlled, trigger]);

  const canvasKey = prefersReduced ? "static" : "webgl";

  return (
    <div
      ref={containerRef}
      className={className}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      role="img"
      aria-label={
        activeState === 0
          ? "Sharingan eye — hover to activate"
          : activeState === 1
          ? "Sharingan activating — three tomoe spinning"
          : activeState === 2
          ? "Mangekyo Sharingan — pattern forming"
          : "Mangekyo Sharingan — chakra pulsing. Click to enter"
      }
    >
      {!hasWebGL || prefersReduced ? (
        <StaticSharingan className="h-full w-full p-1 drop-shadow-[0_0_14px_rgba(255,24,64,0.45)]" />
      ) : (
        <Canvas
          key={canvasKey}
          dpr={dpr as any}
          camera={{ position: [0, 0, 2.9], fov: 42 }}
          gl={{ antialias, alpha: true, powerPreference: tier === "low" ? "low-power" : "high-performance" }}
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            // a11y
            gl.domElement.setAttribute("role", "img");
            gl.domElement.setAttribute("aria-label", "Interactive Sharingan eye canvas");
          }}
          frameloop={prefersReduced ? "never" : "always"}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[2, 1.5, 3]} intensity={2.4} color="#FFD9DE" />
          <directionalLight position={[-2, 0, 2]} intensity={0.9} color="#8A2238" />
          <EyeMesh onEnter={handleClick} targetState={activeState} reduced={prefersReduced} />
        </Canvas>
      )}
    </div>
  );
}
