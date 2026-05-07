import { useState, useEffect, useCallback, useRef } from "react";
import { predictGDP, predictCrisis, predictInflation } from "../services/api";
import { usePageTheme } from "../utils/pageTheme";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

const PRESETS = [
  { name:"🌟 Boom",       desc:"High growth, healthy economy",    color:"#22c55e", values:{ gdp_growth:6.0,  inflation:2.5,  industrial_production:4.0,  job_market:78, recession_indicator:0, quarter:2 } },
  { name:"📊 Baseline",   desc:"Moderate, stable conditions",     color:"#3b82f6", values:{ gdp_growth:3.0,  inflation:4.5,  industrial_production:1.0,  job_market:55, recession_indicator:0, quarter:2 } },
  { name:"🔥 Stagflation",desc:"High inflation, stagnant growth", color:"#f59e0b", values:{ gdp_growth:0.5,  inflation:9.5,  industrial_production:-1.0, job_market:40, recession_indicator:0, quarter:4 } },
  { name:"💥 Crisis",     desc:"Active economic collapse",        color:"#ef4444", values:{ gdp_growth:-2.5, inflation:14.0, industrial_production:-4.5, job_market:20, recession_indicator:1, quarter:1 } },
];
const DEFAULTS = PRESETS[1].values;
const SLIDERS = [
  { name:"gdp_growth",            label:"GDP Growth",       min:-6, max:10,  step:0.1, unit:"%", color:"#3b82f6" },
  { name:"inflation",             label:"Inflation Rate",   min:0,  max:20,  step:0.1, unit:"%", color:"#f59e0b" },
  { name:"industrial_production", label:"Industrial Prod.", min:-6, max:6,   step:0.1, unit:"%", color:"#06b6d4" },
  { name:"job_market",            label:"Job Market Index", min:0,  max:100, step:1,   unit:"",  color:"#8b5cf6" },
];

