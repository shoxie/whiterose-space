import StaticSharingan from "./StaticSharingan";

const UchihaSilhouette = ({ className }: { className?: string }) => {
  return (
    <div className={`pointer-events-none relative ${className ?? ""}`} aria-hidden="true">
      <svg viewBox="0 0 360 560" className="h-full w-full">
        <path
          d="M180 560 C130 480 108 400 118 330 C96 296 100 252 132 226 C148 214 212 214 228 226 C260 252 264 296 242 330 C252 400 230 480 180 560 Z"
          fill="#06040A"
        />
        <path
          d="M134 232 C128 200 138 170 162 156 C170 150 190 150 198 156 C222 170 232 200 226 232 C216 210 200 198 180 198 C160 198 144 210 134 232 Z"
          fill="#080510"
        />
        <path
          d="M180 560 C130 480 108 400 118 330 C96 296 100 252 132 226 C148 214 212 214 228 226 C260 252 264 296 242 330 C252 400 230 480 180 560 Z"
          fill="none"
          stroke="#E11D2E"
          strokeWidth="2.5"
          strokeOpacity="0.28"
        />
      </svg>
      <div className="absolute left-[53%] top-[33%] w-14 -translate-x-1/2 drop-shadow-[0_0_18px_rgba(255,46,77,0.8)]">
        <StaticSharingan />
      </div>
    </div>
  );
};

export default UchihaSilhouette;
