import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  {
    to: "/crisis", label: "Crisis Prediction", group: "predictions",
    accent: "#ef4444", bgL: "#fef2f2", bgD: "rgba(239,68,68,0.12)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width={18} height={18}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    to: "/gdp", label: "GDP Forecast", group: "predictions",
    accent: "#3b82f6", bgL: "#eff6ff", bgD: "rgba(59,130,246,0.12)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width={18} height={18}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.516M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.516" />
      </svg>
    ),
  },
  {
    to: "/inflation", label: "Inflation Prediction", group: "predictions",
    accent: "#f59e0b", bgL: "#fffbeb", bgD: "rgba(245,158,11,0.12)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width={18} height={18}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.516M16.72 5.903a11.95 11.95 0 015.814 5.516" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V12m0 0h-4.5M21 12L15 6" />
      </svg>
    ),
  },
  {
    to: "/scenario", label: "Scenario Simulator", group: "analytics",
    accent: "#0ea5e9", bgL: "#f0f9ff", bgD: "rgba(14,165,233,0.12)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width={18} height={18}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.5 1.5M5 14.5l-1.5 1.5" />
      </svg>
    ),
  },
  {
    to: "/trends", label: "Historical Trends", group: "analytics",
    accent: "#22c55e", bgL: "#f0fdf4", bgD: "rgba(34,197,94,0.12)",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width={18} height={18}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5 5.25-5.25M15.75 8.25h5.25v5.25" />
      </svg>
    ),
  },
];

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  // Theme-specific tokens
  const t = dark ? {
    aside:        { background: "#0d1117", borderRight: "1px solid rgba(255,255,255,0.09)" },
    logoDivider:  { borderBottom: "1px solid rgba(255,255,255,0.08)" },
    logoName:     { color: "#f1f5f9" },
    logoSub:      { color: "#7a8fb5" },
    sectionLabel: { color: "#6b7fa3" },
    navDefault:   { color: "#a8b8cc" },
    iconDefault:  { background: "rgba(255,255,255,0.07)" },
    profileBorder:{ borderTop: "1px solid rgba(255,255,255,0.08)" },
    profileHover: "#1e293b",
    profileActiveBg: "#1e2a3a",
    userName:     { color: "#e2e8f0" },
    userEmail:    { color: "#7a8fb5" },
    logoutDefault:{ color: "#7a8fb5" },
    logoutHoverBg:"rgba(239,68,68,0.12)",
    toggleBg:     "rgba(255,255,255,0.08)",
    toggleBorder: "rgba(255,255,255,0.12)",
    toggleColor:  "#a8b8cc",
  } : {
    aside:        { background: "#ffffff", borderRight: "1px solid #e2e8f0" },
    logoDivider:  { borderBottom: "1px solid #f1f5f9" },
    logoName:     { color: "#0f172a" },
    logoSub:      { color: "#94a3b8" },
    sectionLabel: { color: "#94a3b8" },
    navDefault:   { color: "#64748b" },
    iconDefault:  { background: "#f8fafc" },
    profileBorder:{ borderTop: "1px solid #f1f5f9" },
    profileHover: "#f8fafc",
    profileActiveBg: "#f0f4ff",
    userName:     { color: "#0f172a" },
    userEmail:    { color: "#94a3b8" },
    logoutDefault:{ color: "#94a3b8" },
    logoutHoverBg:"#fef2f2",
    toggleBg:     "rgba(99,102,241,0.07)",
    toggleBorder: "rgba(99,102,241,0.18)",
    toggleColor:  "#6366f1",
  };

  const renderNavGroup = (group) =>
    NAV_ITEMS.filter((i) => i.group === group).map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        style={({ isActive }) => ({
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 10,
          marginBottom: 4,
          textDecoration: "none",
          transition: "all 0.15s ease",
          background: isActive ? (dark ? item.bgD : item.bgL) : "transparent",
          color: isActive ? item.accent : t.navDefault.color,
          fontWeight: isActive ? 600 : 500,
          fontSize: 14,
        })}
      >
        {({ isActive }) => (
          <>
            <span style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: isActive ? item.accent + "20" : t.iconDefault.background,
              color: isActive ? item.accent : (dark ? "#475569" : "#94a3b8"),
              transition: "all 0.15s",
            }}>
              {item.icon}
            </span>
            {item.label}
          </>
        )}
      </NavLink>
    ));

  return (
    <aside style={{
      width: 260, minWidth: 260, height: "100vh",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0,
      transition: "background 0.3s, border-color 0.3s",
      ...t.aside,
    }}>
      {/* ── Logo + toggle ── */}
      <div style={{ padding: "22px 20px 18px", ...t.logoDivider }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(99,102,241,0.35)",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" width={17} height={17}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px", ...t.logoName }}>EconAI</div>
              <div style={{ fontSize: 10, fontWeight: 500, ...t.logoSub }}>Economic Intelligence</div>
            </div>
          </div>

          {/* Theme toggle button */}
          <button
            onClick={toggle}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.toggleBorder}`,
              background: t.toggleBg, cursor: "pointer", fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: t.toggleColor, transition: "all 0.2s", flexShrink: 0,
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
        <div style={{ padding: "12px 12px 6px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", ...t.sectionLabel }}>
            Predictions
          </span>
        </div>
        {renderNavGroup("predictions")}

        <div style={{ padding: "14px 12px 6px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", ...t.sectionLabel }}>
            Analytics
          </span>
        </div>
        {renderNavGroup("analytics")}
      </nav>

      {/* ── User profile card ── */}
      {user && (
        <div style={{ margin: "10px 10px 14px", paddingTop: 10, ...t.profileBorder }}>
          <NavLink
            to="/profile"
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12, textDecoration: "none",
              transition: "background 0.15s",
              background: isActive ? t.profileActiveBg : "transparent",
            })}
            onMouseEnter={e => { e.currentTarget.style.background = t.profileHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{getInitials(user.name)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...t.userName }}>{user.name}</div>
              <div style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", ...t.userEmail }}>{user.email}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke={dark ? "#475569" : "#94a3b8"} width={15} height={15} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </NavLink>

          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", margin: "4px 0 0", padding: "8px 12px",
              borderRadius: 10, border: "none", background: "transparent",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              transition: "color 0.15s, background 0.15s", fontFamily: "inherit",
              ...t.logoutDefault,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = t.logoutHoverBg; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.logoutDefault.color; e.currentTarget.style.background = "transparent"; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width={14} height={14}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
