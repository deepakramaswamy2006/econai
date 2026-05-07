import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell
} from "recharts";
import ChartPanel from "../ChartPanel";

const data = [
  { year: 2019, exports: 12, imports: 14 },
  { year: 2020, exports: 10, imports: 15 },
  { year: 2021, exports: 13, imports: 16 },
  { year: 2022, exports: 14, imports: 17 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="mb-1 font-semibold text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }} className="font-medium">
          {p.name}: ${p.value}T
        </p>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="mt-2 flex justify-center gap-5">
    {payload?.map((p) => (
      <div key={p.value} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
        {p.value}
      </div>
    ))}
  </div>
);

export default function TradeChart({ loading = false }) {
  return (
    <ChartPanel
      title="Export vs Import"
      description="Trade balance trend and demand resilience by year."
      className="h-full"
    >
      {loading ? (
        <Skeleton height={300} baseColor="#1e293b" highlightColor="#334155" borderRadius={12} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }} barCategoryGap="32%">
            <defs>
              <linearGradient id="exportsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="importsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
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
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Legend content={<CustomLegend />} />
            <Bar dataKey="exports" fill="url(#exportsGrad)" radius={[6, 6, 2, 2]} />
            <Bar dataKey="imports" fill="url(#importsGrad)" radius={[6, 6, 2, 2]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartPanel>
  );
}
