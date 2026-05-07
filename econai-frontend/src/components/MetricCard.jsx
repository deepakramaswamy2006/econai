import CountUp from "react-countup";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Card from "./ChartPanel"; // Using ChartPanel as our Card base

const colorClasses = {
  cyan: {
    icon: 'bg-cyan-500/10 text-cyan-500',
    trend: 'text-cyan-500',
  },
  indigo: {
    icon: 'bg-indigo-500/10 text-indigo-500',
    trend: 'text-indigo-500',
  },
  emerald: {
    icon: 'bg-emerald-400/10 text-emerald-400',
    trend: 'text-emerald-400',
  },
  rose: {
    icon: 'bg-rose-500/10 text-rose-500',
    trend: 'text-rose-500',
  }
};

export default function MetricCard({
  title,
  value,
  decimals = 1,
  suffix = "%",
  icon: Icon,
  trend,
  trendUp = true,
  loading = false,
  color = "cyan"
}) {
  const classes = colorClasses[color] || colorClasses.cyan;

  const TrendIndicator = () => (
    <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-400' : 'text-rose-500'}`}>
      {trend}
    </span>
  );

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${classes.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-2">
        {loading ? (
          <Skeleton baseColor="#1e293b" highlightColor="#334155" width={120} height={36} />
        ) : (
          <p className="text-3xl font-bold text-white">
            <CountUp end={value} duration={1.5} decimals={decimals} suffix={suffix} />
          </p>
        )}
      </div>

      <div className="mt-auto pt-2">
        {loading ? (
          <Skeleton baseColor="#1e293b" highlightColor="#334155" width={100} height={16} />
        ) : (
          <TrendIndicator />
        )}
      </div>
    </Card>
  );
}
