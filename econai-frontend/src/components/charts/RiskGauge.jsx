import { motion } from "framer-motion";
import CountUp from "react-countup";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ChartPanel from "../ChartPanel";

function riskLabel(percentage) {
  if (percentage < 30) return { text: "Low Risk", cls: "text-emerald-300", border: "border-emerald-400/25", bg: "bg-emerald-400/10" };
  if (percentage < 60) return { text: "Medium Risk", cls: "text-amber-300", border: "border-amber-400/25", bg: "bg-amber-400/10" };
  return { text: "High Risk", cls: "text-rose-300", border: "border-rose-400/25", bg: "bg-rose-400/10" };
}

function riskGradient(percentage) {
  if (percentage < 30) return ["#34d399", "#10b981"];
  if (percentage < 60) return ["#fbbf24", "#f59e0b"];
  return ["#fb7185", "#f43f5e"];
}

export default function RiskGauge({ risk = 0.22, loading = false }) {
  const percentage = risk * 100;
  const label = riskLabel(percentage);
  const [c1, c2] = riskGradient(percentage);

  // SVG semi-circle gauge
  const r = 70;
  const cx = 90;
  const cy = 90;
  const totalAngle = 180;
  const angle = (percentage / 100) * totalAngle;
  const toRad = (deg) => (deg * Math.PI) / 180;

  function arcPath(startDeg, endDeg, radius) {
    const s = toRad(startDeg);
    const e = toRad(endDeg);
    const x1 = cx + radius * Math.cos(Math.PI - s);
    const y1 = cy - radius * Math.sin(Math.PI - s);
    const x2 = cx + radius * Math.cos(Math.PI - e);
    const y2 = cy - radius * Math.sin(Math.PI - e);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  return (
    <ChartPanel
      title="Crisis Risk Gauge"
      description="Probability of macro stress event over the next 12 months."
      badge="Live"
      className="h-full"
    >
      {loading ? (
        <Skeleton height={240} baseColor="#1e293b" highlightColor="#334155" borderRadius={16} />
      ) : (
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative">
            <svg width="180" height="100" viewBox="0 0 180 100">
              {/* Track */}
              <path
                d={arcPath(0, 180, r)}
                fill="none"
                stroke="rgba(148,163,184,0.12)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Value arc */}
              <motion.path
                d={arcPath(0, angle, r)}
                fill="none"
                stroke="url(#riskGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              />
              {/* Gradient def */}
              <defs>
                <linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={c1} />
                  <stop offset="100%" stopColor={c2} />
                </linearGradient>
              </defs>
            </svg>

            {/* Center value */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
              <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className={`text-2xl font-bold ${label.cls}`}
              >
                <CountUp end={percentage} duration={1.4} decimals={1} suffix="%" />
              </motion.p>
            </div>
          </div>

          {/* Label pill */}
          <span className={`mt-4 rounded-full border px-3 py-1 text-xs font-semibold ${label.cls} ${label.border} ${label.bg}`}>
            {label.text}
          </span>

          {/* Scale labels */}
          <div className="mt-3 flex w-40 justify-between text-[10px] text-slate-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </ChartPanel>
  );
}
