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
    @font-face {
      font-family: 'Aeonik';
      src: url('/fonts/Aeonik-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Aeonik';
      src: url('/fonts/Aeonik-Medium.woff2') format('woff2');
      font-weight: 500;
      font-style: normal;
      font-display: swap;
    }
    @font-face {
      font-family: 'Aeonik';
      src: url('/fonts/Aeonik-Bold.woff2') format('woff2');
      font-weight: 700;
      font-style: normal;
      font-display: swap;
    }

    @import url('https://fonts.googleapis.com/css2?family=Syne...');
    *, *::before, *::after { box-sizing: border-box; }
    html, body, #root { margin:0; padding:0; min-height:100%; }
    body { font-family: 'Aeonik', 'DM Sans', sans-serif; }
    ...rest of your styles...
  `}</style>
);


function LoginPage({ onLogin }) {

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

 const handleLogin = async () => {

  if (!username || !password) {
    setErr("Please enter credentials");
    return;
  }

  setErr("");
  setLoading(true);

  try {

   const myHeaders = new Headers();

myHeaders.append(
  "Content-Type",
  "application/x-www-form-urlencoded"
);

const urlencoded = new URLSearchParams();

urlencoded.append("username", username);
urlencoded.append("password", password);

const response = await fetch(
  "https://api.azolla.sg/login",
  {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
  }
);

const result = await response.text();
   console.log("LOGIN RESPONSE:", result);

if (response.ok) {

  localStorage.setItem(
    "token",
    result
  );

  onLogin();

} else {

  setErr("Invalid username or password");

}

  } catch(err) {

    console.error(err);
    setErr("Server error");

  }

  setLoading(false);
};

  return (

    <div style={{
      minHeight:"100vh",
      backgroundImage:"url('/Background.png')",
      backgroundSize:"cover",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      padding:"20px",
    }}>

      <div style={{
        width:"100%",
        maxWidth:420,
        background:"rgba(10,25,50,0.75)",
        border:`1px solid ${C.border}`,
        borderRadius:18,
        padding:"32px",
        backdropFilter:"blur(18px)",
      }}>

        <div style={{
          display:"flex",
          justifyContent:"center",
          marginBottom:20,
        }}>
          <Logo />
        </div>

        <h2 style={{
          color:C.textPrimary,
          fontSize:24,
          marginBottom:8,
          textAlign:"center",
        }}>
          OPTIQ Login
        </h2>

        <p style={{
          color:C.textMuted,
          fontSize:13,
          textAlign:"center",
          marginBottom:28,
        }}>
          Access vessel performance platform
        </p>

        <input
          type="text"
          onKeyDown={(e) => {
  if (e.key === "Enter") {
    handleLogin();
  }
}}
          placeholder="Username"
          value={username}
          onChange={(e)=>setUserName(e.target.value)}
          style={{
            width:"100%",
            padding:"14px",
            marginBottom:14,
            borderRadius:10,
            border:`1px solid ${C.border}`,
            background:C.inputBg,
            color:C.textPrimary,
          }}
        />

        <input
          type="password"
          onKeyDown={(e) => {
  if (e.key === "Enter") {
    handleLogin();
  }
}}
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{
            width:"100%",
            padding:"14px",
            marginBottom:14,
            borderRadius:10,
            border:`1px solid ${C.border}`,
            background:C.inputBg,
            color:C.textPrimary,
          }}
        />

        {err && (
          <div style={{
            color:"#f87171",
            fontSize:12,
            marginBottom:12,
          }}>
            {err}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:"100%",
            padding:"14px",
            borderRadius:10,
            border:"none",
            background:C.accentBtn,
            color:"#fff",
            fontWeight:700,
            cursor:"pointer",
          }}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

      </div>

    </div>

  );
}

function LandingPage({ onEnter }) {
  const [imo, setImo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery(768);

  const modules = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><path d="M3 17l4-8 4 4 4-6 4 10"/><path d="M3 20h18"/></svg>,
      title: "Hull Analysis",
      desc: "AI powered hull fouling analysis and its impact on the Resistance and Power consumption based on the images uploaded.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
      title: "ESD Simulator",
      desc: "ESD module which quantifies the power saving and the overall impact of different ESDs on the performance curve.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>,
      title: "Weather Intelligence",
      desc: "Correlate performance against weather and ocean conditions.",
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
      "https://api.azolla.sg/Vessel_Performance_Project/run",
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
                <div style={{ fontSize:24, color:C.textPrimary, fontWeight:500, fontFamily:"'Aeonik',sans-serif", letterSpacing:3 }}>OPTI<span style={{ fontSize:27, fontFamily:"'Aeonik',sans-serif"}}>Q</span></div>
                <div style={{ fontSize:11, color:C.textMuted }}>Vessel Performance Platform</div>
              </div>
            )}
          </div>
          {!isMobile && (
            <nav style={{ display:"flex", gap:0, alignItems:"center" }}>
              {["API Docs","Platform Status"].map((l,i) => (
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
                  <div style={{ fontSize:15, fontWeight:700, color:C.textPrimary, fontFamily:"'Aeonik',sans-serif", marginBottom:5 }}>
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
              <span style={{ fontSize:17, fontWeight:700, color:C.textPrimary, fontFamily:"'Aeonik',sans-serif" }}>
                Access Detailed Performance Analysis
              </span>
            </div>
            <div style={{ height:1, background:C.borderSubtle, margin:"16px 0 22px" }} />

            <div style={{ fontSize:13, color:C.textSecondary, marginBottom:8 }}>Enter IMO Number</div>
            <input
              type="text" maxLength={7}
              onKeyDown={(e) => {
  if (e.key === "Enter") {
    handleAnalyze();
  }
}}
              placeholder="e.g 9483451"
              value={imo}
              onChange={e => { setImo(e.target.value); setErr(""); }}
              style={{
                width:"100%", padding:"14px 16px", borderRadius:10,
                border:`1px solid ${err ? "#f87171" : C.border}`,
                background:C.inputBg, color:C.textPrimary, fontSize:15,
                fontFamily:"'Aeonik',sans-serif",
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
             
              < a onClick={() => {
  const subject = encodeURIComponent("OPTIQ Support Request");
  const body = encodeURIComponent(
    "Hello OPTIQ Support,\n\nI need assistance with:\n\nDescription:\n\nRegards,"
  );

  window.location.href = `mailto:support@azolla.sg?subject=${subject}&body=${body}`;
}}
  style={{
    fontSize:12, color:C.accent,
    textDecoration:"underline", textUnderlineOffset:3,
    cursor:"pointer",
  }}
>
  Need assistance?
</a>
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
           {["API Docs"].map((l, i) => (
  <span key={i} style={{ cursor:"pointer" }}>{l}</span>
))}
<a 
  href="https://www.azolla.sg"
  target="_blank"
  rel="noopener noreferrer"
  style={{
    cursor:"pointer",
    color: C.textMuted,
    textDecoration:"none",
    transition:"color .2s",
  }}
  onMouseEnter={e => e.currentTarget.style.color = C.accent}
  onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
>
 AZOLLA
</a>
            <span>|</span>
          </div>
          <span>© 2026 Azolla, All Rights Reserved </span>
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
   

        {/* Tab content */}
        <div style={{ flex:1, overflow:"auto", padding: isMobile ? "16px 12px" : "24px 28px" }}>

{activeTab === "dashboard" && <DashboardTab isMobile={isMobile} shipData={shipData} />}
{activeTab === "hull" && (
  <HullTab
    isMobile={isMobile}
    imo={imo}
  />
)}          {activeTab === "weather"   && <WeatherTab   isMobile={isMobile} />}
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
        <span style={{ fontSize:14, fontWeight:600, color:C.textPrimary, fontFamily:"'Aeonik',sans-serif" }}>{title}</span>
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
            color:C.textPrimary, fontFamily:"'Aeonik',sans-serif"
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


function HullTab({ isMobile, imo }) {
  const [selected, setSelected] = useState(0);
const [uploadedImages, setUploadedImages] = useState({

  vertical_sides: [],

  propeller: [],

  rudder: [],

  flat_bottom: [],

  bilge_keels: [],

  sea_chest: [],

});
const [sectionResults, setSectionResults] = useState({});
const [selectedType, setSelectedType] = useState("vertical_sides");
const [selectedImageIndex, setSelectedImageIndex] = useState(0);  

const SCORECARD_DATA = {

  vertical_sides: [
    {
      label:"FOULING GRADE:",
      value:"3",
      color:C.warning,
    },
    {
      label:"FOULING AGENTS DETECTED:",
      value:"Slime",
      color:C.warning,
    },
    {
      label:"IMPACT ON POWER CONSUMPTION:",
      value:"10%",
      color:C.warning,
    },
  ],

  propeller: [
    {
      label:"FOULING GRADE:",
      value:"5",
      color:C.critical,
    },
    {
      label:"FOULING AGENTS DETECTED:",
      value:"Barnacles, Calcareous",
      color:C.critical,
    },
    {
      label:"IMPACT ON POWER CONSUMPTION:",
      value:"25%",
      color:C.critical,
    },
  ],

  rudder: [
    {
      label:"FOULING GRADE:",
      value:"2",
      color:C.warning,
    },
    {
      label:"FOULING AGENTS DETECTED:",
      value:"Slime",
      color:C.warning,
    },
    {
      label:"IMPACT ON POWER CONSUMPTION:",
      value:"7%",
      color:C.success,
    },
  ],

  flat_bottom: [
    {
      label:"FOULING GRADE:",
      value:"6",
      color:C.critical,
    },
    {
      label:"FOULING AGENTS DETECTED:",
      value:"Barnacles, Tubeworm",
      color:C.warning,
    },
    {
      label:"IMPACT ON POWER CONSUMPTION:",
      value:"35%",
      color:C.warning,
    },
  ],

  bilge_keels: [
    {
      label:"FOULING GRADE:",
      value:"4",
      color:C.warning,
    },
    {
      label:"FOULING AGENTS DETECTED:",
      value:"Slime, Barnacles, Algae",
      color:C.critical,
    },
    {
      label:"IMPACT ON POWER CONSUMPTION:",
      value:"20%",
      color:C.critical,
    },
  ],

  sea_chest: [
    {
      label:"FOULING GRADE:",
      value:"4",
      color:C.warning,
    },
    {
      label:"FOULING AGENTS DETECTED:",
      value:"Barnacle, Slime",
      color:C.warning,
    },
    {
      label:"IMPACT ON POWER CONSUMPTION:",
      value:"18%",
      color:C.warning,
    },
  ],

};

const handleUpload = async (section, file) => {
  if (!file) return;

  const localPreview = URL.createObjectURL(file);
  const uploadId = `${Date.now()}-${Math.random()}`;

  setUploadedImages(prev => ({
    ...prev,
    [section.id]: [
      ...(prev[section.id] || []),
      {
        uploadId,
        imageUrl: localPreview,
        annotatedImage: null,
        uploading: true,
      },
    ],
  }));

  setSelectedType(section.id);
  setSelectedImageIndex(
    -1 
  );

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("imo", imo);
    formData.append("section", section.id);
    formData.append("filename", section.s3Key);

    const response = await fetch(
      "https://api.azolla.sg/upload-hull-image",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.status === "success") {
      setSectionResults(prev => ({
        ...prev,
        [section.id]: {
          fouling_grade:    result.fouling_grade,
          fouling_type:     result.fouling_type,
          fouling_percentage: result.fouling_percentage,
        }
      }));
      setUploadedImages(prev => {
        const list = prev[section.id] || [];
        const updatedList = list.map(item =>
          item.uploadId === uploadId
            ? {
                uploadId,
                imageUrl: result.original_image || localPreview,
                annotatedImage: result.annotated_image,
                s3Url: result.s3_url || result.original_image,
                foulingType: result.fouling_type,
                foulingPercentage: result.fouling_percentage,
                uploading: false,
              }
            : item
        );
        return { ...prev, [section.id]: updatedList };
      });
      // Jump to the newly processed image
      setSelectedImageIndex(prev => {
        return -1;
      });
    } else {
      setUploadedImages(prev => ({
        ...prev,
        [section.id]: (prev[section.id] || []).filter(
          item => item.uploadId !== uploadId
        ),
      }));
      console.error("Upload failed:", result);
    }
  } catch (err) {
    setUploadedImages(prev => ({
      ...prev,
      [section.id]: (prev[section.id] || []).filter(
        item => item.uploadId !== uploadId
      ),
    }));
    console.error("Upload error:", err);
  }
};

  const HULL_SECTIONS = [
  { id: "vertical_sides",  label: "Vertical Sides", s3Key: "Vertical_Side_img1",  required: true  },
  { id: "propeller",      label: "Propeller",      s3Key: "Propeller_img1",      required: true  },
  { id: "bilge_keels",    label: "Bilge Keels",    s3Key: "Bilge_Keels_img1",    required: false },
  { id: "rudder",         label: "Rudder",         s3Key: "Rudder_img1",         required: true  },
  { id: "sea_chest",      label: "Sea Chest",      s3Key: "Sea_Chest_img1",      required: false },
  { id: "flat_bottom",    label: "Flat Bottom",    s3Key: "Flat_Bottom_img1",    required: true  },
];

 const liveResult = sectionResults[selectedType];
  const scorecard = liveResult ? [
    {
      label: "FOULING GRADE:",
      value: String(liveResult.fouling_grade),
      color: liveResult.fouling_grade <= 2 ? C.success
           : liveResult.fouling_grade <= 4 ? C.warning
           : C.critical,
    },
    {
      label: "FOULING AGENTS DETECTED:",
      value: liveResult.fouling_type || "None",
      color: C.warning,
    },
    {
      label: "IMPACT ON POWER CONSUMPTION:",
      value: liveResult.fouling_percentage,
      color: C.warning,
    },
  ] : (SCORECARD_DATA[selectedType] || []);


const validateRequiredImages = () => {
  const requiredSections = HULL_SECTIONS.filter(s => s.required);

  const missing = requiredSections.filter(
    s => !uploadedImages[s.id]
  );

  if (missing.length > 0) {
    alert(
      `Please upload: ${missing.map(m => m.label).join(", ")}`
    );
    return false;
  }

  return true;
};

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {/* Upload area */}
    <div
  style={{
    display:"flex",
    gap:12,
    alignItems:"center",
    background:C.cardSolid,
    border:`1px solid ${C.borderCard}`,
    borderRadius:12,
    padding:"14px",
    flexWrap:"wrap",
  }}
>

  <select
    value={selectedType}
    onChange={(e)=>setSelectedType(e.target.value)}
    style={{
      padding:"10px 12px",
      borderRadius:8,
      background:C.inputBg,
      border:`1px solid ${C.border}`,
      color:C.textPrimary,
      minWidth:180,
    }}
  >
    {HULL_SECTIONS.map(section => (
      <option key={section.id} value={section.id}>
        {section.label}
      </option>
    ))}
  </select>

  <label
    style={{
      padding:"10px 18px",
      borderRadius:8,
      background:C.accentBtn,
      color:"#fff",
      cursor:"pointer",
      fontSize:13,
      fontWeight:600,
    }}
  >
    Upload Images

    <input
      type="file"
      multiple
      accept="image/*"
      hidden
      onChange={(e)=>{
        const files = Array.from(e.target.files);

        files.forEach(file => {
          const section = HULL_SECTIONS.find(
            s => s.id === selectedType
          );

          handleUpload(section, file);
        });
      }}
    />
  </label>

</div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr", gap:16 }}>

        {/* Column 1 — Hull photos list */}
        <div style={{ background:C.cardSolid, border:`1px solid ${C.borderCard}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.borderSubtle}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:20, height:20, borderRadius:4, background:C.accentDim, border:`1px solid ${C.border}`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:10, color:C.accent, fontWeight:700 }}>1</div>
              <span style={{ fontSize:12, fontWeight:600, color:C.textPrimary, fontFamily:"'Aeonik',sans-serif", letterSpacing:"0.05em" }}>HULL PHOTOS</span>
            </div>
          </div>
         
