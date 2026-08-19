import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  onEnter?: () => void;
  className?: string;
};

function drawTomoe(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  thetaDeg: number,
  R: number
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const a0 = toRad(thetaDeg + 45);
  const a1 = toRad(thetaDeg + 195);
  const N = 24;

  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const a = a0 + (a1 - a0) * (i / N);
    const x = cx + (R + 9) * Math.cos(a);
    const y = cy + (R + 9) * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = N; i >= 0; i--) {
    const a = a0 + (a1 - a0) * (i / N);
    const w = 9 * (i / N);
    const x = cx + (R - w) * Math.cos(a);
    const y = cy + (R - w) * Math.sin(a);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    cx + R * Math.cos(toRad(thetaDeg)),
    cy + R * Math.sin(toRad(thetaDeg)),
    9,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function makeEyeTexture(maxAnisotropy: number) {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#07040B";
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const R = 300;

  const iris = ctx.createRadialGradient(cx, cy, 12, cx, cy, R);
  iris.addColorStop(0, "#FF3B57");
  iris.addColorStop(0.45, "#D81F3E");
  iris.addColorStop(0.8, "#8F1227");
  iris.addColorStop(1, "#2A0610");
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0A0306";
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.arc(cx, cy, R - 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#050208";
  ctx.beginPath();
  ctx.arc(cx, cy, 76, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#FF6B7A";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, 88, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#050208";
  for (let i = 0; i < 3; i++) {
    drawTomoe(ctx, cx, cy, 90 + i * 120, 165);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function Eye({ onEnter }: { onEnter?: () => void }) {
  const group = useRef<THREE.Group>(null);
  const gl = useThree((state) => state.gl);
  const texture = useMemo(
    () => makeEyeTexture(gl.capabilities.getMaxAnisotropy()),
    [gl]
  );

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.22;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.35 - 0.12,
      0.06
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      state.pointer.x * -0.12,
      0.06
    );
  });

  return (
    <group
      ref={group}
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
      <mesh>
        <sphereGeometry args={[1.02, 64, 48]} />
        <meshStandardMaterial
          map={texture ?? undefined}
          emissive="#FFFFFF"
          emissiveMap={texture ?? undefined}
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
      <mesh scale={1.16}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#E11D2E"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function SharinganScene({ onEnter, className }: Props) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 2.9], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 1.5, 3]} intensity={2.4} color="#FFD9DE" />
        <directionalLight position={[-2, 0, 2]} intensity={0.9} color="#8A2238" />
        <Eye onEnter={onEnter} />
      </Canvas>
    </div>
  );
}
