import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area, AreaChart,
} from "recharts";
 

const C = {
  pageBg:     "rgba(5, 15, 35, 0.82)",
  sidebarBg:  "#0d1929",
  mainBg:     "#080f1e",
  cardBg:     "rgba(10, 25, 50, 0.65)",
  cardSolid:  "#0d1929",
  statBg:     "#111c30",
  inputBg:    "rgba(5, 15, 35, 0.6)",
  border:        "rgba(56, 189, 248, 0.18)",
  borderActive:  "rgba(56, 189, 248, 0.7)",
  borderSubtle:  "rgba(255,255,255,0.07)",
  borderCard:    "rgba(56,189,248,0.12)",
  textPrimary:   "#e2e8f0",
  textSecondary: "#94a3b8",
  textMuted:     "#64748b",
  textDisabled:  "#334155",
  accent:        "#38bdf8",
  accentBtn:     "#0ea5e9",
  accentDim:     "rgba(56,189,248,0.08)",
  critical:      "#ef4444",
  criticalBg:    "rgba(239,68,68,0.12)",
  warning:       "#f59e0b",
  success:       "#10b981",
  successBg:     "rgba(16,185,129,0.08)",
};

function useMediaQuery(maxWidth) {
  const [m, setM] = useState(window.innerWidth <= maxWidth);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= maxWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [maxWidth]);
  return m;
}

function makeSpeedPowerData() {
  const speeds = Array.from({length: 51}, (_, i) => i);
  return speeds.map(s => ({
    speed: s,
    design:  Math.round(0.3 * Math.pow(s, 2.8)),
    actual:  Math.round(0.22 * Math.pow(s, 2.75)),
    simulated: Math.round(0.16 * Math.pow(s, 2.7)),
  }));
}

const speedPowerData = makeSpeedPowerData();

