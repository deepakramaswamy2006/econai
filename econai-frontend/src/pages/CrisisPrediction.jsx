import { useState } from "react";
import axios from "axios";
import AIExplanation from "../components/AIExplanation";
import PredictionNews from "../components/PredictionNews";
import PredictionShell from "../components/PredictionShell";
import { usePageTheme } from "../utils/pageTheme";

const ACCENT = "#ef4444";

const initialForm = {
  gdp_growth: "", inflation: "", industrial_production: "",
  job_market: "", recession_indicator: 0, quarter: 2,
};

const NUMERIC_FIELDS = [
  { name: "gdp_growth",           label: "GDP Growth",       placeholder: "e.g. 2.8", unit: "%" },
  { name: "inflation",             label: "Inflation Rate",   placeholder: "e.g. 3.5", unit: "%" },
  { name: "industrial_production", label: "Industrial Prod.", placeholder: "e.g. 1.5", unit: "%" },
  { name: "job_market",            label: "Job Market Index", placeholder: "e.g. 60",  unit: "0-100" },
];

export default function CrisisPrediction() {
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
      const res = await axios.post("http://localhost:5001/api/predictions/predict-crisis", {
        ...form,
        gdp_growth: Number(form.gdp_growth), inflation: Number(form.inflation),
        industrial_production: Number(form.industrial_production), job_market: Number(form.job_market),
      });
      setResult(Number(res?.data?.crisis_probability ?? 0));
      setShowInsights(true);
    } catch { setError("Failed to connect to the ML service. Is the server running?"); }
    finally { setLoading(false); }
  };

  const riskLevel = result === null ? null
    : result >= 0.6 ? { label: "High Risk",   color: "#ef4444", bg: "#fef2f2", border: "#fecaca", darkBg: "rgba(239,68,68,0.15)" }
    : result >= 0.3 ? { label: "Medium Risk", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", darkBg: "rgba(245,158,11,0.15)" }
    :                 { label: "Low Risk",    color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", darkBg: "rgba(34,197,94,0.15)"  };

  const resultPanel = (
    <div style={{
      position: "sticky", top: 24, borderRadius: 12, padding: 24,
      border: riskLevel ? `1px solid ${riskLevel.border}` : t.cardBorder,
      background: riskLevel
        ? (t.text === "#e2e8f0" ? riskLevel.darkBg : riskLevel.bg)
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
          <div style={{ fontSize: 12, marginTop: 4, color: t.textSubtle }}>Run forecast to see probability</div>
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", color: ACCENT }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${ACCENT}40`, borderTopColor: ACCENT, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
          <div style={{ fontSize: 13, fontWeight: 700 }}>Processing...</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: riskLevel.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Crisis Probability</div>
          <div style={{ fontSize: 64, fontWeight: 800, color: riskLevel.color, lineHeight: 1, letterSpacing: "-2px", marginBottom: 12 }}>
            {(result * 100).toFixed(1)}<span style={{ fontSize: 24, fontWeight: 700 }}>%</span>
          </div>
          <div style={{ display: "inline-block", background: riskLevel.color, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {riskLevel.label}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PredictionShell
      accent={ACCENT}
      title="Crisis Screener"
      subtitle="Macroeconomic risk evaluation using Logistic Regression (AUC-ROC: 0.61)"
      numericFields={NUMERIC_FIELDS}
      form={form}
      onFormChange={handleChange}
      recessionToggle={true}
      onToggleRecession={val => setForm(p => ({ ...p, recession_indicator: val }))}
      onSubmit={handleSubmit}
      loading={loading}
      loadingLabel="Evaluating Risk…"
      submitLabel="Run ML Forecast"
      error={error}
      resultPanel={resultPanel}
      insightsSection={showInsights && <>
        <AIExplanation
          context="Economic Crisis Prediction Analysis"
          predictionData={{ indicators: form, crisisProbability: `${(result * 100).toFixed(1)}%`, riskLevel: riskLevel.label }}
          newsQuery="economic crisis financial instability recession"
          accentColor={ACCENT}
        />
        <PredictionNews query="economic crisis financial instability recession" accentColor={ACCENT} />
      </>}
    />
  );
}
