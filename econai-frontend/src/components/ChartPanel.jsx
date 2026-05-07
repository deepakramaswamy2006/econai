// Note: This component is the new baseline "Card" for the design system.
export default function Card({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl ${className}`}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-slate-200">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