const Logo = ({ small }) => (
  <img src="/OPTI.png"
    style={{ width: small ? 56 : 72, height: small ? 22 : 28, objectFit:"contain" }}
    alt="OPTIQ" />
);

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    html, body, #root { margin:0; padding:0; min-height:100%; }
    body { font-family: 'DM Sans', sans-serif; background:#080f1e; }
    @keyframes slideUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
    @keyframes spin      { to{transform:rotate(360deg)} }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.5} }
    input:focus, select:focus {
      outline:none;
      border-color: rgba(56,189,248,0.7) !important;
      box-shadow: 0 0 0 3px rgba(56,189,248,0.1) !important;
    }
    select option { background:#0d1929; color:#e2e8f0; }
    ::-webkit-scrollbar { width:4px; height:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(56,189,248,0.2); border-radius:4px; }
  `}</style>
);


function LandingPage({ onEnter }) {
  const [imo, setImo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery(768);

  const modules = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><path d="M3 17l4-8 4 4 4-6 4 10"/><path d="M3 20h18"/></svg>,
      title: "Hull Analysis",
      desc: "AI-Powered Hull Fouling Analysis. Upload photos for detailed fouling assessment and resistance calculation.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
      title: "ESD Simulator",
      desc: "Test and compare Mewis Duct, PBCF, about 50% and existing options to determine savings.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
      title: "Weather Intelligence",
      desc: "Correlate performance against weather and ocean conditions to optimize routes.",
    },
  ];

 
const handleAnalyze = async (e) => {
  e?.preventDefault();

  console.log(" BUTTON CLICKED");

  if (!imo || !imo.trim()) {
    setErr("IMO number is required");
    return;
  }

  if (!/^\d{7}$/.test(imo.trim())) {
    setErr("IMO must be exactly 7 digits");
    return;
  }

  setErr("");
  setLoading(true);

  try {
    console.log(" CALLING API...");

    const formdata = new FormData();
    formdata.append("text_input", imo.trim());

    const response = await fetch(
      "http://65.1.246.191:8000/Vessel_Performance_Project/run",
      {
        method: "POST",
        body: formdata,
      }
    );

    console.log(" RESPONSE RECEIVED");

    const result = await response.json();
    console.log(" RESULT:", result);

    if (result.status === "success") {
      onEnter(imo.trim(), result);
    } else {
      setErr("Analysis failed");
    }

  } catch (error) {
    console.error(" ERROR:", error);
    setErr("Server error");
  }

  setLoading(false);
};

  return (
    <div style={{
      minHeight:"100vh",
      backgroundImage:"url('/Background.png')",
      backgroundSize:"cover", backgroundPosition:"center", backgroundAttachment:"fixed",
      position:"relative",
    }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(5,15,35,0.80)", zIndex:0 }} />
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", minHeight:"100vh" }}>

        {/* Top navbar */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding: isMobile ? "14px 4vw" : "18px 5vw",
          borderBottom:`1px solid ${C.borderSubtle}`,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <Logo />
            {!isMobile && (
              <div style={{ borderLeft:`1px solid ${C.borderSubtle}`, paddingLeft:14 }}>
                <div style={{ fontSize:13, color:C.textPrimary, fontWeight:500 }}>Optiq Maritime Solutions</div>
                <div style={{ fontSize:11, color:C.textMuted }}>Vessel Performance Platform</div>
              </div>
            )}
          </div>
          {!isMobile && (
            <nav style={{ display:"flex", gap:0, alignItems:"center" }}>
              {["API Docs","ISO 19030 Standard","Platform Status"].map((l,i) => (
                <span key={i} style={{
                  fontSize:13, color:C.textSecondary, cursor:"pointer",
                  padding:"0 20px",
                  borderLeft:`1px solid ${C.borderSubtle}`,
                  transition:"color .2s",
                }}
                  onMouseEnter={e=>e.currentTarget.style.color=C.accent}
                  onMouseLeave={e=>e.currentTarget.style.color=C.textSecondary}
                >{l}</span>
              ))}
            </nav>
          )}
        </div>

        {/* Main content */}
        <div style={{
          flex:1, display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 24 : 40,
          alignItems:"center",
          padding: isMobile ? "32px 4vw" : "60px 7vw",
        }}>
          {/* Left — module cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {modules.map((m,i) => (
              <div key={i} style={{
                display:"flex", alignItems:"flex-start", gap:16,
                padding:"18px 20px",
                background:"rgba(10,25,50,0.55)",
                border:`1px solid ${C.border}`,
                borderRadius:14, backdropFilter:"blur(12px)",
                animation:`slideUp 0.5s ${i*0.1}s both`,
              }}>
                <div style={{
                  width:44, height:44, borderRadius:10, flexShrink:0,
                  background:"rgba(56,189,248,0.08)",
                  border:`1px solid ${C.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:C.textPrimary, fontFamily:"'Syne',sans-serif", marginBottom:5 }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize:13, color:C.textMuted, lineHeight:1.55 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — form card */}
          <div className="Rightcard" style={{
            background:"rgba(10,25,50,0.70)",
            border:`1px solid ${C.border}`,
            borderRadius:16, 
            backdropFilter:"blur(20px)",
            animation:"slideUp 0.6s 0.15s both",
          }}>
            {/* Card header */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2">
                <rect x="2" y="2" width="7" height="7" rx="1"/>
                <rect x="15" y="2" width="7" height="7" rx="1"/>
                <rect x="2" y="15" width="7" height="7" rx="1"/>
                <path d="M15 15h7v7"/>
              </svg>
              <span style={{ fontSize:17, fontWeight:700, color:C.textPrimary, fontFamily:"'Syne',sans-serif" }}>
                Access Detailed Performance Analysis
              </span>
            </div>
            <div style={{ height:1, background:C.borderSubtle, margin:"16px 0 22px" }} />

            <div style={{ fontSize:13, color:C.textSecondary, marginBottom:8 }}>Enter IMO Number</div>
            <input
              type="text" maxLength={7}
              placeholder="e.g 9483451"
              value={imo}
              onChange={e => { setImo(e.target.value); setErr(""); }}
              style={{
                width:"100%", padding:"14px 16px", borderRadius:10,
                border:`1px solid ${err ? "#f87171" : C.border}`,
                background:C.inputBg, color:C.textPrimary, fontSize:15,
                fontFamily:"'DM Sans',sans-serif",
                backdropFilter:"blur(8px)", marginBottom: err ? 6 : 20,
              }}
            />
            {err && <p style={{ margin:"0 0 14px", fontSize:12, color:"#f87171" }}>{err}</p>}

            <button
            type="button"
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                width:"100%", padding:"15px",
                background: loading ? "rgba(14,165,233,0.4)" : C.accentBtn,
                color:"#fff", border:"none", borderRadius:10,
                fontSize:13, fontWeight:700, letterSpacing:"0.1em",
                textTransform:"uppercase", cursor: loading ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                transition:"all .25s", marginBottom:20,
              }}
            >
              {loading ? (
                <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/> Analyzing…</>
              ) : "ANALYZE VESSEL"}
            </button>

            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:4 }}>
                All analyses use established ISO 19030 methodologies.
              </div>
              <span style={{ fontSize:12, color:C.accent, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3 }}>
                Need assistance?
              </span>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexWrap:"wrap", gap:8,
          padding:"14px 5vw",
          borderTop:`1px solid ${C.borderSubtle}`,
          fontSize:12, color:C.textMuted,
        }}>
          <div style={{ display:"flex", gap:20 }}>
            {["API Docs","ISO 19030 Standard","Platform Status"].map((l,i)=>(
              <span key={i} style={{ cursor:"pointer" }}>{l}</span>
            ))}
            <span>|</span>
          </div>
          <span>© 2024 Optiq Solutions</span>
        </div>
      </div>
    </div>
  );
}


