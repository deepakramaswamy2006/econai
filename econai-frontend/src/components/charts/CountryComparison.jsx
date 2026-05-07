import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";
import ChartPanel from "../ChartPanel";
import ChartTooltip from "../ChartTooltip";

const data = [
  { country: "USA", gdp: 3.5, inflation: 2.2 },
  { country: "India", gdp: 6.1, inflation: 5.3 },
  { country: "China", gdp: 4.8, inflation: 2.0 },
  { country: "Germany", gdp: 1.4, inflation: 2.6 }
];

export default function CountryComparison() {
  return (
    <ChartPanel
      title="Country Economic Comparison"
      description="GDP growth and inflation baseline by market."
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(148,163,184,0.2)" strokeDasharray="3 3" />
          <XAxis dataKey="country" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <Bar dataKey="gdp" fill="#818cf8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="inflation" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}
