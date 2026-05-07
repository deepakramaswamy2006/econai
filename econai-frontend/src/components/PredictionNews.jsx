import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { usePageTheme } from "../utils/pageTheme";

import { API_BASE } from "../config";

// Simple in-memory cache per query to avoid repeated API calls & duplicate articles
const newsCache = {};

export default function PredictionNews({ query, accentColor = "#3b82f6" }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevQueryRef = useRef(null);
  const { dark, t } = usePageTheme();

  useEffect(() => {
    // Don't re-fetch if query hasn't changed
    if (prevQueryRef.current === query && articles.length > 0) return;
    prevQueryRef.current = query;

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Use cache if available
    if (newsCache[query]) {
      setArticles(newsCache[query]);
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE}/predictions/news?query=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data.error) {
          setError(res.data.error);
        } else {
          const raw = res.data.articles || [];

          // Deduplicate: remove articles with same title or same article_id
          const seen = new Set();
          const unique = raw.filter((a) => {
            const key = a.article_id || a.title;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          newsCache[query] = unique;
          setArticles(unique);
        }
      })
      .catch(() => {
        if (isMounted)
          setError("Could not load news. Please check that your NEWSDATA_API_KEY is set in backend/.env.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [query]);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return null;
    }
  };

  // Theme-aware colours
  const skeletonBase = dark ? "rgba(255,255,255,0.06)" : "#f8fafc";
  const skeletonLine = dark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const cardHoverBg  = dark ? "rgba(255,255,255,0.06)" : "#ffffff";
  const iconBoxBg    = dark ? "rgba(255,255,255,0.06)" : "#f8fafc";
  const iconBoxBorder = dark ? "rgba(255,255,255,0.1)" : "#e2e8f0";
  const liveBadgeBg  = dark ? "rgba(34,197,94,0.15)"  : "#f0fdf4";
  const liveBadgeBdr = dark ? "rgba(34,197,94,0.35)"  : "#bbf7d0";

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: iconBoxBg,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${iconBoxBorder}`,
            transition: "background 0.3s, border-color 0.3s",
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke={t.textMuted} width={17} height={17}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: t.textHeading, transition: "color 0.3s" }}>Relevant News</div>
            <div style={{ fontSize: 12, color: t.textMuted, fontWeight: 500, transition: "color 0.3s" }}>
              {articles.length > 0 ? `${articles.length} unique stories` : "Top stories related to this prediction"}
            </div>
          </div>
        </div>
        {articles.length > 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: "#22c55e",
            background: liveBadgeBg, border: `1px solid ${liveBadgeBdr}`,
            borderRadius: 20, padding: "3px 10px", letterSpacing: "0.05em",
            transition: "background 0.3s",
          }}>
            LIVE
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              background: skeletonBase,
              borderRadius: 12, padding: 18,
              border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`,
            }}>
              <div style={{ height: 12, background: skeletonLine, borderRadius: 6, marginBottom: 10, width: "80%", animation: "shimmer 1.5s ease-in-out infinite" }} />
              <div style={{ height: 12, background: skeletonLine, borderRadius: 6, marginBottom: 8, width: "60%", animation: "shimmer 1.5s ease-in-out infinite" }} />
              <div style={{ height: 10, background: skeletonBase, borderRadius: 6, width: "40%", animation: "shimmer 1.5s ease-in-out infinite" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{
          background: dark ? "rgba(234,179,8,0.1)" : "#fffbeb",
          border: dark ? "1px solid rgba(234,179,8,0.3)" : "1px solid #fde68a",
          borderRadius: 10, padding: "14px 18px",
          fontSize: 13,
          color: dark ? "#fde047" : "#92400e",
          lineHeight: 1.6,
        }}>
          {error}
        </div>
      ) : articles.length === 0 ? (
        <p style={{ fontSize: 13, color: t.textMuted, fontStyle: "italic" }}>No relevant news found for this prediction.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {articles.map((article, idx) => (
            <a
              key={article.article_id || idx}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", flexDirection: "column",
                background: dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                borderRadius: 12,
                padding: 18,
                textDecoration: "none",
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = cardHoverBg;
                e.currentTarget.style.borderColor = accentColor + "60";
                e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : "#f8fafc";
                e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <p style={{
                fontSize: 13, fontWeight: 600, color: t.textHeading,
                lineHeight: 1.5, margin: 0, marginBottom: 10,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                transition: "color 0.3s",
              }}>
                {article.title}
              </p>
              {article.description && (
                <p style={{
                  fontSize: 12, color: t.textMuted, lineHeight: 1.5,
                  margin: 0, marginBottom: 12,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  transition: "color 0.3s",
                }}>
                  {article.description}
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto" }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: accentColor,
                  background: accentColor + "18",
                  padding: "3px 8px", borderRadius: 20,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {(article.source_id || "Source").slice(0, 16)}
                </span>
                {article.pubDate && (
                  <span style={{ fontSize: 10, color: t.textSubtle, marginLeft: 2, transition: "color 0.3s" }}>
                    {formatDate(article.pubDate)}
                  </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={t.textSubtle} width={12} height={12} style={{ marginLeft: "auto" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