function Dashboard({ imo, onBack, shipData }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const isMobile = useMediaQuery(768);

  const navItems = [
    { id:"dashboard",  label:"Dashboard",        icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id:"hull",       label:"Hull Analysis",    icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l4-8 4 4 4-6 4 10"/><path d="M3 20h18"/></svg> },
    { id:"weather",    label:"Weather Impact",   icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> },
    { id:"esd",        label:"ESD Simulator",    icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2"/></svg> },
    { id:"reports",    label:"Reports",          icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  ];

  const topStats = [
    { label:"POWER PENALTY:", value:"+12.5%", color:C.critical },
    { label:"ADDED FUEL/DAY:", value:"+2.1 MT", color:C.warning },
    { label:"CURRENT SFOC:", value:"168 g/kWh", color:C.textPrimary },
  ];

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:C.mainBg }}>

      {/* Sidebar */}
      {!isMobile && (
        <div style={{
          width:200, flexShrink:0,
          background:C.sidebarBg,
          borderRight:`1px solid ${C.borderSubtle}`,
          display:"flex", flexDirection:"column",
          padding:"20px 0",
        }}>
          {/* Logo */}
          <div style={{ padding:"0 20px 20px", borderBottom:`1px solid ${C.borderSubtle}` }}>
            <Logo small />
            <div style={{ fontSize:10, color:C.textMuted, marginTop:4 }}>IMO {imo}</div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:"16px 10px", display:"flex", flexDirection:"column", gap:4 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActiveTab(n.id)} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 12px", borderRadius:9,
                background: activeTab===n.id ? "rgba(56,189,248,0.1)" : "transparent",
                border: activeTab===n.id ? `1px solid rgba(56,189,248,0.25)` : "1px solid transparent",
                color: activeTab===n.id ? C.accent : C.textSecondary,
                fontSize:13, fontWeight: activeTab===n.id ? 600 : 400,
                cursor:"pointer", textAlign:"left", width:"100%",
                transition:"all .15s",
              }}>
                {n.icon}{n.label}
              </button>
            ))}
          </nav>

          {/* Back button */}
          <div style={{ padding:"12px 10px", borderTop:`1px solid ${C.borderSubtle}` }}>
            <button onClick={onBack} style={{
              width:"100%", padding:"9px 12px", borderRadius:8,
              background:"rgba(255,255,255,0.04)",
              border:`1px solid ${C.borderSubtle}`,
              color:C.textMuted, fontSize:12, cursor:"pointer",
              display:"flex", alignItems:"center", gap:8,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              New Analysis
            </button>
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Mobile tab bar */}
        {isMobile && (
          <div style={{
            display:"flex", overflowX:"auto", gap:4,
            padding:"10px 12px",
            background:C.sidebarBg,
            borderBottom:`1px solid ${C.borderSubtle}`,
            scrollbarWidth:"none",
          }}>
            {navItems.map(n => (
              <button key={n.id} onClick={()=>setActiveTab(n.id)} style={{
                flexShrink:0, padding:"7px 14px", borderRadius:20,
                border:`1px solid ${activeTab===n.id ? C.borderActive : C.border}`,
                background: activeTab===n.id ? C.accentDim : "transparent",
                color: activeTab===n.id ? C.accent : C.textMuted,
                fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
              }}>{n.label}</button>
            ))}
          </div>
        )}

        {/* Top stat bar */}
        <div style={{
          display:"flex", gap:0,
          borderBottom:`1px solid ${C.borderSubtle}`,
          flexShrink:0,
        }}>
          {topStats.map((s,i) => (
            <div key={i} style={{
              flex:1, padding:"14px 20px",
              borderRight: i < topStats.length-1 ? `1px solid ${C.borderSubtle}` : "none",
              background:C.statBg,
            }}>
              <div style={{ fontSize:10, color:C.textMuted, letterSpacing:"0.08em", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:s.color, fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
            </div>
          ))}
          {/* Fouling status */}
          <div style={{
            padding:"14px 20px",
            background:"rgba(239,68,68,0.1)",
            borderLeft:`1px solid rgba(239,68,68,0.2)`,
            minWidth: isMobile ? "auto" : 160,
          }}>
            <div style={{ fontSize:10, color:"rgba(239,68,68,0.7)", letterSpacing:"0.08em", marginBottom:4 }}>FOULING STATUS:</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:C.critical, fontFamily:"'Syne',sans-serif" }}>CRITICAL</div>
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex:1, overflow:"auto", padding: isMobile ? "16px 12px" : "24px 28px" }}>

