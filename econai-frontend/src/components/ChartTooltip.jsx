export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/20 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-xl backdrop-blur">
      {label !== undefined ? <p className="mb-1 text-slate-300">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color || "#fff" }}>
          {item.name || item.dataKey}: {item.value}
        </p>
      ))}
    </div>
  );
}
