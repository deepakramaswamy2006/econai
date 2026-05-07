/**
 * Shared dashboard theme tokens.
 * Import usePageTheme() in any dashboard page to get theme-aware style objects.
 */
import { useTheme } from "../context/ThemeContext";

export function usePageTheme() {
  const { dark, toggle } = useTheme();

  const t = dark ? {
    // Backgrounds
    pageBg:       "transparent",
    cardBg:       "#1e293b",
    cardHeaderBg: "#0f172a",
    elevatedBg:   "rgba(255,255,255,0.04)",
    toggleBg:     "rgba(255,255,255,0.04)",
    inputBg:      "rgba(255,255,255,0.07)",
    segBg:        "#0f172a",
    segActiveBg:  "#1e293b",
    // Borders
    cardBorder:   "1px solid rgba(255,255,255,0.1)",
    inputBorder:  "1px solid rgba(255,255,255,0.15)",
    divider:      "rgba(255,255,255,0.09)",
    // Text — bright enough to read on dark slate
    text:         "#e2e8f0",
    textMuted:    "#b0bec8",
    textSubtle:   "#6b7fa3",
    textHeading:  "#f1f5f9",
    // Shadows
    cardShadow:   "0 4px 24px rgba(0,0,0,0.4)",
    // Toggle btn label
    toggleIcon:   "☀️",
    toggleLabel:  "Light mode",
  } : {
    pageBg:       "transparent",
    cardBg:       "#ffffff",
    cardHeaderBg: "#f8fafc",
    elevatedBg:   "#f8fafc",
    toggleBg:     "#f1f5f9",
    inputBg:      "#ffffff",
    segBg:        "#f1f5f9",
    segActiveBg:  "#ffffff",
    cardBorder:   "1px solid #e2e8f0",
    inputBorder:  "1px solid #cbd5e1",
    divider:      "#e2e8f0",
    text:         "#0f172a",
    textMuted:    "#64748b",
    textHeading:  "#0f172a",
    textSubtle:   "#94a3b8",
    cardShadow:   "0 4px 6px -1px rgba(0,0,0,0.05)",
    toggleIcon:   "🌙",
    toggleLabel:  "Dark mode",
  };

  return { dark, toggle, t };
}