{activeTab === "dashboard" && <DashboardTab isMobile={isMobile} shipData={shipData} />}
          {activeTab === "hull"      && <HullTab      isMobile={isMobile} />}
          {activeTab === "weather"   && <WeatherTab   isMobile={isMobile} />}
          {activeTab === "esd"       && <ESDTab       isMobile={isMobile} />}
{activeTab === "reports" && <ReportsTab isMobile={isMobile} imo={imo} shipData={shipData} />}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, controls }) {
  return (
    <div style={{
      background:C.cardSolid,
      border:`1px solid ${C.borderCard}`,
      borderRadius:14, padding:"20px 20px 16px",
      animation:"fadeIn 0.4s both",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <span style={{ fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:"'Syne',sans-serif" }}>{title}</span>
        {controls}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={()=>onChange(!value)}>
      <div style={{
        width:36, height:20, borderRadius:10, position:"relative", transition:"background .2s",
        background: value ? C.accent : "rgba(255,255,255,0.12)",
      }}>
        <div style={{
          position:"absolute", top:3, left: value ? 18 : 3, width:14, height:14,
          borderRadius:"50%", background:"#fff", transition:"left .2s",
        }}/>
      </div>
      <span style={{ fontSize:11, color:C.textSecondary }}>{label}</span>
    </div>
  );
}

const Dot = ({color}) => <span style={{ width:10, height:2, background:color, display:"inline-block", borderRadius:2, marginRight:6 }}/>;


function DashboardTab({ isMobile, shipData }) {

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Performance chart from backend */}
      <div style={{
        background: C.cardSolid,
        border: `1px solid ${C.borderCard}`,
        borderRadius: 14, padding: "20px",
        animation: "fadeIn 0.4s both",
      }}>
        <div style={{
          display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:16,
        }}>
          <span style={{
            fontSize:14, fontWeight:600,
            color:C.textPrimary, fontFamily:"'Syne',sans-serif"
          }}>
            Speed vs Power — IMO {shipData?.imo}
          </span>

          {/* PDF download button */}
         {shipData?.pdf_url && (
  <a
    href={shipData.pdf_url || "#"}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      padding: "6px 14px",
      borderRadius: 7,
      border: `1px solid ${C.border}`,
      background: "transparent",
      color: C.textSecondary,
      fontSize: 12,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      textDecoration: "none",
    }}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    Download
  </a>
)}
        </div>

        {/* The actual chart image from backend */}
        {shipData?.plot_url ? (
          <img
            src={shipData.plot_url}
            alt="Speed vs Power Performance Chart"
            style={{
              width:"100%", borderRadius:10,
              border:`1px solid ${C.borderCard}`,
            }}
          />
        ) : (
          // Fallback if no image yet
          <div style={{
            height:300, display:"flex",
            alignItems:"center", justifyContent:"center",
            color:C.textMuted, fontSize:13,
            border:`1px dashed ${C.border}`, borderRadius:10,
          }}>
            No chart available
          </div>
        )}
      </div>


    </div>
  );
}