function Slider({ label, name, min, max, step, value, onChange, unit, color, mutedColor }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <label style={{ fontSize:12, fontWeight:700, color:mutedColor, textTransform:"uppercase", letterSpacing:"0.03em" }}>{label}</label>
        <span style={{ fontSize:13, fontWeight:700, color, background:color+"15", border:`1px solid ${color}30`, borderRadius:6, padding:"2px 10px", minWidth:56, textAlign:"right" }}>
          {value>=0&&name!=="recession_indicator"?(value>0&&name==="gdp_growth"?"+":""):""}{value.toFixed(name==="job_market"?0:1)}{unit}
        </span>
      </div>
      <div style={{ position:"relative", height:6, borderRadius:10, background:"rgba(148,163,184,0.2)" }}>
        <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${Math.max(0,pct)}%`, borderRadius:10, background:`linear-gradient(90deg,${color}70,${color})`, transition:"width 0.1s" }} />
        <input type="range" name={name} min={min} max={max} step={step} value={value}
          onChange={e=>onChange(name,parseFloat(e.target.value))}
          style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%", height:"100%" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        <span style={{ fontSize:10, color:"#94a3b8" }}>{min}{unit}</span>
        <span style={{ fontSize:10, color:"#94a3b8" }}>{max}{unit}</span>
      </div>
    </div>
  );
}

function ResultCard({ title, value, suffix, color, bg, label, loading }) {
  return (
    <div style={{ background:bg, border:`1px solid ${color}30`, borderRadius:14, padding:"20px 22px", flex:1, transition:"all 0.3s", minWidth:0 }}>
      <div style={{ fontSize:10, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{title}</div>
      {loading
        ? <div style={{ height:48, background:color+"20", borderRadius:8, animation:"cardPulse 1.2s ease-in-out infinite" }} />
        : <div style={{ fontSize:40, fontWeight:800, color, lineHeight:1, letterSpacing:"-1px" }}>{value}{suffix}</div>}
      {label && !loading && (
        <div style={{ marginTop:10, display:"inline-block", background:color+"18", border:`1px solid ${color}40`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</div>
      )}
    </div>
  );
}

export default function ScenarioSimulator() {
  const [form, setForm] = useState(DEFAULTS);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState(1);
  const debounceRef = useRef(null);
  const { dark, t } = usePageTheme();

  const fetchPredictions = useCallback(async (values) => {
    setLoading(true);
    try {
      const payload = { gdp_growth:Number(values.gdp_growth), inflation:Number(values.inflation), industrial_production:Number(values.industrial_production), job_market:Number(values.job_market), recession_indicator:Number(values.recession_indicator), quarter:Number(values.quarter) };
      const [cRes,gRes,iRes] = await Promise.allSettled([predictCrisis(payload),predictGDP(payload),predictInflation(payload)]);
      setResults({ crisis:cRes.status==="fulfilled"?Number(cRes.value?.data?.crisis_probability??0.22):0.22, gdp:gRes.status==="fulfilled"?Number(gRes.value?.data?.predicted_gdp_growth??values.gdp_growth):Number(values.gdp_growth), inflation:iRes.status==="fulfilled"?Number(iRes.value?.data?.predicted_inflation??values.inflation):Number(values.inflation) });
    } catch { setResults({ crisis:0.22, gdp:Number(form.gdp_growth), inflation:Number(form.inflation) }); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  const handleSliderChange = (name,val) => { const f={...form,[name]:val}; setForm(f); setActivePreset(null); if(debounceRef.current)clearTimeout(debounceRef.current); debounceRef.current=setTimeout(()=>fetchPredictions(f),450); };
  const toggleRecession = (val) => { const f={...form,recession_indicator:val}; setForm(f); setActivePreset(null); if(debounceRef.current)clearTimeout(debounceRef.current); debounceRef.current=setTimeout(()=>fetchPredictions(f),200); };
  const applyPreset = (idx) => { setActivePreset(idx); const p=PRESETS[idx]; setForm(p.values); if(debounceRef.current)clearTimeout(debounceRef.current); fetchPredictions(p.values); };

  useEffect(() => { fetchPredictions(DEFAULTS); return ()=>{if(debounceRef.current)clearTimeout(debounceRef.current);}; }, []); // eslint-disable-line

  const crisisPct  = results?results.crisis*100:0;
  const crisisColor= crisisPct>=60?"#ef4444":crisisPct>=30?"#f59e0b":"#22c55e";
  const crisisBg   = dark?(crisisPct>=60?"rgba(239,68,68,0.12)":crisisPct>=30?"rgba(245,158,11,0.12)":"rgba(34,197,94,0.12)"):(crisisPct>=60?"#fef2f2":crisisPct>=30?"#fffbeb":"#f0fdf4");
  const crisisLabel= crisisPct>=60?"High Risk":crisisPct>=30?"Medium Risk":"Low Risk";
  const gdpVal     = results?.gdp??0;
  const gdpColor   = gdpVal>=3?"#22c55e":gdpVal>=1?"#3b82f6":gdpVal>=0?"#f97316":"#ef4444";
  const gdpBg      = dark?(gdpVal>=3?"rgba(34,197,94,0.12)":gdpVal>=1?"rgba(59,130,246,0.12)":gdpVal>=0?"rgba(249,115,22,0.12)":"rgba(239,68,68,0.12)"):(gdpVal>=3?"#f0fdf4":gdpVal>=1?"#eff6ff":gdpVal>=0?"#fff7ed":"#fef2f2");
  const gdpLabel   = gdpVal>=3?"Strong Growth":gdpVal>=1?"Moderate Growth":gdpVal>=0?"Weak Growth":"Contraction";
  const inflVal    = results?.inflation??0;
  const inflColor  = inflVal<=2.5?"#22c55e":inflVal<=5?"#f59e0b":"#ef4444";
  const inflBg     = dark?(inflVal<=2.5?"rgba(34,197,94,0.12)":inflVal<=5?"rgba(245,158,11,0.12)":"rgba(239,68,68,0.12)"):(inflVal<=2.5?"#f0fdf4":inflVal<=5?"#fffbeb":"#fef2f2");
  const inflLabel  = inflVal<=2.5?"Within Target":inflVal<=5?"Elevated":"High Inflation";

  const radarData = [
    {axis:"GDP Growth",  value:Math.min(Math.max(((form.gdp_growth+6)/16)*100,0),100)},
    {axis:"Inflation",   value:Math.min((form.inflation/20)*100,100)},
    {axis:"Ind. Prod.",  value:Math.min(Math.max(((form.industrial_production+6)/12)*100,0),100)},
    {axis:"Job Market",  value:Math.min((form.job_market/100)*100,100)},
    {axis:"Crisis Risk", value:Math.min(crisisPct,100)},
  ];

  return (
    <div style={{ maxWidth:1040, margin:"0 auto", paddingBottom:60 }}>
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <div style={{ width:8, height:24, background:"#6366f1", borderRadius:4 }} />
          <h1 style={{ fontSize:26, fontWeight:800, color:t.textHeading, margin:0, letterSpacing:"-0.5px", transition:"color 0.3s" }}>Scenario Simulator</h1>
        </div>
        <p style={{ fontSize:13, color:t.textMuted, margin:0, fontWeight:500, paddingLeft:18 }}>Adjust macroeconomic levers and see all 3 ML predictions update live</p>
      </div>

      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, fontWeight:700, color:t.textSubtle, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>Quick Scenarios</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {PRESETS.map((p,i)=>(
            <button key={i} onClick={()=>applyPreset(i)} style={{ padding:"10px 16px", borderRadius:10, border:`1px solid ${activePreset===i?p.color:t.divider}`, background:activePreset===i?p.color+"18":t.cardBg, color:activePreset===i?p.color:t.text, fontSize:13, fontWeight:activePreset===i?700:500, cursor:"pointer", transition:"all 0.15s", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:2, fontFamily:"inherit" }}>
              <span>{p.name}</span>
              <span style={{ fontSize:10, color:activePreset===i?p.color+"cc":t.textSubtle, fontWeight:400 }}>{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div style={{ background:t.cardBg, borderRadius:12, border:t.cardBorder, boxShadow:t.cardShadow, overflow:"hidden", transition:"background 0.3s" }}>
          <div style={{ background:t.cardHeaderBg, padding:"14px 22px", borderBottom:`1px solid ${t.divider}` }}>
            <h2 style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", margin:0 }}>Economic Levers</h2>
          </div>
          <div style={{ padding:"22px 24px 8px" }}>
            {SLIDERS.map(s=><Slider key={s.name} {...s} value={form[s.name]} onChange={handleSliderChange} mutedColor={t.textMuted} />)}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.03em", marginBottom:10 }}>Recession Status</div>
              <div style={{ display:"flex", background:t.segBg, padding:4, borderRadius:8, gap:4 }}>
                {[{val:0,label:"Normal Economy"},{val:1,label:"Active Recession"}].map(({val,label})=>(
                  <button key={val} onClick={()=>toggleRecession(val)} style={{ flex:1, padding:"8px 0", border:"none", borderRadius:6, background:form.recession_indicator===val?t.segActiveBg:"transparent", color:form.recession_indicator===val?(val===1?"#ef4444":t.text):t.textMuted, fontWeight:form.recession_indicator===val?700:500, fontSize:13, cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit" }}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.03em", marginBottom:8 }}>Quarter</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                {[1,2,3,4].map(q=>(
                  <button key={q} onClick={()=>handleSliderChange("quarter",q)} style={{ padding:"6px 0", border:`1px solid ${form.quarter===q?"#6366f1":t.divider}`, borderRadius:6, fontSize:12, fontWeight:form.quarter===q?700:500, color:form.quarter===q?"#6366f1":t.textMuted, background:form.quarter===q?(dark?"rgba(99,102,241,0.15)":"#ede9fe"):t.cardBg, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }}>Q{q}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background:t.cardBg, borderRadius:12, border:t.cardBorder, boxShadow:t.cardShadow, overflow:"hidden", transition:"background 0.3s" }}>
          <div style={{ background:t.cardHeaderBg, padding:"14px 22px", borderBottom:`1px solid ${t.divider}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h2 style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", margin:0 }}>Risk Radar</h2>
            {loading&&<div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:t.textMuted }}><span style={{ width:8, height:8, borderRadius:"50%", background:"#6366f1", display:"inline-block", animation:"scenarioPulse 0.9s infinite" }} />Updating...</div>}
          </div>
          <div style={{ padding:"16px 8px" }}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{top:10,right:28,bottom:10,left:28}}>
                <PolarGrid stroke={dark?"rgba(255,255,255,0.1)":"#e2e8f0"} />
                <PolarAngleAxis dataKey="axis" tick={{fontSize:11,fill:t.textMuted,fontWeight:600}} />
                <Radar name="Profile" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} strokeWidth={2} />
                <Tooltip content={({active,payload})=>!active||!payload?.length?null:(
                  <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"6px 12px"}}>
                    <div style={{fontSize:11,color:"#a78bfa",fontWeight:700}}>{payload[0]?.payload?.axis}</div>
                    <div style={{fontSize:12,color:"#e2e8f0",fontWeight:600}}>{payload[0]?.value?.toFixed(0)}% intensity</div>
                  </div>
                )} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{margin:"0 12px",padding:"12px 16px",background:t.cardHeaderBg,borderRadius:10,border:`1px solid ${t.divider}`}}>
              <div style={{fontSize:10,fontWeight:700,color:t.textSubtle,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Current Inputs</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px"}}>
                {SLIDERS.map(s=>(
                  <div key={s.name} style={{display:"flex",justifyContent:"space-between",fontSize:12,alignItems:"center"}}>
                    <span style={{color:t.textMuted}}>{s.label.split(" ").slice(0,2).join(" ")}</span>
                    <span style={{fontWeight:700,color:s.color}}>{s.name==="gdp_growth"&&form[s.name]>0?"+":""}{form[s.name].toFixed(s.name==="job_market"?0:1)}{s.unit}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:t.textMuted}}>Recession</span>
                  <span style={{fontWeight:700,color:form.recession_indicator?"#ef4444":"#22c55e"}}>{form.recession_indicator?"Active":"None"}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:t.textMuted}}>Quarter</span>
                  <span style={{fontWeight:700,color:"#6366f1"}}>Q{form.quarter}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div style={{fontSize:11,fontWeight:700,color:t.textSubtle,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Live ML Predictions</div>
        <div style={{display:"flex",gap:14}}>
          <ResultCard title="Crisis Probability" value={results?crisisPct.toFixed(1):"–"} suffix="%" color={crisisColor} bg={crisisBg} label={results?crisisLabel:null} loading={loading} />
          <ResultCard title="GDP Forecast"       value={results?((gdpVal>=0?"+":"")+gdpVal.toFixed(2)):"–"} suffix="%" color={gdpColor} bg={gdpBg} label={results?gdpLabel:null} loading={loading} />
          <ResultCard title="Inflation Forecast" value={results?inflVal.toFixed(2):"–"} suffix="%" color={inflColor} bg={inflBg} label={results?inflLabel:null} loading={loading} />
        </div>
      </div>
      <style>{`@keyframes scenarioPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(0.8)}} @keyframes cardPulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
    </div>
  );
}
