import { useId } from "react";

function tomoePath(theta: number, cx = 100, cy = 100, R = 38) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const pts: string[] = [];
  const N = 20;
  const a0 = toRad(theta + 45);
  const a1 = toRad(theta + 195);
  for (let i = 0; i <= N; i++) {
    const a = a0 + (a1 - a0) * (i / N);
    pts.push(`${cx + (R + 9) * Math.cos(a)},${cy + (R + 9) * Math.sin(a)}`);
  }
  for (let i = N; i >= 0; i--) {
    const a = a0 + (a1 - a0) * (i / N);
    const w = 9 * (i / N);
    pts.push(`${cx + (R - w) * Math.cos(a)},${cy + (R - w) * Math.sin(a)}`);
  }
  return `M${pts.join(" L")} Z`;
}

const StaticSharingan = ({ className }: { className?: string }) => {
  const id = useId().replace(/:/g, "");
  const glowId = `glow-${id}`;
  const irisId = `iris-${id}`;
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="#FF2E4D" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#B3122B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#B3122B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={irisId}>
          <stop offset="0%" stopColor="#FF3B57" />
          <stop offset="60%" stopColor="#C41F38" />
          <stop offset="100%" stopColor="#6E0D1F" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill={`url(#${glowId})`} />
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="#12040A"
        stroke="#2A0610"
        strokeWidth="2"
      />
      <circle
        cx="100"
        cy="100"
        r="62"
        fill={`url(#${irisId})`}
        stroke="#0A0205"
        strokeWidth="5"
      />
      <circle
        cx="100"
        cy="100"
        r="15"
        fill="#050208"
      />
      <circle
        cx="100"
        cy="100"
        r="15"
        fill="none"
        stroke="#FF6B7A"
        strokeWidth="1.5"
        opacity="0.7"
      />
      {[90, 210, 330].map((theta) => (
        <g key={theta}>
          <path d={tomoePath(theta)} fill="#050208" />
          <circle
            cx={100 + 38 * Math.cos((theta * Math.PI) / 180)}
            cy={100 + 38 * Math.sin((theta * Math.PI) / 180)}
            r="9"
            fill="#050208"
          />
        </g>
      ))}
    </svg>
  );
};

export default StaticSharingan;
