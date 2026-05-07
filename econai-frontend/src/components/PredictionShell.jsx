/**
 * Shared themed shell for Crisis / GDP / Inflation prediction pages.
 * Handles: card bg, header, inputs, segmented control — all theme-aware.
 * The page passes its form + results as children / props.
 */
import { usePageTheme } from "../utils/pageTheme";

export default function PredictionShell({
  accent,
  title,
  subtitle,
  numericFields,
  form,
  onFormChange,
  recessionToggle,        // true = show recession segmented control
  onToggleRecession,
  onSubmit,
  loading,
  loadingLabel,
  submitLabel,
  error,
  resultPanel,           // JSX for the right-side result card
  insightsSection,       // JSX for AI explanation + news below
}) {
  const { dark, t } = usePageTheme();

  const inputBlurBorder = dark ? "rgba(255,255,255,0.12)" : "#cbd5e1";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 60 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 8, height: 24, background: accent, borderRadius: 4 }} />
          <h1 style={{ fontSize: 26, fontWeight: 800, color: t.textHeading, margin: 0, letterSpacing: "-0.5px", transition: "color 0.3s" }}>
            {title}
          </h1>
        </div>
        <p style={{ fontSize: 13, color: t.textMuted, margin: 0, fontWeight: 500, transition: "color 0.3s" }}>
          {subtitle}
        </p>
      </div>

      {/* ── Grid: Form | Result ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, marginBottom: 32 }}>
        {/* Left: Form card */}
        <div style={{
          background: t.cardBg, borderRadius: 12, border: t.cardBorder,
          boxShadow: t.cardShadow, overflow: "hidden", transition: "background 0.3s, border-color 0.3s",
        }}>
          {/* Card header */}
          <div style={{
            background: t.cardHeaderBg, padding: "16px 24px",
            borderBottom: `1px solid ${t.divider}`, transition: "background 0.3s",
          }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
              Indicator Inputs
            </h2>
          </div>

          <div style={{ padding: 24 }}>
            {/* Numeric fields */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 24 }}>
              {numericFields.map((f) => (
                <div key={f.name}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                    {f.label}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      name={f.name}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={onFormChange}
                      style={{
                        width: "100%", padding: "10px 40px 10px 12px",
                        border: `1px solid ${inputBlurBorder}`,
                        borderRadius: 6, background: t.inputBg,
                        fontSize: 14, color: t.text, fontWeight: 600,
                        transition: "all 0.15s", outline: "none",
                      }}
                      onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}25`; }}
                      onBlur={e => { e.target.style.borderColor = inputBlurBorder; e.target.style.boxShadow = "none"; }}
                    />
                    <span style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      fontSize: 12, color: t.textSubtle, fontWeight: 600, pointerEvents: "none",
                    }}>
                      {f.unit}
                    </span>
                  </div>
                </div>
              ))}

              {/* Quarter dropdown */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                  Quarter
                </label>
                <select
                  name="quarter"
                  value={form.quarter}
                  onChange={onFormChange}
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: `1px solid ${inputBlurBorder}`, borderRadius: 6,
                    fontSize: 14, color: t.text, fontWeight: 600,
                    outline: "none", background: t.inputBg,
                    transition: "background 0.3s, border-color 0.3s",
                  }}
                >
                  <option value={1}>Q1 (Jan-Mar)</option>
                  <option value={2}>Q2 (Apr-Jun)</option>
                  <option value={3}>Q3 (Jul-Sep)</option>
                  <option value={4}>Q4 (Oct-Dec)</option>
                </select>
              </div>
            </div>

            {/* Recession segmented control */}
            {recessionToggle && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
                  Current Recession Status
                </label>
                <div style={{ display: "flex", background: t.segBg, padding: 4, borderRadius: 8, gap: 4 }}>
                  {[
                    { val: 0, label: "Normal Economy" },
                    { val: 1, label: "Active Recession" },
                  ].map(({ val, label }) => (
                    <button
                      key={val}
                      onClick={() => onToggleRecession(val)}
                      style={{
                        flex: 1, padding: "8px 0", border: "none", borderRadius: 6,
                        background: form.recession_indicator === val ? t.segActiveBg : "transparent",
                        color: form.recession_indicator === val
                          ? (val === 1 ? accent : t.text)
                          : t.textMuted,
                        fontWeight: form.recession_indicator === val ? 700 : 500,
                        fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                        boxShadow: form.recession_indicator === val ? "0 1px 4px rgba(0,0,0,0.15)" : "none",
                        fontFamily: "inherit",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={onSubmit}
              disabled={loading}
              style={{
                width: "100%", background: accent, color: "#fff",
                border: "none", padding: "14px", borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.75 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.15s", fontFamily: "inherit",
              }}
            >
              {loading ? (loadingLabel || "Processing…") : (submitLabel || "Run ML Forecast")}
            </button>
            {error && <div style={{ marginTop: 12, fontSize: 12, color: "#ef4444", fontWeight: 600 }}>{error}</div>}
          </div>
        </div>

        {/* Right: Result panel (passed as prop) */}
        <div>{resultPanel}</div>
      </div>

      {/* Insights section */}
      {insightsSection && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {insightsSection}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
