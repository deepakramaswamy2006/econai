import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import ChartPanel from "./ChartPanel";
import ChartTooltip from "./ChartTooltip";

const data = [
  { year: 2018, gdp: 2.9 },
  { year: 2019, gdp: 2.3 },
  { year: 2020, gdp: -3.2 },
  { year: 2021, gdp: 5.8 },
  { year: 2022, gdp: 3.1 },
  { year: 2023, gdp: 3.5 },
  { year: 2024, gdp: 3.8 }
];

export default function GDPChart() {
  return (
    <ChartPanel title="GDP Forecast Trend" description="Model baseline growth trajectory.">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="gdp" stroke="#818cf8" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