function HullTab({ isMobile }) {
  const [selected, setSelected] = useState(0);
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const mockImages = [
    { label:"Image 1", fouling:"Heavy growth", color:C.critical },
    { label:"Image 2", fouling:"Moderate",     color:C.warning },
    { label:"Image 3", fouling:"Moderate",     color:C.warning },
  ];

  const scorecard = [
    { label:"ISO 19030 RATING:", value:"3.8/5",   color:C.warning },
    { label:"FRICTIONAL ΔCf:",   value:"0.00045", color:C.critical },
    { label:"POWER PENALTY:",    value:"+8.7%",   color:C.critical },
    { label:"EST. FUEL COST/YEAR:", value:"$380k", color:C.critical },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Upload area */}
      <div
        onClick={() => fileRef.current.click()}
        style={{
          border:`2px dashed ${file ? "rgba(16,185,129,0.5)" : C.border}`,
          borderRadius:12, padding:"20px",
          display:"flex", alignItems:"center", gap:12,
          cursor:"pointer", background:C.statBg,
          transition:"all .2s",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={file ? C.success : C.accent} strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <div>
          <div style={{ fontSize:13, color: file ? C.success : C.textPrimary, fontWeight:500 }}>
            {file ? file.name : "Upload hull images for AI analysis"}
          </div>
          <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>PNG, JPG up to 20 MB each</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }}
          onChange={e => setFile(e.target.files[0])}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr", gap:16 }}>

        {/* Column 1 — Hull photos list */}
        <div style={{ background:C.cardSolid, border:`1px solid ${C.borderCard}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.borderSubtle}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:20, height:20, borderRadius:4, background:C.accentDim, border:`1px solid ${C.border}`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:10, color:C.accent, fontWeight:700 }}>1</div>
              <span style={{ fontSize:12, fontWeight:600, color:C.textPrimary, fontFamily:"'Syne',sans-serif", letterSpacing:"0.05em" }}>HULL PHOTOS</span>
            </div>
          </div>
          <div style={{ padding:"10px", display:"flex", flexDirection:"column", gap:8 }}>
            {mockImages.map((img, i) => (
              <div key={i} onClick={()=>setSelected(i)} style={{
                borderRadius:8, overflow:"hidden", cursor:"pointer",
                border:`2px solid ${selected===i ? C.accent : "transparent"}`,
                background:C.statBg, padding:"10px 12px",
                display:"flex", alignItems:"center", gap:8,
                transition:"all .2s",
              }}>
                <div style={{ width:36, height:36, borderRadius:6, background:"rgba(56,189,248,0.06)", border:`1px solid ${C.border}`, display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div>
                  <div style={{ fontSize:12, color:C.textPrimary, fontWeight:500 }}>{img.label}</div>
                  <div style={{ fontSize:10, color:img.color }}>{img.fouling}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 — AI Visualizer */}
        <div style={{ background:C.cardSolid, border:`1px solid ${C.borderCard}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.borderSubtle}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:20, height:20, borderRadius:4, background:C.accentDim, border:`1px solid ${C.border}`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:10, color:C.accent, fontWeight:700 }}>2</div>
              <span style={{ fontSize:12, fontWeight:600, color:C.textPrimary, fontFamily:"'Syne',sans-serif", letterSpacing:"0.05em" }}>AI VISUALIZER</span>
            </div>
          </div>
          <div style={{ padding:"14px" }}>
            <div style={{ fontSize:11, color:C.critical, fontFamily:"'JetBrains Mono',monospace", marginBottom:12 }}>
              DETECTION: <strong>HEAVY growth</strong>
            </div>
            {/* Fake heatmap visualizer */}
            <div style={{
              width:"100%", aspectRatio:"4/3", borderRadius:10,
              background:`radial-gradient(circle at 30% 40%, rgba(239,68,68,0.6) 0%, rgba(239,68,68,0.2) 30%, transparent 60%),
                          radial-gradient(circle at 65% 60%, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.15) 25%, transparent 55%),
                          radial-gradient(circle at 50% 25%, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0.1) 20%, transparent 45%),
                          linear-gradient(135deg, #0a1f30 0%, #081525 50%, #071220 100%)`,
              border:`1px solid ${C.borderCard}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              position:"relative", overflow:"hidden",
            }}>
              <div style={{
                position:"absolute", inset:0,
                backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(56,189,248,0.03) 30px, rgba(56,189,248,0.03) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(56,189,248,0.03) 30px, rgba(56,189,248,0.03) 31px)",
              }}/>
              <div style={{
                padding:"6px 14px", background:"rgba(239,68,68,0.15)",
                border:"1px solid rgba(239,68,68,0.3)", borderRadius:6,
                fontSize:11, color:C.critical, fontFamily:"'JetBrains Mono',monospace",
              }}>HEAVY FOULING DETECTED</div>
            </div>
            <div style={{ fontSize:11, color:C.critical, fontFamily:"'JetBrains Mono',monospace", marginTop:12 }}>
              DETECTION: <strong>HEAVY growth</strong>
            </div>
          </div>
        </div>

        {/* Column 3 — Penalty scorecard */}
        <div style={{ background:C.cardSolid, border:`1px solid ${C.borderCard}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.borderSubtle}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:20, height:20, borderRadius:4, background:C.accentDim, border:`1px solid ${C.border}`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:10, color:C.accent, fontWeight:700 }}>3</div>
              <span style={{ fontSize:12, fontWeight:600, color:C.textPrimary, fontFamily:"'Syne',sans-serif", letterSpacing:"0.05em" }}>PENALTY SCORECARD</span>
            </div>
          </div>
          <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:12 }}>
            {scorecard.map((s,i) => (
              <div key={i} style={{ padding:"12px 14px", background:C.statBg, border:`1px solid ${C.borderCard}`, borderRadius:8 }}>
                <div style={{ fontSize:9, color:C.textMuted, letterSpacing:"0.08em", marginBottom:5 }}>{s.label}</div>
                <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function WeatherTab({ isMobile, onEnter }) {
  const [condition, setCondition] = useState("moderate");
  const [route, setRoute] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const weatherData = speedPowerData.map(d => ({
    ...d,
    withWeather: Math.round(d.actual * 1.18),
  }));

//  const handleAnalyze = async (e) => {
//   e?.preventDefault();

//   console.log(" BUTTON CLICKED");

//   if (!imo || !imo.trim()) {
//     setErr("IMO number is required");
//     return;
//   }

//   if (!/^\d{7}$/.test(imo.trim())) {
//     setErr("IMO must be exactly 7 digits");
//     return;
//   }

//   setErr("");
//   setLoading(true);

//   try {
//     console.log(" CALLING API...");

//     const formdata = new FormData();
//     formdata.append("text_input", imo.trim());

//     const response = await fetch(
//       "http://65.1.246.191:8000/Vessel_Performance_Project/run",
//       {
//         method: "POST",
//         body: formdata,
//       }
//     );

//     console.log(" RESPONSE RECEIVED");

//     const result = await response.json();
//     console.log(" RESULT:", result);

//     if (result.status === "success") {
//       setLoading(false);
//       onEnter(imo.trim(), result); 
//     } else {
//       setLoading(false);
//       setErr("Analysis failed");
//     }

//   } catch (error) {
//     console.error(" FETCH ERROR:", error);
//     setLoading(false);
//     setErr("Server error");
//   }
// };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* Input card */}
      <div style={{ background:C.cardSolid, border:`1px solid ${C.borderCard}`, borderRadius:12, padding:"18px" }}>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr auto", gap:12, alignItems:"end" }}>
          <div>
            <label style={{ display:"block", fontSize:11, color:C.textMuted, marginBottom:6, letterSpacing:"0.06em", textTransform:"uppercase" }}>Weather Condition</label>
            <select value={condition} onChange={e=>setCondition(e.target.value)}
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${C.border}`, background:C.inputBg, color:C.textPrimary, fontSize:13, cursor:"pointer" }}>
              <option value="calm">Calm</option>
              <option value="light">Light breeze</option>
              <option value="moderate">Moderate</option>
              <option value="strong">Strong wind</option>
              <option value="storm">Storm</option>
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontSize:11, color:C.textMuted, marginBottom:6, letterSpacing:"0.06em", textTransform:"uppercase" }}>Route / Region</label>
            <input value={route} onChange={e=>setRoute(e.target.value)} placeholder="e.g. North Atlantic"
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1px solid ${C.border}`, background:C.inputBg, color:C.textPrimary, fontSize:13 }}/>
          </div>
          <button >
            Analyze Impact
          </button>
        </div>
      </div>

      {/* Weather chart */}
      <ChartCard title="Weather Impact on Power Requirement"
        controls={
          <div style={{ display:"flex", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}><Dot color={C.accent}/><span style={{ fontSize:11,color:C.textSecondary }}>Calm water</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}><Dot color={C.warning}/><span style={{ fontSize:11,color:C.textSecondary }}>With weather</span></div>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
          <LineChart data={weatherData} margin={{top:10,right:10,bottom:20,left:0}}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 3"/>
            <XAxis dataKey="speed" tick={{fontSize:10,fill:C.textMuted}} label={{value:"Speed (Knots)",position:"insideBottom",offset:-8,fontSize:11,fill:C.textMuted}}/>
            <YAxis tick={{fontSize:10,fill:C.textMuted}} width={40}/>
            <Tooltip contentStyle={{background:C.cardSolid,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} labelFormatter={v=>`${v} kn`}/>
            <Line type="monotone" dataKey="actual" stroke={C.accent} strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="withWeather" stroke={C.warning} strokeWidth={2} dot={false} strokeDasharray="6 3"/>
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Weather stats */}
      {analyzed && (
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:12, animation:"slideUp 0.4s both" }}>
          {[
            { label:"Speed Loss", value:"−1.4 kn", color:C.warning },
            { label:"Added Resistance", value:"+18%", color:C.critical },
            { label:"Extra Fuel/Day", value:"+0.8 MT", color:C.warning },
            { label:"Route Penalty", value:"+$4.2k", color:C.critical },
          ].map((s,i) => (
            <div key={i} style={{ background:C.statBg, border:`1px solid ${C.borderCard}`, borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontSize:10, color:C.textMuted, marginBottom:6 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function ESDTab({ isMobile }) {
  const [selected, setSelected] = useState(["coating"]);
  const [showClean, setShowClean] = useState(true);
  const [showWeather, setShowWeather] = useState(false);

  const devices = [
    { id:"duct",    label:"Mewis Duct" },
    { id:"pbcf",    label:"PBCF Fins" },
    { id:"coating", label:"Hi-Perf. Coating" },
    { id:"rudder",  label:"Rudder Bulb" },
  ];

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]
  );

  const esdData = speedPowerData.map(d => ({
    ...d,
    simulated: Math.round(d.actual * 0.88),
  }));

  const roi = { investment:"$200k", payback:"14 Months", annual:"$170k" };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap:16, alignItems:"start" }}>

        {/* Chart */}
        <ChartCard title="Line Chart"
          controls={
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}><Dot color={C.accent}/><span style={{ fontSize:11,color:C.textSecondary }}>DESIGN CURVE</span></div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}><Dot color={C.critical}/><span style={{ fontSize:11,color:C.textSecondary }}>CURRENT ACTUAL</span></div>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
            <AreaChart data={esdData} margin={{top:10,right:10,bottom:20,left:0}}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.25)"/>
                  <stop offset="100%" stopColor="rgba(16,185,129,0)"/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 3"/>
              <XAxis dataKey="speed" tick={{fontSize:10,fill:C.textMuted}} label={{value:"Speed (Knots)",position:"insideBottom",offset:-8,fontSize:11,fill:C.textMuted}}/>
              <YAxis tick={{fontSize:10,fill:C.textMuted}} width={40} label={{value:"Power (kW)",angle:-90,position:"insideLeft",fontSize:11,fill:C.textMuted,offset:10}}/>
              <Tooltip contentStyle={{background:C.cardSolid,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} labelFormatter={v=>`${v} kn`}/>
              <Area type="monotone" dataKey="design" stroke={C.accent} strokeWidth={2} fill="rgba(56,189,248,0.06)" dot={false}/>
              <Area type="monotone" dataKey="actual" stroke={C.critical} strokeWidth={2} fill="transparent" dot={false}/>
              {selected.length > 0 && (
                <Area type="monotone" dataKey="simulated" stroke={C.success} strokeWidth={2}
                  strokeDasharray="6 3" fill="url(#savingsGrad)" dot={false}/>
              )}
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
            <span style={{ fontSize:10, color:C.accent, fontFamily:"'JetBrains Mono',monospace" }}>DESIGN CURVE</span>
            <span style={{ fontSize:10, color:C.critical, fontFamily:"'JetBrains Mono',monospace", marginLeft:16 }}>CURRENT ACTUAL</span>
            {selected.length > 0 && <span style={{ fontSize:10, color:C.success, fontFamily:"'JetBrains Mono',monospace", marginLeft:16 }}>ESD SIMULATED CURVE</span>}
            {selected.length > 0 && <span style={{ fontSize:10, color:"rgba(16,185,129,0.5)", fontFamily:"'JetBrains Mono',monospace", marginLeft:16 }}>POTENTIAL SAVINGS GAP</span>}
          </div>

          <div style={{ display:"flex", gap:24, marginTop:14, paddingTop:12, borderTop:`1px solid ${C.borderSubtle}`, flexWrap:"wrap" }}>
            <Toggle label="Show Clean Hull Prediction" value={showClean} onChange={setShowClean}/>
            <Toggle label="Show 2MT Weather Impact" value={showWeather} onChange={setShowWeather}/>
          </div>
        </ChartCard>

        {/* Right panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, minWidth: isMobile ? "auto" : 200 }}>

          {/* ESD selection */}
          <div style={{ background:C.cardSolid, border:`1px solid ${C.borderCard}`, borderRadius:12, padding:"16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.textSecondary, letterSpacing:"0.1em", marginBottom:12 }}>ESD SELECTION MENU</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {devices.map(d => (
                <div key={d.id} onClick={()=>toggle(d.id)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                  <div style={{
                    width:16, height:16, borderRadius:4, flexShrink:0,
                    border:`1.5px solid ${selected.includes(d.id) ? C.accent : C.textMuted}`,
                    background: selected.includes(d.id) ? C.accentDim : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    transition:"all .15s",
                  }}>
                    {selected.includes(d.id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <span style={{ fontSize:13, color: selected.includes(d.id) ? C.accent : C.textSecondary }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ROI */}
          <div style={{ background:C.cardSolid, border:`1px solid ${C.borderCard}`, borderRadius:12, padding:"16px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.textSecondary, letterSpacing:"0.1em", marginBottom:10 }}>SIMULATED SAVINGS ROI:</div>
            {[
              { label:"Investment:", value: roi.investment },
              { label:"Payback:", value: roi.payback },
              { label:"Annual $ Saving:", value: roi.annual },
            ].map((r,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:C.textMuted }}>{r.label}</span>
                <span style={{ fontSize:12, color:C.accent, fontWeight:600 }}>{r.value}</span>
              </div>
            ))}
            <button style={{
              width:"100%", marginTop:8, padding:"10px",
              background:"rgba(56,189,248,0.1)", border:`1px solid ${C.accent}`,
              color:C.accent, borderRadius:8, fontSize:12, fontWeight:700,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            }}>Generate Comparison Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}


function ReportsTab({ isMobile, imo, shipData }) {
  const reports = [
   { title:`IMO ${imo} — Full Performance Report`, date:"Today", type:"PDF", 
  status:"ready", url: shipData?.pdf_url },
    { title:`Hull Fouling Analysis`, date:"Today", type:"PDF", status:"ready" },
    { title:`ESD Comparison Report`, date:"Today", type:"XLSX", status:"generating" },
    { title:`Weather Impact Summary`, date:"Today", type:"PDF", status:"ready" },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:14, color:C.textSecondary, marginBottom:4 }}>
        Generated reports for IMO {imo}
      </div>
      {reports.map((r,i) => (
        <div key={i} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:12, padding:"16px 18px",
          background:C.cardSolid, border:`1px solid ${C.borderCard}`,
          borderRadius:10, animation:`slideUp 0.3s ${i*0.08}s both`,
          flexWrap:"wrap",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:C.accentDim, border:`1px solid ${C.border}`, display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div>
              <div style={{ fontSize:13, color:C.textPrimary, fontWeight:500 }}>{r.title}</div>
              <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{r.date} · {r.type}</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{
              fontSize:10, padding:"3px 10px", borderRadius:20,
              background: r.status==="ready" ? C.successBg : "rgba(245,158,11,0.1)",
              color: r.status==="ready" ? C.success : C.warning,
              border:`1px solid ${r.status==="ready" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              fontWeight:600, letterSpacing:"0.05em",
              animation: r.status==="generating" ? "pulse 1.5s infinite" : "none",
            }}>{r.status === "ready" ? "Ready" : "Generating…"}</span>
            {r.status === "ready" && (
              <button style={{
                padding:"6px 14px", borderRadius:7, border:`1px solid ${C.border}`,
                background:"transparent", color:C.textSecondary, fontSize:12, cursor:"pointer",
                display:"flex", alignItems:"center", gap:6,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


export default function App() {
  const [page,     setPage]     = useState("landing");
  const [imo,      setImo]      = useState("");
  const [shipData, setShipData] = useState(null);

  return (
    <>
      <GlobalStyles />
      {page === "landing"
        ? (
          <LandingPage onEnter={(id, data) => {
            setImo(id);
            setShipData(data);
            setPage("dashboard");
          }} />
        ) : (
          <Dashboard
            imo={imo}
            shipData={shipData}
            onBack={() => setPage("landing")}
          />
        )
      }
    </>
  );
}
