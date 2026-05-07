import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const SYMBOLS = ["$","€","£","¥","₹","₿","◈","AAPL","TSLA","BTC","ETH","SPX","GDP","CPI","USD","EUR","GBP","JPY","INR","NIFTY","DOW","NASDAQ","GOLD","OIL"];

const FEATURES = [
  { icon:"⚠️", title:"Crisis Prediction",   desc:"Detect early warning signals of financial crises using ML models trained on 50+ economic indicators.", accent:"#ef4444", bg:"rgba(239,68,68,0.08)",   border:"rgba(239,68,68,0.2)" },
  { icon:"📈", title:"GDP Forecast",         desc:"Multi-horizon GDP forecasting with confidence intervals powered by ensemble regression models.",       accent:"#3b82f6", bg:"rgba(59,130,246,0.08)",  border:"rgba(59,130,246,0.2)" },
  { icon:"💹", title:"Inflation Prediction", desc:"Predict CPI and inflation trends 12 months ahead using real World Bank macroeconomic data.",          accent:"#f59e0b", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.2)" },
  { icon:"🔬", title:"Scenario Simulator",   desc:"Run what-if simulations across interest rates, unemployment and trade to stress-test the economy.",    accent:"#0ea5e9", bg:"rgba(14,165,233,0.08)", border:"rgba(14,165,233,0.2)" },
  { icon:"📊", title:"Historical Trends",    desc:"Visualise 30+ years of global economic data with interactive charts and country-level comparisons.",   accent:"#22c55e", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.2)" },
  { icon:"🤖", title:"AI Explanations",      desc:"Every prediction comes with a plain-English AI explanation so you understand the why, not just the what.", accent:"#a855f7", bg:"rgba(168,85,247,0.08)", border:"rgba(168,85,247,0.2)" },
];

const STATS = [
  { value:"3,012",  label:"Training Records" },
  { value:"15yrs",  label:"2010 – 2025 Data" },
  { value:"4.92%",  label:"Avg GDP Growth" },
  { value:"93.15%", label:"Composite Accuracy" },
];

const FLOAT_ITEMS = SYMBOLS.map((s, i) => ({
  sym: s, left: ((i*37+11)%90)+2, top: ((i*53+7)%80)+5,
  dur: 6+(i%5)*1.4, delay: -(i*0.9), size: s.length>2?11:18,
}));

