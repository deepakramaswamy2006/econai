import { useState, useEffect } from "react";
import axios from "axios";
import { usePageTheme } from "../utils/pageTheme";

import { API_BASE } from "../config";

export default function AIExplanation({ context, predictionData, newsQuery, accentColor = "#3b82f6" }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dark, t } = usePageTheme();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setExplanation("");

    axios
      .post(`${API_BASE}/predictions/explain`, {
        context,
        predictionData,
        newsQuery: newsQuery || context,
      })
      .then((res) => {
        if (isMounted) setExplanation(res.data.explanation || "No explanation returned.");
      })
      .catch(() => {
        if (isMounted)
          setError(
            "Could not load AI analysis. Please check that your GROQ_API_KEY is set in backend/.env and the backend server is running."
          );
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
    // Re-run only when prediction data changes (stringify to deep compare)
  }, [JSON.stringify(predictionData)]);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      background: t.cardBg,
      border: t.cardBorder,
      borderRadius: 16,
      padding: 28,
      boxShadow: t.cardShadow,
      transition: "background 0.3s, border-color 0.3s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 40, height: 40,
          background: accentColor + "18",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke={accentColor} width={20} height={20}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: t.textHeading, transition: "color 0.3s" }}>AI Analysis</div>
          <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 500, transition: "color 0.3s" }}>
            Groq · Mixtral 8×7B — Synthesizing prediction data &amp; real-world news
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "12px 16px", background: accentColor + "10", borderRadius: 10 }}>
            <span style={{
              width: 16, height: 16,
              border: `2px solid ${accentColor}30`,
              borderTop: `2px solid ${accentColor}`,
              borderRadius: "50%",
              animation: "ai-spin 0.8s linear infinite",
              display: "inline-block",
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 500, transition: "color 0.3s" }}>
              Analysing prediction data and cross-referencing news context…
            </span>
          </div>
          {[100, 92, 85, 70].map((w, i) => (
            <div key={i} style={{
              height: 13,
              background: dark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
              borderRadius: 6,
              marginBottom: 10,
              width: `${w}%`,
              animation: "ai-shimmer 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{
          background: dark ? "rgba(239,68,68,0.12)" : "#fef2f2",
          border: dark ? "1px solid rgba(239,68,68,0.3)" : "1px solid #fecaca",
          borderRadius: 10,
          padding: "14px 18px",
          fontSize: 13,
          color: dark ? "#fca5a5" : "#b91c1c",
          lineHeight: 1.7,
        }}>
          {error}
        </div>
      ) : (
        <div>
          {explanation.split("\n\n").map((para, i) => (
            para.trim() ? (
              <p key={i} style={{
                fontSize: 14,
                color: t.text,
                lineHeight: 1.85,
                margin: 0,
                marginBottom: i < explanation.split("\n\n").length - 1 ? 14 : 0,
                paddingLeft: i === 0 ? 16 : 0,
                borderLeft: i === 0 ? `3px solid ${accentColor}` : "none",
                transition: "color 0.3s",
              }}>
                {para.trim()}
              </p>
            ) : null
          ))}
        </div>
      )}

      <style>{`
        @keyframes ai-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ai-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
