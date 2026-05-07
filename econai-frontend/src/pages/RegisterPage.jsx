import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const CURRENCY_SYMBOLS = [
  { sym:"$",  color:"#4ade80" }, { sym:"€",  color:"#818cf8" },
  { sym:"£",  color:"#f59e0b" }, { sym:"¥",  color:"#f87171" },
  { sym:"₹",  color:"#34d399" }, { sym:"₿",  color:"#fb923c" },
  { sym:"CHF",color:"#c084fc" }, { sym:"USD",color:"#4ade80" },
  { sym:"EUR",color:"#818cf8" }, { sym:"GBP",color:"#f59e0b" },
  { sym:"CPI",color:"#f87171" }, { sym:"BTC",color:"#fb923c" },
  { sym:"ETH",color:"#34d399" }, { sym:"GOLD",color:"#fbbf24" },
  { sym:"%",  color:"#a78bfa" }, { sym:"SPX",color:"#60a5fa" },
];

const FLOAT_POS = CURRENCY_SYMBOLS.map((s, i) => ({
  ...s,
  left: ((i * 43 + 9) % 88) + 4,
  top:  ((i * 59 + 11) % 85) + 5,
  dur:  5.5 + (i % 6) * 1.1,
  delay: -(i * 0.65),
  size: s.sym.length > 2 ? 12 : s.sym.length > 1 ? 14 : 22,
}));

