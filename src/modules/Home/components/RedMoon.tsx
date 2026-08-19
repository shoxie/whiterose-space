import { useId } from "react";

const RedMoon = ({ className }: { className?: string }) => {
  const id = useId().replace(/:/g, "");
  const moonId = `moon-${id}`;
  return (
    <div className={`relative ${className ?? ""}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[#E11D2E]/20 blur-3xl" />
      <svg
        viewBox="0 0 200 200"
        className="relative h-full w-full drop-shadow-[0_0_70px_rgba(225,29,46,0.45)]"
      >
        <defs>
          <radialGradient id={moonId} cx="38%" cy="34%">
            <stop offset="0%" stopColor="#FF5C6E" />
            <stop offset="55%" stopColor="#C41F38" />
            <stop offset="100%" stopColor="#5E0B1B" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill={`url(#${moonId})`} />
        <g fill="#8F1227" opacity="0.45">
          <ellipse cx="128" cy="88" rx="14" ry="10" />
          <ellipse cx="150" cy="118" rx="9" ry="7" />
          <ellipse cx="105" cy="128" rx="11" ry="8" />
          <ellipse cx="82" cy="74" rx="7" ry="5" />
        </g>
      </svg>
    </div>
  );
};

export default RedMoon;
