import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ZAxis
} from "recharts";
import ChartPanel from "../ChartPanel";

const data = [
  { inflation: 1.5, gdp: 3.1, z: 80 },
  { inflation: 2.2, gdp: 3.5, z: 80 },
  { inflation: 3.1, gdp: 2.4, z: 80 },
  { inflation: 4.0, gdp: 1.8, z: 80 },
  { inflation: 5.2, gdp: 1.1, z: 80 }
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="font-semibold text-slate-300 mb-1">Data Point</p>
      <p className="text-cyan-300">Inflation: {d.inflation}%</p>
      <p className="text-violet-300">GDP: {d.gdp}%</p>
    </div>
  );
};

export default function InflationGDPChart({ loading = false }) {
  return (
    <ChartPanel
      title="Inflation vs GDP"
      description="Cross-correlation snapshot for macro pressure and growth."
      className="h-full"
    >
      {loading ? (
        <Skeleton height={300} baseColor="#1e293b" highlightColor="#334155" borderRadius={12} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.6} />
              </radialGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 4" />
            <XAxis
              dataKey="inflation"
              name="Inflation"
              unit="%"
              stroke="transparent"
              tick={{ fill: "#475569", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Inflation (%)", position: "insideBottom", offset: -2, fill: "#475569", fontSize: 10 }}
            />
            <YAxis
              dataKey="gdp"
              name="GDP"
              unit="%"
              stroke="transparent"
              tick={{ fill: "#475569", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis dataKey="z" range={[60, 120]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(148,163,184,0.15)", strokeDasharray: "3 3" }} />
            <Scatter data={data} fill="url(#dotGrad)" />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </ChartPanel>
  );
}