export default function LandingPage() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const c = dark ? DARK : LIGHT;

  return (
    <div style={{ ...c.page, transition:"background 0.4s, color 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;}
        body{margin:0;font-family:'Inter',sans-serif;}

        @keyframes floatUp{0%{transform:translateY(0) rotate(0deg);opacity:.1}50%{transform:translateY(-28px) rotate(4deg);opacity:.22}100%{transform:translateY(0) rotate(0deg);opacity:.1}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse2{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.45)}50%{box-shadow:0 0 0 10px rgba(99,102,241,0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes borderGlow{0%,100%{border-color:rgba(99,102,241,0.3)}50%{border-color:rgba(139,92,246,0.7)}}

        .feat-card:hover{transform:translateY(-6px)!important;box-shadow:0 24px 48px rgba(0,0,0,0.2)!important}
        .cta-btn:hover{transform:scale(1.04)!important}
        .nav-link:hover{color:#818cf8!important}
        .toggle-btn:hover{background:rgba(99,102,241,0.15)!important}
      `}</style>

      {/* Floating bg symbols */}
      <div style={c.floatLayer} aria-hidden="true">
        {FLOAT_ITEMS.map((f,i)=>(
          <span key={i} style={{position:"absolute",left:f.left+"%",top:f.top+"%",fontSize:f.size,fontWeight:700,color:dark?"#fff":"#6366f1",opacity:dark?0.1:0.08,animation:`floatUp ${f.dur}s ease-in-out ${f.delay}s infinite`,userSelect:"none",pointerEvents:"none"}}>{f.sym}</span>
        ))}
      </div>

      {/* Orbs */}
      <div style={c.orb1}/><div style={c.orb2}/><div style={c.orb3}/>

      {/* Navbar */}
      <nav style={c.nav}>
        <div style={c.navInner}>
          <div style={styles.logo}>
            <div style={styles.logoBox}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="white" width={18} height={18}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
              </svg>
            </div>
            <span style={c.logoText}>EconAI</span>
          </div>
          <div style={styles.navLinks}>
            <Link to="/login" className="nav-link" style={c.navLink}>Sign In</Link>
            <Link to="/register" style={styles.navCta}>Get Started</Link>
            {/* Theme toggle */}
            <button className="toggle-btn" onClick={toggle} title="Toggle theme" style={c.toggleBtn}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* Ticker */}
      <div style={c.ticker}>
        <div style={styles.tickerTrack}>
          {[...SYMBOLS,...SYMBOLS,...SYMBOLS,...SYMBOLS].map((sym,i)=>(
            <span key={i} style={{...c.tickerItem,color:i%3===0?"#4ade80":i%3===1?"#f87171":"#94a3b8"}}>
              {i%3===0?"▲":i%3===1?"▼":"◆"} {sym}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section style={c.hero}>
        <div style={{animation:"fadeUp 0.7s ease both",textAlign:"center",maxWidth:720,margin:"0 auto"}}>
          <div style={c.badge}>
            <span style={styles.badgeDot}/>
            AI-Powered Macroeconomic Intelligence
          </div>
          <h1 style={c.h1}>
            Predict the{" "}
            <span style={styles.gradient}>Global Economy</span>
            <br/>Before It Moves
          </h1>
          <p style={c.sub}>
            EconAI is trained on <strong style={{color:"#818cf8"}}>3,012 quarterly records</strong> spanning
            2010–2025 — forecasting GDP growth, inflation and recession risk using real macroeconomic data.
          </p>
          <div style={{...styles.heroActions,justifyContent:"center"}}>
            <button id="start-forecasting-btn" className="cta-btn" onClick={()=>navigate("/login")} style={styles.ctaBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={18} height={18}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
              </svg>
              Start Forecasting
            </button>
            <Link to="/register" style={c.ghostBtn}>Create free account →</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={c.statsRow}>
        {STATS.map((st,i)=>(
          <div key={i} style={c.statBox}>
            <div style={c.statVal}>{st.value}</div>
            <div style={c.statLabel}>{st.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={c.featSection}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <h2 style={c.sectionTitle}>Everything you need to analyse the economy</h2>
          <p style={c.sectionSub}>Six powerful modules, one unified platform</p>
        </div>
        <div style={styles.featGrid}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="feat-card" style={{...c.featCard,background:dark?f.bg:f.bg.replace("0.08","0.06"),borderColor:f.border,transition:"transform 0.25s,box-shadow 0.25s"}}>
              <div style={{width:48,height:48,borderRadius:14,fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,background:f.accent+"20",color:f.accent}}>{f.icon}</div>
              <h3 style={{fontSize:17,fontWeight:700,margin:"0 0 10px",letterSpacing:"-0.3px",color:f.accent}}>{f.title}</h3>
              <p style={c.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={c.bottomCta}>
        <h2 style={{...c.h1,fontSize:36,margin:"0 0 12px"}}>Ready to forecast the future?</h2>
        <p style={{...c.sub,maxWidth:480,margin:"0 auto 32px"}}>
          Join EconAI and get instant access to all prediction modules — no credit card required.
        </p>
        <button id="bottom-start-btn" className="cta-btn" onClick={()=>navigate("/login")} style={{...styles.ctaBtn,fontSize:16,padding:"16px 36px"}}>
          Start Forecasting — It's Free
        </button>
      </section>

      {/* Footer */}
      <footer style={c.footer}>
        <div style={styles.logo}>
          <div style={{...styles.logoBox,width:26,height:26}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="white" width={14} height={14}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
            </svg>
          </div>
          <span style={{...c.logoText,fontSize:14}}>EconAI</span>
        </div>
        <span style={c.footerText}>© 2026 EconAI · Economic Intelligence Platform</span>
      </footer>
    </div>
  );
}

/* ── Static styles (theme-independent) ────────────────────────── */
const styles = {
  logo:       { display:"flex", alignItems:"center", gap:10 },
  logoBox:    { width:34,height:34,borderRadius:9, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex",alignItems:"center",justifyContent:"center", boxShadow:"0 0 20px rgba(99,102,241,0.4)" },
  navLinks:   { display:"flex", alignItems:"center", gap:16 },
  navCta:     { padding:"8px 20px",borderRadius:20,background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none",boxShadow:"0 4px 14px rgba(99,102,241,0.4)" },
  badgeDot:   { width:7,height:7,borderRadius:"50%",background:"#6366f1",boxShadow:"0 0 8px #6366f1",animation:"pulse2 2s infinite",display:"inline-block" },
  gradient:   { background:"linear-gradient(135deg,#818cf8,#c084fc,#4ade80)",backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"shimmer 3s linear infinite" },
  heroActions:{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" },
  ctaBtn:     { display:"inline-flex",alignItems:"center",gap:8,padding:"14px 30px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 30px rgba(99,102,241,0.5)",transition:"transform 0.2s",animation:"pulse2 3s infinite",letterSpacing:"0.01em" },
  tickerTrack:{ display:"flex",gap:0,whiteSpace:"nowrap",animation:"ticker 40s linear infinite" },
  featGrid:   { display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20 },
};

/* ── Dark theme ────────────────────────────────────────────────── */
const DARK = {
  page:       { minHeight:"100vh",background:"linear-gradient(135deg,#0b0f1a 0%,#0f172a 40%,#1e1040 80%,#0b0f1a 100%)",fontFamily:"'Inter',sans-serif",color:"#f8fafc",overflowX:"hidden",position:"relative" },
  floatLayer: { position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden" },
  orb1:       { position:"fixed",top:-200,left:-200,width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  orb2:       { position:"fixed",bottom:-200,right:-100,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  orb3:       { position:"fixed",top:"40%",right:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  nav:        { position:"sticky",top:0,zIndex:100,background:"rgba(11,15,26,0.85)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.06)" },
  navInner:   { maxWidth:1180,margin:"0 auto",padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between" },
  logoText:   { fontWeight:800,fontSize:18,color:"#fff",letterSpacing:"-0.5px" },
  navLink:    { color:"#94a3b8",fontSize:14,fontWeight:500,textDecoration:"none",transition:"color 0.2s" },
  toggleBtn:  { fontSize:18,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"6px 10px",cursor:"pointer",transition:"background 0.2s",lineHeight:1 },
  ticker:     { background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.06)",overflow:"hidden",padding:"10px 0",position:"relative",zIndex:1 },
  tickerItem: { display:"inline-flex",alignItems:"center",gap:4,padding:"0 20px",fontSize:12,fontWeight:600,letterSpacing:"0.05em",borderRight:"1px solid rgba(255,255,255,0.06)" },
  hero:       { maxWidth:1180,margin:"0 auto",padding:"90px 32px 70px",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1 },
  badge:      { display:"inline-flex",alignItems:"center",gap:8,padding:"7px 16px",borderRadius:20,marginBottom:24,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.35)",fontSize:12,fontWeight:600,color:"#a5b4fc",letterSpacing:"0.04em" },
  h1:         { fontSize:58,fontWeight:900,lineHeight:1.1,margin:"0 0 20px",letterSpacing:"-2px",color:"#f8fafc" },
  sub:        { fontSize:17,color:"#94a3b8",lineHeight:1.7,margin:"0 auto 36px",textAlign:"center",maxWidth:520,fontWeight:400 },
  ghostBtn:   { color:"#94a3b8",fontSize:14,fontWeight:600,textDecoration:"none" },
  statsRow:   { display:"flex",justifyContent:"center",flexWrap:"wrap",borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)",position:"relative",zIndex:1 },
  statBox:    { flex:"1 1 180px",textAlign:"center",padding:"40px 20px",borderRight:"1px solid rgba(255,255,255,0.05)",transition:"background 0.2s" },
  statVal:    { fontSize:40,fontWeight:900,color:"#818cf8",letterSpacing:"-2px",marginBottom:6 },
  statLabel:  { fontSize:13,color:"#64748b",fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase" },
  featSection:{ maxWidth:1180,margin:"0 auto",padding:"80px 32px",position:"relative",zIndex:1 },
  sectionTitle:{ fontSize:36,fontWeight:800,color:"#f8fafc",margin:"0 0 12px",letterSpacing:"-1px" },
  sectionSub: { fontSize:16,color:"#64748b",margin:0 },
  featCard:   { padding:"28px 26px",borderRadius:20,border:"1px solid",backdropFilter:"blur(10px)",cursor:"default" },
  featDesc:   { fontSize:14,color:"#94a3b8",lineHeight:1.65,margin:0 },
  bottomCta:  { textAlign:"center",padding:"80px 32px",background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))",borderTop:"1px solid rgba(99,102,241,0.2)",position:"relative",zIndex:1 },
  footer:     { display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,maxWidth:1180,margin:"0 auto",padding:"24px 32px",borderTop:"1px solid rgba(255,255,255,0.05)",position:"relative",zIndex:1 },
  footerText: { color:"#475569",fontSize:12 },
};

/* ── Light theme ────────────────────────────────────────────────── */
const LIGHT = {
  page:       { minHeight:"100vh",background:"linear-gradient(135deg,#f0f4ff 0%,#ede9fe 40%,#f5f3ff 80%,#f0f9ff 100%)",fontFamily:"'Inter',sans-serif",color:"#0f172a",overflowX:"hidden",position:"relative" },
  floatLayer: { position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden" },
  orb1:       { position:"fixed",top:-200,left:-200,width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  orb2:       { position:"fixed",bottom:-200,right:-100,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  orb3:       { position:"fixed",top:"40%",right:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,197,94,0.06) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 },
  nav:        { position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,0.85)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(99,102,241,0.12)" },
  navInner:   { maxWidth:1180,margin:"0 auto",padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between" },
  logoText:   { fontWeight:800,fontSize:18,color:"#1e1b4b",letterSpacing:"-0.5px" },
  navLink:    { color:"#6366f1",fontSize:14,fontWeight:500,textDecoration:"none",transition:"color 0.2s" },
  toggleBtn:  { fontSize:18,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"6px 10px",cursor:"pointer",transition:"background 0.2s",lineHeight:1 },
  ticker:     { background:"rgba(99,102,241,0.04)",borderBottom:"1px solid rgba(99,102,241,0.1)",overflow:"hidden",padding:"10px 0",position:"relative",zIndex:1 },
  tickerItem: { display:"inline-flex",alignItems:"center",gap:4,padding:"0 20px",fontSize:12,fontWeight:600,letterSpacing:"0.05em",borderRight:"1px solid rgba(99,102,241,0.08)" },
  hero:       { maxWidth:1180,margin:"0 auto",padding:"90px 32px 70px",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:1 },
  badge:      { display:"inline-flex",alignItems:"center",gap:8,padding:"7px 16px",borderRadius:20,marginBottom:24,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",fontSize:12,fontWeight:600,color:"#6366f1",letterSpacing:"0.04em" },
  h1:         { fontSize:58,fontWeight:900,lineHeight:1.1,margin:"0 0 20px",letterSpacing:"-2px",color:"#1e1b4b" },
  sub:        { fontSize:17,color:"#64748b",lineHeight:1.7,margin:"0 auto 36px",textAlign:"center",maxWidth:520,fontWeight:400 },
  ghostBtn:   { color:"#6366f1",fontSize:14,fontWeight:600,textDecoration:"none" },
  statsRow:   { display:"flex",justifyContent:"center",flexWrap:"wrap",borderTop:"1px solid rgba(99,102,241,0.1)",borderBottom:"1px solid rgba(99,102,241,0.1)",background:"rgba(255,255,255,0.6)",position:"relative",zIndex:1 },
  statBox:    { flex:"1 1 180px",textAlign:"center",padding:"40px 20px",borderRight:"1px solid rgba(99,102,241,0.08)",transition:"background 0.2s" },
  statVal:    { fontSize:40,fontWeight:900,color:"#6366f1",letterSpacing:"-2px",marginBottom:6 },
  statLabel:  { fontSize:13,color:"#94a3b8",fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase" },
  featSection:{ maxWidth:1180,margin:"0 auto",padding:"80px 32px",position:"relative",zIndex:1 },
  sectionTitle:{ fontSize:36,fontWeight:800,color:"#1e1b4b",margin:"0 0 12px",letterSpacing:"-1px" },
  sectionSub: { fontSize:16,color:"#94a3b8",margin:0 },
  featCard:   { padding:"28px 26px",borderRadius:20,border:"1px solid",background:"rgba(255,255,255,0.8)",backdropFilter:"blur(10px)",cursor:"default",boxShadow:"0 4px 20px rgba(99,102,241,0.06)" },
  featDesc:   { fontSize:14,color:"#64748b",lineHeight:1.65,margin:0 },
  bottomCta:  { textAlign:"center",padding:"80px 32px",background:"linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.06))",borderTop:"1px solid rgba(99,102,241,0.15)",position:"relative",zIndex:1 },
  footer:     { display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,maxWidth:1180,margin:"0 auto",padding:"24px 32px",borderTop:"1px solid rgba(99,102,241,0.1)",position:"relative",zIndex:1 },
  footerText: { color:"#94a3b8",fontSize:12 },
};