<div style={{ padding:"12px", display:"flex", flexDirection:"column", gap:10 }}>
  {HULL_SECTIONS.map((img, i) => (
    <div
      key={img.id}
onClick={() => {
  setSelected(i);
  setSelectedType(img.id);
  setSelectedImageIndex(0);
}}      style={{
        padding:"10px",
        borderRadius:8,
        cursor:"pointer",
        border:
          selected === i
            ? `1px solid ${C.accent}`
            : `1px solid ${C.borderSubtle}`,
        background:
          selected === i
            ? C.accentDim
            : "transparent",
      }}
    >
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
      }}>
        <div>
          <div style={{
            fontSize:12,
            color:C.textPrimary,
            fontWeight:600,
          }}>
            {img.label}
          </div>

          <div
            style={{
              fontSize:10,
              color: uploadedImages[img.id]
                ? C.success
                : C.textMuted
            }}
          >
            {uploadedImages[img.id]
              ? "Uploaded"
              : "Pending Upload"}
          </div>
        </div>

{(() => {
  const imgs = uploadedImages[img.id] || [];
  const first = imgs[0];
  if (!first) return null;
  const src = first.annotatedImage || first.imageUrl;
  return (
    <div style={{ position:"relative", flexShrink:0 }}>
      <img
        src={src}
        alt={img.label}
        style={{
          width:40, height:40,
          borderRadius:6, objectFit:"cover",
          border:`1px solid ${C.border}`,
          opacity: first.uploading ? 0.5 : 1,
        }}
      />
      {first.uploading && (
        <div style={{
          position:"absolute", inset:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          borderRadius:6,
        }}>
          <div style={{
            width:16, height:16,
            border:`2px solid rgba(56,189,248,0.3)`,
            borderTop:`2px solid ${C.accent}`,
            borderRadius:"50%",
            animation:"spin 0.8s linear infinite",
          }}/>
        </div>
      )}
    </div>
  );
})()}
      </div>
    </div>
  ))}
