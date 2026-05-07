import { useState } from "react";
import axios from "axios";
import AIExplanation from "../components/AIExplanation";
import PredictionNews from "../components/PredictionNews";
import PredictionShell from "../components/PredictionShell";
import { usePageTheme } from "../utils/pageTheme";

const ACCENT = "#3b82f6";

const initialForm = {
  gdp_growth: "", inflation: "", industrial_production: "",
  job_market: "", recession_indicator: 0, quarter: 2,
};

const NUMERIC_FIELDS = [
  { name: "gdp_growth",           label: "Previous GDP Growth", placeholder: "e.g. 2.8", unit: "%" },
  { name: "inflation",             label: "Inflation Rate",      placeholder: "e.g. 3.5", unit: "%" },
  { name: "industrial_production", label: "Industrial Prod.",    placeholder: "e.g. 1.5", unit: "%" },
  { name: "job_market",            label: "Job Market Index",    placeholder: "e.g. 60",  unit: "0-100" },
];

export default function GDPForecast() {
  const [form, setForm]       = useState(initialForm);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const { t } = usePageTheme();

  const handleChange = e => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async () => {
    if (NUMERIC_FIELDS.some(f => form[f.name] === "")) { alert("Please fill in all numerical economic indicators."); return; }
    setLoading(true); setError(null); setShowInsights(false); setResult(null);
    try {
      const res = await axios.post("http://localhost:5001/api/predictions/predict-gdp", {
        ...form,
        gdp_growth: Number(form.gdp_growth), inflation: Number(form.inflation),
        industrial_production: Number(form.industrial_production), job_market: Number(form.job_market),
      });
      setResult(Number(res?.data?.predicted_gdp_growth ?? 0));
      setShowInsights(true);
    } catch { setError("Failed to connect to the ML service. Is the server running?"); }
    finally { setLoading(false); }
  };

  const gdpState = result === null ? null
    : result >= 3 ? { label: "Strong Growth",   color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", darkBg: "rgba(34,197,94,0.15)"  }
    : result >= 1 ? { label: "Moderate Growth", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", darkBg: "rgba(245,158,11,0.15)" }
    : result >= 0 ? { label: "Weak Growth",     color: "#f97316", bg: "#fff7ed", border: "#fed7aa", darkBg: "rgba(249,115,22,0.15)" }
    :               { label: "Contraction",      color: "#ef4444", bg: "#fef2f2", border: "#fecaca", darkBg: "rgba(239,68,68,0.15)"  };

  const resultPanel = (
    <div style={{
      position: "sticky", top: 24, borderRadius: 12, padding: 24,
      border: gdpState ? `1px solid ${gdpState.border}` : t.cardBorder,
      background: gdpState
        ? (t.text === "#e2e8f0" ? gdpState.darkBg : gdpState.bg)
        : t.cardBg,
      transition: "all 0.3s ease",
      minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      {!result && !loading ? (
        <div style={{ textAlign: "center", color: t.textSubtle }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={32} height={32} style={{ margin: "0 auto 12px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.textMuted }}>Awaiting Inputs</div>
          <div style={{ fontSize: 12, marginTop: 4, color: t.textSubtle }}>Run forecast to see GDP growth</div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", color: ACCENT }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${ACCENT}40`, borderTopColor: ACCENT, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
          <div style={{ fontSize: 13, fontWeight: 700 }}>Processing...</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: gdpState.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Predicted GDP Growth</div>
          <div style={{ fontSize: 58, fontWeight: 800, color: gdpState.color, lineHeight: 1, letterSpacing: "-2px", marginBottom: 12 }}>
            {result >= 0 ? "+" : ""}{result.toFixed(2)}<span style={{ fontSize: 24, fontWeight: 700 }}>%</span>
          </div>
          <div style={{ display: "inline-block", background: gdpState.color, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {gdpState.label}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PredictionShell
      accent={ACCENT}
      title="GDP Forecast Screener"
      subtitle="Predict economic output using GradientBoosting Regressor (R²: 0.99)"
      numericFields={NUMERIC_FIELDS}
      form={form}
      onFormChange={handleChange}
      recessionToggle={true}
      onToggleRecession={val => setForm(p => ({ ...p, recession_indicator: val }))}
      onSubmit={handleSubmit}
      loading={loading}
      loadingLabel="Evaluating Forecast…"
      submitLabel="Run ML Forecast"
      error={error}
      resultPanel={resultPanel}
      insightsSection={showInsights && <>
        <AIExplanation
          context="GDP Growth Forecast Analysis"
          predictionData={{ indicators: form, predictedGDPGrowth: `${result >= 0 ? "+" : ""}${result?.toFixed(2)}%`, outlook: gdpState.label }}
          newsQuery="GDP growth economic output national income"
          accentColor={ACCENT}
        />
        <PredictionNews query="GDP growth economic output national income" accentColor={ACCENT} />
      </>}
    />
  );
}
