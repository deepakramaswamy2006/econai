import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePageTheme } from "../utils/pageTheme";

const MODULE_CARDS = [
  { label:"Crisis Prediction", icon:"⚠️", color:"#ef4444", bgL:"#fef2f2", bgD:"rgba(239,68,68,0.12)",  path:"/crisis" },
  { label:"GDP Forecast",      icon:"📈", color:"#3b82f6", bgL:"#eff6ff", bgD:"rgba(59,130,246,0.12)",  path:"/gdp" },
  { label:"Inflation",         icon:"💹", color:"#f59e0b", bgL:"#fffbeb", bgD:"rgba(245,158,11,0.12)",  path:"/inflation" },
  { label:"Scenario Sim",      icon:"🔬", color:"#0ea5e9", bgL:"#f0f9ff", bgD:"rgba(14,165,233,0.12)", path:"/scenario" },
  { label:"Trends",            icon:"📊", color:"#22c55e", bgL:"#f0fdf4", bgD:"rgba(34,197,94,0.12)",  path:"/trends" },
];

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" });
}

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { dark, t } = usePageTheme();

  const [editName, setEditName] = useState(false);
  const [nameVal,  setNameVal]  = useState(user?.name || "");
  const [pwdMode,  setPwdMode]  = useState(false);
  const [pwd,      setPwd]      = useState({ newPwd:"", confirm:"" });
  const [saving,   setSaving]   = useState(false);
  const [message,  setMessage]  = useState(null);

  const handleLogout = () => { logout(); navigate("/login"); };

  const saveName = async () => {
    if (!nameVal.trim()) return;
    setSaving(true);
    try { await updateProfile({ name: nameVal.trim() }); setMessage({ type:"success", text:"Name updated successfully!" }); setEditName(false); }
    catch (err) { setMessage({ type:"error", text: err.response?.data?.message || "Update failed" }); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (pwd.newPwd !== pwd.confirm)  { setMessage({ type:"error", text:"Passwords do not match." }); return; }
    if (pwd.newPwd.length < 6)       { setMessage({ type:"error", text:"Password must be at least 6 characters." }); return; }
    setSaving(true);
    try { await updateProfile({ password: pwd.newPwd }); setMessage({ type:"success", text:"Password updated!" }); setPwdMode(false); setPwd({ newPwd:"", confirm:"" }); }
    catch (err) { setMessage({ type:"error", text: err.response?.data?.message || "Update failed" }); }
    finally { setSaving(false); }
  };

  // ── Themed style helpers ──────────────────────────────────────────────────
  const card = {
    background: t.cardBg, border: t.cardBorder,
    borderRadius: 20, boxShadow: t.cardShadow,
    transition: "background 0.3s, border-color 0.3s",
  };
  const inputStyle = {
    flex:1, padding:"9px 13px", borderRadius:8,
    border: dark ? "1.5px solid rgba(255,255,255,0.15)" : "1.5px solid #e2e8f0",
    background: t.inputBg, color: t.text,
    fontSize:14, outline:"none", fontFamily:"inherit",
    minWidth:140, transition:"border-color 0.2s",
  };
  const dividerStyle = { height:1, background: t.divider, margin:"18px 0" };
  const editBtnStyle = {
    padding:"6px 14px", borderRadius:8,
    border: dark ? "1.5px solid rgba(255,255,255,0.12)" : "1.5px solid #e2e8f0",
    background: dark ? "rgba(255,255,255,0.05)" : "#f8fafc",
    color:"#818cf8", fontSize:13, fontWeight:600,
    cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit",
  };

  return (
    <div style={{ padding:"0 0 40px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:700, color:t.textHeading, margin:"0 0 4px", letterSpacing:"-0.5px", transition:"color 0.3s" }}>My Profile</h1>
          <p style={{ fontSize:14, color:t.textMuted, margin:0 }}>Manage your EconAI account</p>
        </div>
        <button id="profile-logout-btn" onClick={handleLogout} style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"8px 14px", borderRadius:10,
          border: dark ? "1.5px solid rgba(239,68,68,0.35)" : "1.5px solid #fecaca",
          background:"transparent", color:"#f87171", fontSize:13, fontWeight:600,
          cursor:"pointer", transition:"background 0.2s", fontFamily:"inherit",
        }}
          onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(239,68,68,0.1)" : "#fef2f2"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width={16} height={16}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* Flash */}
      {message && (
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"12px 16px", borderRadius:12, marginBottom:20, fontSize:13, fontWeight:500,
          background: message.type === "success"
            ? (dark ? "rgba(34,197,94,0.12)" : "#f0fdf4")
            : (dark ? "rgba(239,68,68,0.12)"  : "#fef2f2"),
          border: message.type === "success"
            ? (dark ? "1px solid rgba(34,197,94,0.3)"  : "1px solid #bbf7d0")
            : (dark ? "1px solid rgba(239,68,68,0.3)"  : "1px solid #fecaca"),
          color: message.type === "success" ? "#4ade80" : "#f87171",
        }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:"inherit", fontFamily:"inherit" }}>✕</button>
        </div>
      )}

      <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginBottom:20 }}>
        {/* Avatar Card */}
        <div style={{ ...card, flex:"0 0 220px", padding:"28px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 24px rgba(99,102,241,0.35)" }}>
            <span style={{ fontSize:30, fontWeight:700, color:"#fff", letterSpacing:"-1px" }}>{getInitials(user?.name)}</span>
          </div>
          <div style={{ fontSize:17, fontWeight:700, color:t.textHeading, textAlign:"center" }}>{user?.name}</div>
          <div style={{ fontSize:13, color:t.textMuted, textAlign:"center", wordBreak:"break-all" }}>{user?.email}</div>
          <div style={{
            display:"flex", alignItems:"center", gap:6,
            fontSize:11, color:t.textMuted, fontWeight:500,
            background: dark ? "rgba(255,255,255,0.06)" : "#f8fafc",
            borderRadius:20, padding:"5px 12px",
            border: dark ? "1px solid rgba(255,255,255,0.09)" : "1px solid #e2e8f0",
            marginTop:4,
          }}>
            <span>🗓</span> Member since {formatDate(user?.createdAt)}
          </div>
        </div>

        {/* Settings Card */}
        <div style={{ ...card, flex:1, minWidth:300, padding:"28px 28px" }}>
          <div style={{ fontSize:16, fontWeight:700, color:t.textHeading, marginBottom:20, letterSpacing:"-0.2px" }}>Account Settings</div>

          {/* Name field */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Full Name</div>
              {!editName && <div style={{ fontSize:15, color:t.text, fontWeight:500 }}>{user?.name}</div>}
            </div>
            {!editName ? (
              <button id="edit-name-btn" style={editBtnStyle} onClick={() => { setEditName(true); setNameVal(user?.name); }}>Edit</button>
            ) : (
              <div style={{ display:"flex", gap:8, alignItems:"center", flex:1, flexWrap:"wrap" }}>
                <input value={nameVal} onChange={e => setNameVal(e.target.value)} style={inputStyle} placeholder="Your name"
                  onFocus={e => e.target.style.borderColor="#6366f1"}
                  onBlur={e => e.target.style.borderColor= dark ? "rgba(255,255,255,0.15)" : "#e2e8f0"} />
                <button id="save-name-btn" onClick={saveName} disabled={saving} style={{ padding:"8px 14px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>
                  {saving ? "…" : "Save"}
                </button>
                <button onClick={() => setEditName(false)} style={{ padding:"8px 12px", borderRadius:8, border: dark ? "1.5px solid rgba(255,255,255,0.12)" : "1.5px solid #e2e8f0", background:"transparent", color:t.textMuted, fontSize:13, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>Cancel</button>
              </div>
            )}
          </div>

          <div style={dividerStyle} />

          {/* Email field */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Email Address</div>
              <div style={{ fontSize:15, color:t.text, fontWeight:500 }}>{user?.email}</div>
            </div>
            <span style={{ padding:"4px 10px", borderRadius:20, background: dark ? "rgba(255,255,255,0.07)" : "#f1f5f9", color:t.textMuted, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>Locked</span>
          </div>

          <div style={dividerStyle} />

          {/* Password field */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:4, flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Password</div>
              {!pwdMode && <div style={{ fontSize:15, color:t.text, fontWeight:500 }}>••••••••</div>}
            </div>
            {!pwdMode ? (
              <button id="change-pwd-btn" style={editBtnStyle} onClick={() => setPwdMode(true)}>Change</button>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8, width:"100%" }}>
                <input type="password" value={pwd.newPwd} onChange={e => setPwd(p => ({ ...p, newPwd:e.target.value }))}
                  placeholder="New password (min 6)" style={inputStyle}
                  onFocus={e => e.target.style.borderColor="#6366f1"}
                  onBlur={e => e.target.style.borderColor= dark ? "rgba(255,255,255,0.15)" : "#e2e8f0"} />
                <input type="password" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm:e.target.value }))}
                  placeholder="Confirm new password" style={inputStyle}
                  onFocus={e => e.target.style.borderColor="#6366f1"}
                  onBlur={e => e.target.style.borderColor= dark ? "rgba(255,255,255,0.15)" : "#e2e8f0"} />
                <div style={{ display:"flex", gap:8 }}>
                  <button id="save-pwd-btn" onClick={savePassword} disabled={saving} style={{ padding:"8px 14px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>
                    {saving ? "…" : "Update Password"}
                  </button>
                  <button onClick={() => setPwdMode(false)} style={{ padding:"8px 12px", borderRadius:8, border: dark ? "1.5px solid rgba(255,255,255,0.12)" : "1.5px solid #e2e8f0", background:"transparent", color:t.textMuted, fontSize:13, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div style={{ ...card, padding:"24px 28px" }}>
        <div style={{ fontSize:16, fontWeight:700, color:t.textHeading, marginBottom:20, letterSpacing:"-0.2px" }}>Quick Access</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {MODULE_CARDS.map(m => (
            <div key={m.path} onClick={() => navigate(m.path)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 18px", borderRadius:12, border:`1px solid ${m.color}30`, background: dark ? m.bgD : m.bgL, cursor:"pointer", transition:"transform 0.15s ease" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <span style={{ fontSize:20 }}>{m.icon}</span>
              <span style={{ fontSize:13, fontWeight:600, color:m.color }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