export default function RegisterPage() {
  const { register }   = useAuth();
  const navigate       = useNavigate();
  const { dark, toggle } = useTheme();

  const [form, setForm]     = useState({ name:"", email:"", password:"", confirm:"" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const c = dark ? D : L;

  return (
    <div style={c.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}body{margin:0;font-family:'Inter',sans-serif;}
        @keyframes floatCoin{0%{transform:translateY(0) rotate(0deg) scale(1);opacity:.18}50%{transform:translateY(-30px) rotate(-6deg) scale(1.06);opacity:.3}100%{transform:translateY(0) rotate(0deg) scale(1);opacity:.18}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)}50%{box-shadow:0 0 0 8px rgba(99,102,241,0)}}
        .reg-input:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.15)!important;}
        .reg-btn:hover{opacity:.9;transform:translateY(-1px);}
        .toggle-btn:hover{opacity:.8;}
      `}</style>

      {/* Floating currency bg */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}} aria-hidden="true">
        {FLOAT_POS.map((f,i)=>(
          <span key={i} style={{
            position:"absolute", left:f.left+"%", top:f.top+"%",
            fontSize:f.size, fontWeight:800, color:f.color,
            opacity: dark ? 0.18 : 0.1,
            animation:`floatCoin ${f.dur}s ease-in-out ${f.delay}s infinite`,
            userSelect:"none", pointerEvents:"none",
            textShadow: dark ? `0 0 12px ${f.color}60` : `0 0 8px ${f.color}40`,
          }}>{f.sym}</span>
        ))}
      </div>

      {/* Orbs */}
      <div style={c.orb1}/><div style={c.orb2}/>

      {/* Theme toggle */}
      <button className="toggle-btn" onClick={toggle} style={c.toggleBtn} title="Toggle theme">
        {dark ? "☀️" : "🌙"}
      </button>

      {/* Card */}
      <div style={{...c.card, animation:"fadeUp 0.5s ease both"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:26}}>
          <div style={shared.logoBox}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" width={20} height={20}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
            </svg>
          </div>
          <div>
            <div style={c.logoName}>EconAI</div>
            <div style={c.logoSub}>Economic Intelligence</div>
          </div>
        </div>

        <h1 style={c.title}>Create your account</h1>
        <p style={c.subtitle}>Join EconAI and start analysing the economy</p>

        {error && <div style={shared.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={c.label}>Full name</label>
            <input id="reg-name" name="name" type="text" required value={form.name}
              onChange={handleChange} placeholder="Enter your full name"
              className="reg-input" style={c.input}/>
          </div>
          <div>
            <label style={c.label}>Email address</label>
            <input id="reg-email" name="email" type="email" required value={form.email}
              onChange={handleChange} placeholder="you@example.com"
              className="reg-input" style={c.input}/>
          </div>
          <div>
            <label style={c.label}>Password</label>
            <input id="reg-password" name="password" type="password" required value={form.password}
              onChange={handleChange} placeholder="Min. 6 characters"
              className="reg-input" style={c.input}/>
          </div>
          <div>
            <label style={c.label}>Confirm password</label>
            <input id="reg-confirm" name="confirm" type="password" required value={form.confirm}
              onChange={handleChange} placeholder="Re-enter your password"
              className="reg-input" style={c.input}/>
          </div>

          <button id="reg-submit" type="submit" disabled={loading} className="reg-btn"
            style={{...shared.submitBtn,marginTop:6,opacity:loading?0.7:1,transition:"opacity 0.2s,transform 0.2s"}}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={c.footerTxt}>
          Already have an account?{" "}
          <Link to="/login" style={shared.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

/* ── Shared ─────────────────────────────────────────────────────── */
const shared = {
  logoBox:  { width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 18px rgba(99,102,241,0.45)",flexShrink:0 },
  submitBtn:{ width:"100%",padding:"13px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 20px rgba(99,102,241,0.45)",animation:"pulse2 3s infinite" },
  link:     { color:"#6366f1",fontWeight:600,textDecoration:"none" },
  errorBox: { background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"10px 14px",color:"#dc2626",fontSize:13,marginBottom:16,fontWeight:500 },
};

/* ── Dark ───────────────────────────────────────────────────────── */
const D = {
  page:     { minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 16px",fontFamily:"'Inter',sans-serif",background:"linear-gradient(135deg,#0b0f1a 0%,#0f172a 50%,#1e1040 100%)",position:"relative",overflowX:"hidden" },
  orb1:     { position:"fixed",top:-180,left:-180,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  orb2:     { position:"fixed",bottom:-150,right:-100,width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  toggleBtn:{ position:"fixed",top:20,right:20,zIndex:200,fontSize:18,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"7px 11px",cursor:"pointer",lineHeight:1,transition:"opacity 0.2s" },
  card:     { position:"relative",zIndex:10,width:"100%",maxWidth:420,background:"#1e293b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:24,padding:"36px 36px",backdropFilter:"blur(24px)",boxShadow:"0 24px 64px rgba(0,0,0,0.5)" },
  logoName: { fontWeight:800,fontSize:16,color:"#fff",letterSpacing:"-0.3px" },
  logoSub:  { fontSize:11,color:"#64748b",fontWeight:500 },
  title:    { fontSize:24,fontWeight:800,color:"#f1f5f9",margin:"0 0 6px",letterSpacing:"-0.5px" },
  subtitle: { fontSize:13,color:"#64748b",margin:"0 0 22px" },
  label:    { display:"block",fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:5 },
  input:    { width:"100%",padding:"11px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#f1f5f9",fontSize:14,transition:"border-color 0.2s",boxSizing:"border-box" },
  footerTxt:{ textAlign:"center",marginTop:22,fontSize:13,color:"#64748b" },
};

/* ── Light ──────────────────────────────────────────────────────── */
const L = {
  page:     { minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 16px",fontFamily:"'Inter',sans-serif",background:"linear-gradient(135deg,#f0f4ff 0%,#ede9fe 50%,#f0fdf4 100%)",position:"relative",overflowX:"hidden" },
  orb1:     { position:"fixed",top:-180,left:-180,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  orb2:     { position:"fixed",bottom:-150,right:-100,width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  toggleBtn:{ position:"fixed",top:20,right:20,zIndex:200,fontSize:18,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"7px 11px",cursor:"pointer",lineHeight:1,transition:"opacity 0.2s" },
  card:     { position:"relative",zIndex:10,width:"100%",maxWidth:420,background:"rgba(255,255,255,0.92)",border:"1px solid rgba(99,102,241,0.15)",borderRadius:24,padding:"36px 36px",backdropFilter:"blur(24px)",boxShadow:"0 20px 60px rgba(99,102,241,0.12),0 4px 16px rgba(0,0,0,0.06)" },
  logoName: { fontWeight:800,fontSize:16,color:"#1e1b4b",letterSpacing:"-0.3px" },
  logoSub:  { fontSize:11,color:"#94a3b8",fontWeight:500 },
  title:    { fontSize:24,fontWeight:800,color:"#1e1b4b",margin:"0 0 6px",letterSpacing:"-0.5px" },
  subtitle: { fontSize:13,color:"#94a3b8",margin:"0 0 22px" },
  label:    { display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:5 },
  input:    { width:"100%",padding:"11px 14px",borderRadius:10,border:"1px solid #e2e8f0",background:"#f8fafc",color:"#0f172a",fontSize:14,transition:"border-color 0.2s,box-shadow 0.2s",boxSizing:"border-box" },
  footerTxt:{ textAlign:"center",marginTop:22,fontSize:13,color:"#94a3b8" },
};
