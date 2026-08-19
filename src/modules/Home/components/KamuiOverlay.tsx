import { motion } from "framer-motion";

function spiralPath(turns = 3) {
  const pts: string[] = [];
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * turns * 2 * Math.PI;
    const r = 1 + 45 * t;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(" L")}`;
}

const KamuiOverlay = () => {
  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#050208]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.08 }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="h-[30vmax] w-[30vmax]"
        aria-hidden="true"
        initial={{ scale: 0.12, rotate: 0, opacity: 0.95 }}
        animate={{ scale: 14, rotate: 540 }}
        transition={{ duration: 1, ease: [0.55, 0.06, 0.2, 1] }}
      >
        <path
          d={spiralPath(3)}
          fill="none"
          stroke="#FF2E4D"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d={spiralPath(2.5)}
          fill="none"
          stroke="#FF6B7A"
          strokeWidth="0.8"
          opacity="0.45"
        />
      </motion.svg>
    </motion.div>
  );
};

export default KamuiOverlay;
