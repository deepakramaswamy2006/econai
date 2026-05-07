import { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { getHistoricalData } from "../services/api";
import { usePageTheme } from "../utils/pageTheme";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:"0 8px 24px rgba(0,0,0,0.3)" }}>
      <div style={{ fontWeight:700, color:"#e2e8f0", marginBottom:6 }}>{label}</div>
      {payload.map(p=>p.value!=null?(
        <div key={p.name} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
          <span style={{ width:10, height:3, borderRadius:2, background:p.name.includes("forecast")?"transparent":p.color, borderTop:p.name.includes("forecast")?`2px dashed ${p.color}`:"none", display:"inline-block" }} />
          <span style={{ color:"#94a3b8", textTransform:"capitalize" }}>{p.name.replace("forecast_","Forecast ")}:</span>
          <span style={{ color:p.color, fontWeight:700 }}>{typeof p.value==="number"?p.value.toFixed(2):p.value}%</span>
        </div>
      ):null)}
    </div>
  );
};

function ChartCard({ title, subtitle, badge, badgeColor, cardBg, cardBorder, textPrimary, textMuted, children }) {
  return (
    <div style={{ background:cardBg, borderRadius:16, border:cardBorder, padding:28, boxShadow:"0 1px 4px rgba(0,0,0,0.1)", transition:"background 0.3s" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:textPrimary }}>{title}</div>
          {subtitle&&<div style={{ fontSize:12, color:textMuted, marginTop:3 }}>{subtitle}</div>}
        </div>
        {badge&&(
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", background:(badgeColor||"#3b82f6")+"15", color:badgeColor||"#3b82f6", border:`1px solid ${(badgeColor||"#3b82f6")}30`, borderRadius:6, padding:"3px 10px" }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function StatStrip({ stats, textMuted }) {
  return (
    <div style={{ display:"flex", gap:12, marginBottom:28, flexWrap:"wrap" }}>
      {stats.map(s=>(
        <div key={s.label} style={{ flex:1, minWidth:150, background:s.color+"08", border:`1px solid ${s.color}20`, borderRadius:12, padding:"14px 18px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:s.color, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{s.label}</div>
          <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
          <div style={{ fontSize:11, color:textMuted, marginTop:2 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

const TABS = [
  { key:"gdp",       label:"GDP Growth",   color:"#3b82f6", actualKey:"gdp_growth",      forecastKey:"forecast_gdp",        unit:"%", referenceY:0,  referenceLabel:"Zero Growth" },
  { key:"inflation", label:"Inflation",    color:"#f59e0b", actualKey:"inflation",        forecastKey:"forecast_inflation",   unit:"%", referenceY:2,  referenceLabel:"2% Target" },
  { key:"job_market",label:"Job Market",   color:"#8b5cf6", actualKey:"job_market",       forecastKey:"forecast_job_market",  unit:"Index", referenceY:50, referenceLabel:"Stable (50)" },
  { key:"crisis",    label:"Crisis Risk",  color:"#ef4444", actualKey:"recession_chart",  forecastKey:"forecast_crisis",      unit:"%", referenceY:30, referenceLabel:"Medium Risk (30%)" },
];

function deriveStats(chartData, tab) {
  const hv = chartData.filter(d=>!d.is_forecast&&d[tab.actualKey]!=null).map(d=>({year:d.year,val:d[tab.actualKey]}));
  if(!hv.length){
    const fv=chartData.filter(d=>d.is_forecast&&d[tab.forecastKey]!=null);
    return [{label:"2026 Forecast",value:fv.length?fv[fv.length-1][tab.forecastKey]?.toFixed(1)+"%":"N/A",sub:"ML model projection",color:tab.color}];
  }
  const sorted=[...hv].sort((a,b)=>b.val-a.val);
  const peak=sorted[0],trough=sorted[sorted.length-1],latest=hv[hv.length-1];
  const fv=chartData.filter(d=>d.is_forecast&&d[tab.forecastKey]!=null);
  const f26=fv.length?fv[fv.length-1]:null;
  const pc=tab.key==="gdp"?"#22c55e":"#ef4444",tc=tab.key==="gdp"?"#ef4444":"#22c55e";
  void trough; void tc; void pc;
  return [
    {label:`${peak.year} Peak`,    value:peak.val.toFixed(1)+"%",   sub:"Historical high",    color:tab.key==="gdp"?"#22c55e":"#ef4444"},
    {label:`${latest.year} Latest`,value:latest.val.toFixed(1)+"%", sub:"Most recent actual",  color:tab.color},
    {label:"2026 Forecast",        value:f26?f26[tab.forecastKey]?.toFixed(1)+"%":"N/A", sub:"ML model projection", color:"#6366f1"},
  ];
}

export default function HistoricalTrends() {
  const [activeTab, setActiveTab] = useState("gdp");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const { dark, t } = usePageTheme();

  useEffect(() => {
    getHistoricalData()
      .then(res => { setChartData((res.data?.data||[]).map(d=>({...d,recession_chart:d.recession!=null?d.recession*100:null}))); setLoading(false); })
      .catch(err => { console.error(err); setError("Could not load data from the ML service. Please ensure the server is running."); setLoading(false); });
  }, []);

  const tab   = TABS.find(tt=>tt.key===activeTab);
  const stats = !loading&&chartData.length?deriveStats(chartData,tab):[];
  const useArea = activeTab==="gdp"||activeTab==="inflation"||activeTab==="crisis";
  const forecastColor = "#a78bfa";
  const gridColor = dark?"rgba(255,255,255,0.07)":"rgba(148,163,184,0.15)";
  const axisColor = dark?"#475569":"#94a3b8";

  return (
    <div style={{ maxWidth:1000, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:10 }}>
          <div style={{ width:44, height:44, background:dark?"rgba(34,197,94,0.12)":"#f0fdf4", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#22c55e" width={22} height={22}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l5.25-5.25 4.5 4.5 5.25-5.25M15.75 8.25h5.25v5.25" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize:24, fontWeight:800, color:t.textHeading, margin:0, letterSpacing:"-0.5px", transition:"color 0.3s" }}>Historical Trend Charts</h1>
            <p style={{ fontSize:13, color:t.textMuted, margin:0, fontWeight:500 }}>Macroeconomic data (2010–2025) with ML-powered forecasts through 2028</p>
          </div>
        </div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:8, background:dark?"rgba(34,197,94,0.1)":"#f0fdf4", border:dark?"1px solid rgba(34,197,94,0.2)":"1px solid #bbf7d0", borderRadius:20, padding:"4px 12px" }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", display:"inline-block" }} />
          <span style={{ fontSize:11, fontWeight:600, color:dark?"#4ade80":"#166534" }}>Historical data · ML Forecasts</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, background:t.segBg, borderRadius:12, padding:4, marginBottom:28, width:"fit-content" }}>
        {TABS.map(tt=>(
          <button key={tt.key} onClick={()=>setActiveTab(tt.key)} style={{ padding:"8px 20px", borderRadius:9, border:"none", background:activeTab===tt.key?t.segActiveBg:"transparent", color:activeTab===tt.key?tt.color:t.textMuted, fontWeight:activeTab===tt.key?700:500, fontSize:13, cursor:"pointer", transition:"all 0.15s", boxShadow:activeTab===tt.key?"0 1px 4px rgba(0,0,0,0.12)":"none", fontFamily:"inherit" }}>
            {tt.label}
          </button>
        ))}
      </div>

      {loading&&<div style={{ padding:40, textAlign:"center", color:t.textMuted, fontSize:14 }}>Loading real data from World Bank API...</div>}
      {error&&<div style={{ background:dark?"rgba(239,68,68,0.1)":"#fef2f2", border:"1px solid #fecaca", borderRadius:12, padding:"12px 16px", marginBottom:24, color:"#ef4444", fontSize:13 }}>⚠️ {error}</div>}

      {!loading&&!error&&stats.length>0&&<StatStrip stats={stats} textMuted={t.textMuted} />}

      {!loading&&!error&&chartData.length>0&&(
        <ChartCard title={`${tab.label} — 2010 to 2026`} subtitle="Historical data (2010–2025) with ML forecast through 2028" badge="Historical + ML Forecast" badgeColor={tab.color} cardBg={t.cardBg} cardBorder={t.cardBorder} textPrimary={t.textHeading} textMuted={t.textMuted}>
          <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:t.textMuted }}>
              <span style={{ width:24, height:3, background:tab.color, borderRadius:2, display:"inline-block" }} />Historical
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:t.textMuted }}>
              <span style={{ width:24, height:0, borderTop:`2px dashed ${forecastColor}`, display:"inline-block" }} />ML Forecast
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            {useArea?(
              <AreaChart data={chartData} margin={{top:8,right:8,bottom:0,left:-8}}>
                <defs>
                  <linearGradient id="actualArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tab.color} stopOpacity={0.18} /><stop offset="100%" stopColor={tab.color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={forecastColor} stopOpacity={0.12} /><stop offset="100%" stopColor={forecastColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="year" tick={{fill:axisColor,fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:axisColor,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                {tab.referenceY!==undefined&&<ReferenceLine y={tab.referenceY} stroke={dark?"rgba(255,255,255,0.15)":"#cbd5e1"} strokeDasharray="4 4" label={{value:tab.referenceLabel,fill:axisColor,fontSize:10,position:"insideTopRight"}} />}
                <ReferenceLine x="2024" stroke={dark?"rgba(255,255,255,0.1)":"#e2e8f0"} strokeDasharray="4 4" label={{value:"Forecast →",fill:axisColor,fontSize:10,position:"insideTopLeft"}} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke:"rgba(148,163,184,0.2)"}} />
                <Area type="monotone" dataKey={tab.actualKey} stroke={tab.color} strokeWidth={2.5} fill="url(#actualArea)" dot={{r:3,fill:tab.color,strokeWidth:0}} activeDot={{r:5,fill:tab.color}} connectNulls />
                <Area type="monotone" dataKey={tab.forecastKey} stroke={forecastColor} strokeWidth={2.5} strokeDasharray="6 4" fill="url(#forecastArea)" dot={{r:3,fill:forecastColor,strokeWidth:0}} activeDot={{r:5,fill:forecastColor}} connectNulls />
              </AreaChart>
            ):(
              <LineChart data={chartData} margin={{top:8,right:8,bottom:0,left:-8}}>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 4" vertical={false} />
                <XAxis dataKey="year" tick={{fill:axisColor,fontSize:11}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:axisColor,fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                {tab.referenceY!==undefined&&<ReferenceLine y={tab.referenceY} stroke={dark?"rgba(255,255,255,0.15)":"#cbd5e1"} strokeDasharray="4 4" label={{value:tab.referenceLabel,fill:axisColor,fontSize:10,position:"insideTopRight"}} />}
                <ReferenceLine x="2024" stroke={dark?"rgba(255,255,255,0.1)":"#e2e8f0"} strokeDasharray="4 4" label={{value:"Forecast →",fill:axisColor,fontSize:10,position:"insideTopLeft"}} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke:"rgba(148,163,184,0.2)"}} />
                <Line type="monotone" dataKey={tab.actualKey} stroke={tab.color} strokeWidth={2.5} dot={{r:3,fill:tab.color,strokeWidth:0}} activeDot={{r:5,fill:tab.color}} connectNulls />
                {tab.forecastKey&&<Line type="monotone" dataKey={tab.forecastKey} stroke={forecastColor} strokeWidth={2.5} strokeDasharray="6 4" dot={{r:3,fill:forecastColor,strokeWidth:0}} activeDot={{r:5,fill:forecastColor}} connectNulls />}
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartCard>
      )}

      {!loading&&!error&&chartData.length>0&&(
        <div style={{ marginTop:28 }}>
          <div style={{ fontSize:11, fontWeight:700, color:t.textSubtle, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>All Indicators Overview</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {TABS.map(tt=>(
              <div key={tt.key} onClick={()=>setActiveTab(tt.key)} style={{ background:activeTab===tt.key?tt.color+"10":t.cardBg, border:`1px solid ${activeTab===tt.key?tt.color+"40":t.divider}`, borderRadius:14, padding:"16px 20px", cursor:"pointer", transition:"all 0.15s" }}>
                <div style={{ fontSize:12, fontWeight:700, color:tt.color, marginBottom:10 }}>{tt.label}</div>
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={chartData} margin={{top:4,right:4,bottom:0,left:-24}}>
                    {tt.actualKey&&<Line type="monotone" dataKey={tt.actualKey} stroke={tt.color} strokeWidth={1.5} dot={false} connectNulls />}
                    {tt.forecastKey&&<Line type="monotone" dataKey={tt.forecastKey} stroke={forecastColor} strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />}
                    <XAxis dataKey="year" hide /><YAxis hide />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
