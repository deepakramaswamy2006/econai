import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import ChartPanel from "../ChartPanel";

const data = [
  { year: 2018, actual: 2.9, predicted: null },
  { year: 2019, actual: 2.3, predicted: null },
  { year: 2020, actual: -3.4, predicted: null },
  { year: 2021, actual: 5.7, predicted: null },
  { year: 2022, actual: 3.1, predicted: null },
  { year: 2023, actual: 3.4, predicted: null },
  { year: 2024, actual: null, predicted: 3.8 },
  { year: 2025, actual: null, predicted: 4.1 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1 font-semibold text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value?.toFixed(1)}%
        </p>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="mt-2 flex justify-center gap-5">
    {payload?.map((p) => (
      <div key={p.value} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span
          className="inline-block h-2 w-5 rounded-full"
          style={{
            background: p.value === "predicted" ? "transparent" : p.color,
            borderTop: p.value === "predicted" ? `2px dashed ${p.color}` : "none",
          }}
        />
        {p.value}
      </div>
    ))}
  </div>
);

export default function GDPTrendChart({ loading = false }) {
  return (
    <ChartPanel
      title="GDP Forecast Trend"
      description="Historical growth against model projection (2018–2025)."
      badge="ML Model"
      className="h-full"
    >
      {loading ? (
        <Skeleton height={320} baseColor="#1e293b" highlightColor="#334155" borderRadius={12} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 4" vertical={false} />
            <XAxis
              dataKey="year"
              stroke="transparent"
              tick={{ fill: "#475569", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="transparent"
              tick={{ fill: "#475569", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <ReferenceLine y={0} stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(148,163,184,0.15)", strokeWidth: 1 }} />
            <Legend content={<CustomLegend />} />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="url(#actualGrad)"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#22d3ee", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#22d3ee", stroke: "rgba(34,211,238,0.3)", strokeWidth: 4 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#a78bfa"
              strokeDasharray="5 4"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#a78bfa", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#a78bfa", stroke: "rgba(167,139,250,0.3)", strokeWidth: 4 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartPanel>
  );
}