</div>

        </div>

        {/* Column 2 — AI Visualizer */}
       <div style={{ padding:"14px" }}>

  {(() => {
    const sectionImages = uploadedImages[selectedType] || [];
    // Use the last image in the list for the live view (most recently uploaded)
    const displayIndex = selectedImageIndex === -1 || selectedImageIndex >= sectionImages.length
      ? sectionImages.length - 1
      : selectedImageIndex;
    const current = sectionImages[displayIndex];

    if (!current) {
      return (
        <div style={{
          height:"320px",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          border:`1px dashed ${C.border}`,
          borderRadius:10,
          color:C.textMuted,
          fontSize:13,
        }}>
          Upload image for AI analysis
        </div>
      );
    }

    if (current.uploading) {
      return (
        <div style={{
          height:"320px",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"center",
          border:`1px dashed ${C.border}`,
          borderRadius:10,
          gap:16,
          position:"relative",
          overflow:"hidden",
        }}>
          {/* Blurred local preview as background */}
          {current.imageUrl && (
            <img
              src={current.imageUrl}
              alt="preview"
              style={{
                position:"absolute", inset:0,
                width:"100%", height:"100%",
                objectFit:"cover",
                filter:"blur(6px) brightness(0.4)",
                borderRadius:10,
              }}
            />
          )}
          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            {/* Spinner */}
            <div style={{
              width:40, height:40,
              border:`3px solid rgba(56,189,248,0.2)`,
              borderTop:`3px solid ${C.accent}`,
              borderRadius:"50%",
              animation:"spin 0.8s linear infinite",
            }}/>
            <span style={{ fontSize:13, color:C.accent, fontWeight:600 }}>Uploading to S3 &amp; running AI detection…</span>
            <span style={{ fontSize:11, color:C.textMuted }}>Fouling regions will be highlighted when complete</span>
          </div>
        </div>
      );
    }

    return (
      <div style={{ position:"relative" }}>
        <img
          src={current.annotatedImage || current.imageUrl}
          alt="AI Detection — fouling regions highlighted"
          style={{
            width:"100%",
            borderRadius:10,
            border:`1px solid ${C.borderCard}`,
            maxHeight:"420px",
            objectFit:"contain",
            display:"block",
          }}
        />
        {/* Badge shown when annotated image is from backend */}
        {current.annotatedImage && (
          <div style={{
            position:"absolute", top:10, left:10,
            background:"rgba(10,25,50,0.85)",
            border:`1px solid ${C.accent}`,
            borderRadius:6,
            padding:"4px 10px",
            display:"flex", alignItems:"center", gap:6,
          }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.success, flexShrink:0 }}/>
            <span style={{ fontSize:11, color:C.accent, fontWeight:600 }}>AI Detection Complete</span>
          </div>
        )}
        {/* Thumbnail strip if multiple images in this section */}
        {sectionImages.length > 1 && (
          <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
            {sectionImages.map((img, idx) => (
              <img
                key={idx}
                src={img.annotatedImage || img.imageUrl}
                alt={`img ${idx+1}`}
                onClick={() => setSelectedImageIndex(idx)}
                style={{
                  width:48, height:48,
                  objectFit:"cover",
                  borderRadius:6,
                  border:`2px solid ${displayIndex === idx ? C.accent : C.borderSubtle}`,
                  cursor:"pointer",
                  opacity: img.uploading ? 0.4 : 1,
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  })()}

</div>

        {/* Column 3 — Penalty scorecard */}
        <div style={{ background:C.cardSolid, border:`1px solid ${C.borderCard}`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.borderSubtle}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:20, height:20, borderRadius:4, background:C.accentDim, border:`1px solid ${C.border}`, display:"flex",alignItems:"center",justifyContent:"center", fontSize:10, color:C.accent, fontWeight:700 }}>3</div>
              <span style={{ fontSize:12, fontWeight:600, color:C.textPrimary, fontFamily:"'Aeonik',sans-serif", letterSpacing:"0.05em" }}>PENALTY SCORECARD</span>
            </div>
          </div>
          <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:12 }}>
            {scorecard.map((s,i) => (
              <div key={i} style={{ padding:"12px 14px", background:C.statBg, border:`1px solid ${C.borderCard}`, borderRadius:8 }}>
                <div style={{ fontSize:9, color:C.textMuted, letterSpacing:"0.08em", marginBottom:5 }}>{s.label}</div>
                <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:"'Aeonik',sans-serif" }}>{s.value}</div>
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
              <div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:"'Aeonik',sans-serif" }}>{s.value}</div>
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
            <span style={{ fontSize:10, color:C.accent, fontFamily:"'Aeonik',sans-serif" }}>DESIGN CURVE</span>
            <span style={{ fontSize:10, color:C.critical, fontFamily:"'Aeonik',sans-serif", marginLeft:16 }}>CURRENT ACTUAL</span>
            {selected.length > 0 && <span style={{ fontSize:10, color:C.success, fontFamily:"'Aeonik',sans-serif", marginLeft:16 }}>ESD SIMULATED CURVE</span>}
            {selected.length > 0 && <span style={{ fontSize:10, color:"rgba(16,185,129,0.5)", fontFamily:"'Aeonik',sans-serif", marginLeft:16 }}>POTENTIAL SAVINGS GAP</span>}
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
              cursor:"pointer", fontFamily:"'Aeonik',sans-serif",
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
  const [page,     setPage]     = useState("login");
  const [imo,      setImo]      = useState("");
  const [shipData, setShipData] = useState(null);

  return (
    <>
      <GlobalStyles />
 {page === "login" && (
  <LoginPage
    onLogin={() => setPage("landing")}
  />
)}

{page === "landing" && (
  <LandingPage
    onEnter={(id, data) => {
      setImo(id);
      setShipData(data);
      setPage("dashboard");
    }}
  />
)}

{page === "dashboard" && (
  <Dashboard
    imo={imo}
    shipData={shipData}
    onBack={() => setPage("landing")}
  />
)}
    </>
  );
}
