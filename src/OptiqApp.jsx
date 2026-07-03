import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area, AreaChart, ComposedChart,
} from "recharts";


const C = {
  pageBg: "rgba(5, 15, 35, 0.82)",
  sidebarBg: "#0d1929",
  mainBg: "#080f1e",
  cardBg: "rgba(10, 25, 50, 0.65)",
  cardSolid: "#0d1929",
  statBg: "#111c30",
  inputBg: "rgba(5, 15, 35, 0.6)",
  border: "rgba(56, 189, 248, 0.18)",
  borderActive: "rgba(56, 189, 248, 0.7)",
  borderSubtle: "rgba(255,255,255,0.07)",
  borderCard: "rgba(56,189,248,0.12)",
  textPrimary: "#e2e8f0",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  textDisabled: "#334155",
  accent: "#38bdf8",
  accentBtn: "#0ea5e9",
  accentDim: "rgba(56,189,248,0.08)",
  critical: "#ef4444",
  criticalBg: "rgba(239,68,68,0.12)",
  warning: "#f59e0b",
  success: "#10b981",
  successBg: "rgba(16,185,129,0.08)",
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
  const speeds = Array.from({ length: 51 }, (_, i) => i);
  return speeds.map(s => ({
    speed: s,
    design: Math.round(0.3 * Math.pow(s, 2.8)),
    actual: Math.round(0.22 * Math.pow(s, 2.75)),
    simulated: Math.round(0.16 * Math.pow(s, 2.7)),
  }));
}

const speedPowerData = makeSpeedPowerData();

const Logo = ({ small }) => (
  <img src="/OPTI.png"
    style={{ width: small ? 56 : 72, height: small ? 22 : 28, objectFit: "contain" }}
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
        "https://da.azolla.sg/login",
        {
          method: "POST",
          headers: myHeaders,
          body: urlencoded,
          redirect: "follow"
        }
      );

      const result = await response.text();


      if (response.ok) {

        localStorage.setItem(
          "token",
          result
        );

        onLogin();

      } else {

        setErr("Invalid username or password");

      }

    } catch (err) {

      console.error(err);
      setErr("Server error");

    }

    setLoading(false);
  };

  return (

    <div style={{
      minHeight: "100vh",
      backgroundImage: "url('/Background.png')",
      backgroundSize: "cover",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "rgba(10,25,50,0.75)",
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: "32px",
        backdropFilter: "blur(18px)",
      }}>

        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 20,
        }}>
          <Logo />
        </div>

        <h2 style={{
          color: C.textPrimary,
          fontSize: 24,
          marginBottom: 8,
          textAlign: "center",
        }}>
          OPTIQ Login
        </h2>

        <p style={{
          color: C.textMuted,
          fontSize: 13,
          textAlign: "center",
          marginBottom: 28,
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
          onChange={(e) => setUserName(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: 14,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.inputBg,
            color: C.textPrimary,
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
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            marginBottom: 14,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.inputBg,
            color: C.textPrimary,
          }}
        />

        {err && (
          <div style={{
            color: "#f87171",
            fontSize: 12,
            marginBottom: 12,
          }}>
            {err}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            border: "none",
            background: C.accentBtn,
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "LOGIN"}
        </button>

      </div>

    </div>

  );
}

function LandingPage({ onEnter, onLogout }) {
  const [imo, setImo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery(768);

  const modules = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><path d="M3 17l4-8 4 4 4-6 4 10" /><path d="M3 20h18" /></svg>,
      title: "Hull Analysis",
      desc: "AI powered hull fouling analysis and its impact on the Resistance and Power consumption based on the images uploaded.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
      title: "ESD Simulator",
      desc: "ESD module which quantifies the power saving and the overall impact of different ESDs on the performance curve.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.8"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>,
      title: "Weather Intelligence",
      desc: "Correlate performance against weather and ocean conditions.",
    },
  ];


  const handleAnalyze = async (e) => {
    e?.preventDefault();



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


      const formdata = new FormData();
      formdata.append("text_input", imo.trim());

      const response = await fetch(
        "https://da.azolla.sg/Vessel_Performance_Project/run",
        {
          method: "POST",
          body: formdata,
        }
      );

      console.log(" RESPONSE RECEIVED");

      const result = await response.json();


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
      minHeight: "100vh",
      backgroundImage: "url('/Background.png')",
      backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
      position: "relative",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,15,35,0.80)", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top navbar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: isMobile ? "14px 4vw" : "18px 5vw",
          borderBottom: `1px solid ${C.borderSubtle}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo />
            {!isMobile && (
              <div style={{ borderLeft: `1px solid ${C.borderSubtle}`, paddingLeft: 14 }}>
                <div style={{ fontSize: 24, color: C.textPrimary, fontWeight: 500, fontFamily: "'Aeonik',sans-serif", letterSpacing: 3 }}>OPTI<span style={{ fontSize: 27, fontFamily: "'Aeonik',sans-serif" }}>Q</span></div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Vessel Performance Platform</div>
              </div>
            )}
          </div>
          {!isMobile && (
            <nav style={{ display: "flex", gap: 0, alignItems: "center" }}>
              {["API Docs", "Platform Status"].map((l, i) => (
                <span key={i} style={{
                  fontSize: 13, color: C.textSecondary, cursor: "pointer",
                  padding: "0 20px",
                  borderLeft: `1px solid ${C.borderSubtle}`,
                  transition: "color .2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = C.accent}
                  onMouseLeave={e => e.currentTarget.style.color = C.textSecondary}
                >{l}</span>
              ))}
              <button onClick={onLogout} style={{
                fontSize: 13, color: "#f87171", cursor: "pointer",
                padding: "6px 20px", marginLeft: 8,
                borderLeft: `1px solid ${C.borderSubtle}`,
                background: "transparent", border: "none",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Logout
              </button>
            </nav>
          )}
        </div>

        {/* Main content */}
        <div style={{
          flex: 1, display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 24 : 40,
          alignItems: "center",
          padding: isMobile ? "32px 4vw" : "60px 7vw",
        }}>
          {/* Left — module cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {modules.map((m, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 16,
                padding: "18px 20px",
                background: "rgba(10,25,50,0.55)",
                border: `1px solid ${C.border}`,
                borderRadius: 14, backdropFilter: "blur(12px)",
                animation: `slideUp 0.5s ${i * 0.1}s both`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: "rgba(56,189,248,0.08)",
                  border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, fontFamily: "'Aeonik',sans-serif", marginBottom: 5 }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — form card */}
          <div className="Rightcard" style={{
            background: "rgba(10,25,50,0.70)",
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            backdropFilter: "blur(20px)",
            animation: "slideUp 0.6s 0.15s both",
          }}>
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2">
                <rect x="2" y="2" width="7" height="7" rx="1" />
                <rect x="15" y="2" width="7" height="7" rx="1" />
                <rect x="2" y="15" width="7" height="7" rx="1" />
                <path d="M15 15h7v7" />
              </svg>
              <span style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, fontFamily: "'Aeonik',sans-serif" }}>
                Access Detailed Performance Analysis
              </span>
            </div>
            <div style={{ height: 1, background: C.borderSubtle, margin: "16px 0 22px" }} />

            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 8 }}>Enter IMO Number</div>
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
                width: "100%", padding: "14px 16px", borderRadius: 10,
                border: `1px solid ${err ? "#f87171" : C.border}`,
                background: C.inputBg, color: C.textPrimary, fontSize: 15,
                fontFamily: "'Aeonik',sans-serif",
                backdropFilter: "blur(8px)", marginBottom: err ? 6 : 20,
              }}
            />
            {err && <p style={{ margin: "0 0 14px", fontSize: 12, color: "#f87171" }}>{err}</p>}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                width: "100%", padding: "15px",
                background: loading ? "rgba(14,165,233,0.4)" : C.accentBtn,
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all .25s", marginBottom: 20,
              }}
            >
              {loading ? (
                <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Analyzing…</>
              ) : "ANALYZE VESSEL"}
            </button>

            <div style={{ textAlign: "center" }}>

              < a onClick={() => {
                const subject = encodeURIComponent("OPTIQ Support Request");
                const body = encodeURIComponent(
                  "Hello OPTIQ Support,\n\nI need assistance with:\n\nDescription:\n\nRegards,"
                );

                window.location.href = `mailto:support@azolla.sg?subject=${subject}&body=${body}`;
              }}
                style={{
                  fontSize: 12, color: C.accent,
                  textDecoration: "underline", textUnderlineOffset: 3,
                  cursor: "pointer",
                }}
              >
                Need assistance?
              </a>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 8,
          padding: "14px 5vw",
          borderTop: `1px solid ${C.borderSubtle}`,
          fontSize: 12, color: C.textMuted,
        }}>
          <div style={{ display: "flex", gap: 20 }}>
            {["API Docs"].map((l, i) => (
              <span key={i} style={{ cursor: "pointer" }}>{l}</span>
            ))}
            <a
              href="https://www.azolla.sg"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                cursor: "pointer",
                color: C.textMuted,
                textDecoration: "none",
                transition: "color .2s",
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

// idle days -> fouling band. Returns whether the user must pick an intensity,
// the available intensity options (each carrying its backend grade), or a fixed
// auto-assigned grade. Boundary rule: each cutoff is inclusive of its upper value.
function getFoulingConfig(idleDaysRaw) {
  const d = parseInt(idleDaysRaw, 10);

  if (Number.isNaN(d) || d <= 0)
    return { valid: false, needsIntensity: false, options: [], grade: null, note: "Enter idle days first" };
  if (d > 365)
    return { valid: false, needsIntensity: false, options: [], grade: null, note: "Idle days must be ≤ 365" };

  if (d <= 40)
    return {
      valid: true, needsIntensity: true, grade: null,
      options: [{ label: "High", grade: 2 }, { label: "Low", grade: 1 }],
      note: "Select fouling intensity (High → grade 2, Low → grade 1)"
    };

  if (d <= 49)
    return { valid: true, needsIntensity: false, options: [], grade: 2, note: "Fouling grade auto-assigned: 2" };

  if (d <= 88)
    return { valid: true, needsIntensity: false, options: [], grade: 3, note: "Fouling grade auto-assigned: 3" };

  if (d <= 120)
    return {
      valid: true, needsIntensity: true, grade: null,
      options: [{ label: "High Calcareous", grade: 4 }, { label: "Low Calcareous", grade: 3 }],
      note: "Select fouling intensity (High Calcareous → grade 4, Low Calcareous → grade 3)"
    };

  if (d <= 166)
    return { valid: true, needsIntensity: false, options: [], grade: 5, note: "Fouling grade auto-assigned: 5" };

  return { valid: true, needsIntensity: false, options: [], grade: 6, note: "Fouling grade auto-assigned: 6" };
}

function Dashboard({ imo, onBack, shipData, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const isMobile = useMediaQuery(768);

  const [uploadedImages, setUploadedImages] = useState({
    vertical_sides: [],
    propeller: [],
    rudder: [],
    flat_bottom: [],
    bilge_keels: [],
    sea_chest: [],
  });
  const [sectionResults, setSectionResults] = useState({});

  const [fouledCurves, setFouledCurves] = useState(null);
  const [aggregatePenalty, setAggregatePenalty] = useState(null);
  const [foulingMode, setFoulingMode] = useState("image");

  const [customGrade, setCustomGrade] = useState("");
  const [customIdleDays, setCustomIdleDays] = useState("");

  const [customFouledCurves, setCustomFouledCurves] = useState(null);
  const [customPenalty, setCustomPenalty] = useState(null);

  const [customLoading, setCustomLoading] = useState(false);


  const [areaT, setAreaT] = useState("");
  const [seaState, setSeaState] = useState("0");
  const [marineData, setMarineData] = useState(null);
  const [addedResistanceData, setAddedResistanceData] = useState(null);
  const [course, setCourse] = useState("");
  const [showWeather, setShowWeather] = useState(true);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [weatherPenalty, setWeatherPenalty] = useState(0);
  const [windSpeed, setWindSpeed] = useState("");
  const [windDirection, setWindDirection] = useState("");
  const [weatherApplied, setWeatherApplied] = useState(false);

  const fetchMarineData = async () => {
    try {
      const response = await fetch(
        `https://be.azolla.sg/v2/vessel/latest_marine_data/?imo_number=${imo}`
      );

      const data = await response.json();

      setMarineData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateCustomCurve = async () => {
    try {
      if (!customGrade || !customIdleDays) {
        alert("Enter Fouling Grade and Idle Days");
        return;
      }

      setCustomLoading(true);

      const grade = Number(customGrade);

      if (grade < 0 || grade > 6) {
        alert("Fouling Grade must be between 0 and 6");
        return;
      }

      const response = await fetch(
        `https://da.azolla.sg/vessel/fouled_curves?imo=${imo}&idle_days=${customIdleDays}&fouling_grade=${customGrade}`
      );

      const data = await response.json();

      if (data.status === "success") {

        setCustomFouledCurves(data.fouled_curves);

        const penalty = Array.isArray(data.power_loss_pct)
          ? data.power_loss_pct.reduce((a, b) => a + b, 0) /
          data.power_loss_pct.length
          : data.power_loss_pct;

        setCustomPenalty(
          Math.round(penalty * 100) / 100
        );

      }
    } catch (err) {
      console.error(err);
    }

    setCustomLoading(false);
  };

  useEffect(() => {
    if (imo) {
      fetchMarineData();
    }
  }, [imo]);

  const handleFouledCurvesUpdate = (curves, penalty) => {
    setFouledCurves(curves);
    setAggregatePenalty(penalty);
  };

  const fetchAddedResistance = async () => {
    try {
      if (!marineData) {
        alert("Marine data not loaded");
        return;
      }

      if (!areaT) {
        alert("Please enter Area_T");
        return;
      }

      const response = await fetch(
        `https://da.azolla.sg/vessel/added_resistance?imo=${imo}&lat=${marineData.lat}&lon=${marineData.lng}&ship_course_deg=${marineData.hdg}&area_t=${areaT}&sea_state=${seaState}`
      );

      const data = await response.json();

      console.log("Added Resistance Response", data);

      if (data.status === "success") {
        setAddedResistanceData(data.added_power_data

        );
        setWeatherApplied(true);

      }
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
    { id: "hull", label: "Hull Analysis", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 17l4-8 4 4 4-6 4 10" /><path d="M3 20h18" /></svg> },
    { id: "esd", label: "ESD Simulator", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2" /></svg> },
    { id: "reports", label: "Reports", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> },
  ];

  const topStats = [
    { label: "POWER PENALTY:", value: "+12.5%", color: C.critical },
    { label: "ADDED FUEL/DAY:", value: "+2.1 MT", color: C.warning },
    { label: "CURRENT SFOC:", value: "168 g/kWh", color: C.textPrimary },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.mainBg }}>

      {/* Sidebar */}
      {!isMobile && (
        <div style={{
          width: 200, flexShrink: 0,
          background: C.sidebarBg,
          borderRight: `1px solid ${C.borderSubtle}`,
          display: "flex", flexDirection: "column",
          padding: "20px 0",
        }}>
          {/* Logo */}
          <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${C.borderSubtle}` }}>
            <Logo small />
            <div style={{ fontSize: 10, color: C.textMuted, marginTop: 4 }}>IMO {imo}</div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "16px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActiveTab(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 9,
                background: activeTab === n.id ? "rgba(56,189,248,0.1)" : "transparent",
                border: activeTab === n.id ? `1px solid rgba(56,189,248,0.25)` : "1px solid transparent",
                color: activeTab === n.id ? C.accent : C.textSecondary,
                fontSize: 13, fontWeight: activeTab === n.id ? 600 : 400,
                cursor: "pointer", textAlign: "left", width: "100%",
                transition: "all .15s",
              }}>
                {n.icon}{n.label}
              </button>
            ))}
          </nav>

          {/* Back button */}
          <div style={{ padding: "12px 10px", borderTop: `1px solid ${C.borderSubtle}`, display: "flex", flexDirection: "column", gap: 6 }}>
            <button onClick={onBack} style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.borderSubtle}`,
              color: C.textMuted, fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              New Analysis
            </button>
            <button onClick={onLogout} style={{
              width: "100%", padding: "9px 12px", borderRadius: 8,
              background: "rgba(239,68,68,0.07)",
              border: `1px solid rgba(239,68,68,0.2)`,
              color: "#f87171", fontSize: 12, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Mobile tab bar */}
        {isMobile && (
          <div style={{
            display: "flex", overflowX: "auto", gap: 4,
            padding: "10px 12px",
            background: C.sidebarBg,
            borderBottom: `1px solid ${C.borderSubtle}`,
            scrollbarWidth: "none",
          }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setActiveTab(n.id)} style={{
                flexShrink: 0, padding: "7px 14px", borderRadius: 20,
                border: `1px solid ${activeTab === n.id ? C.borderActive : C.border}`,
                background: activeTab === n.id ? C.accentDim : "transparent",
                color: activeTab === n.id ? C.accent : C.textMuted,
                fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}>{n.label}</button>
            ))}
            <button onClick={onLogout} style={{
              flexShrink: 0, padding: "7px 14px", borderRadius: 20,
              border: `1px solid rgba(239,68,68,0.3)`,
              background: "rgba(239,68,68,0.07)",
              color: "#f87171",
              fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            }}>Logout</button>
          </div>
        )}

        {/* Tab content */}
        <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "16px 12px" : "24px 28px" }}>

          {activeTab === "dashboard" && <DashboardTab
            isMobile={isMobile}
            shipData={shipData}
            fouledCurves={fouledCurves}
            aggregatePenalty={aggregatePenalty}
            areaT={areaT}
            setAreaT={setAreaT}
            marineData={marineData}
            fetchAddedResistance={fetchAddedResistance}
            addedResistanceData={addedResistanceData}
            weatherApplied={weatherApplied}
            setWeatherApplied={setWeatherApplied}
            setAddedResistanceData={setAddedResistanceData}
            foulingMode={foulingMode}
            setFoulingMode={setFoulingMode}

            customGrade={customGrade}
            setCustomGrade={setCustomGrade}

            customIdleDays={customIdleDays}
            setCustomIdleDays={setCustomIdleDays}

            calculateCustomCurve={calculateCustomCurve}
            seaState={seaState}
            setSeaState={setSeaState}

            customLoading={customLoading}

            customFouledCurves={customFouledCurves}
            customPenalty={customPenalty}
            setActiveTab={setActiveTab}

          />}
          {activeTab === "hull" && (
            <HullTab
              isMobile={isMobile}
              imo={imo}
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
              sectionResults={sectionResults}
              setSectionResults={setSectionResults}
              onFouledCurvesUpdate={handleFouledCurvesUpdate}
            />
          )}
          {activeTab === "weather" && <WeatherTab isMobile={isMobile} />}
          {activeTab === "esd" && <ESDTab isMobile={isMobile} />}
          {activeTab === "reports" && <ReportsTab isMobile={isMobile} imo={imo} shipData={shipData} />}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, controls }) {
  return (
    <div style={{
      background: C.cardSolid,
      border: `1px solid ${C.borderCard}`,
      borderRadius: 14, padding: "20px 20px 16px",
      animation: "fadeIn 0.4s both",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, fontFamily: "'Aeonik',sans-serif" }}>{title}</span>
        {controls}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => onChange(!value)}>
      <div style={{
        width: 36, height: 20, borderRadius: 10, position: "relative", transition: "background .2s",
        background: value ? C.accent : "rgba(255,255,255,0.12)",
      }}>
        <div style={{
          position: "absolute", top: 3, left: value ? 18 : 3, width: 14, height: 14,
          borderRadius: "50%", background: "#fff", transition: "left .2s",
        }} />
      </div>
      <span style={{ fontSize: 11, color: C.textSecondary }}>{label}</span>
    </div>
  );
}

const Dot = ({ color }) => <span style={{ width: 10, height: 2, background: color, display: "inline-block", borderRadius: 2, marginRight: 6 }} />;


function DashboardTab({
  isMobile,
  shipData,
  fouledCurves,
  aggregatePenalty,
  areaT,
  setAreaT,
  course,
  setCourse,
  latitude,
  longitude,
  showWeather,
  setShowWeather,
  weatherPenalty,
  marineData,
  fetchAddedResistance,
  addedResistanceData,
  weatherApplied,
  setWeatherApplied,
  setAddedResistanceData,
  foulingMode,
  setFoulingMode,

  customGrade,
  setCustomGrade,

  customIdleDays,
  setCustomIdleDays,

  calculateCustomCurve,
  customLoading,

  customFouledCurves,
  customPenalty,
  setActiveTab,
  seaState,
  setSeaState,

}) {
  const [showFouled, setShowFouled] = useState(true);
  const [hoverLow, setHoverLow] = useState(null);    // hovered speed on left chart
  const [hoverRight, setHoverRight] = useState(null); // hovered speed on right chart
  const [selectedDraught, setSelectedDraught] = useState(null);
  const [fuelConsumptionData, setFuelConsumptionData] = useState(null);
  // const [selectedDraught, setSelectedDraught] = useState(null);
  // const [fuelConsumptionData, setFuelConsumptionData] = useState(null);
  const [fuelUnit, setFuelUnit] = useState("tpd");        // "tpd" | "usd"
  const [bunkerPrice, setBunkerPrice] = useState("650");   // $/tonne

  const [intensity, setIntensity] = useState("");
  const foulingCfg = getFoulingConfig(customIdleDays);

  // keep customGrade (what the backend receives) in sync with the band/intensity
  useEffect(() => {
    if (!foulingCfg.valid) { setCustomGrade(""); return; }
    if (foulingCfg.needsIntensity) {
      const opt = foulingCfg.options.find(o => o.label === intensity);
      setCustomGrade(opt ? String(opt.grade) : "");
    } else {
      setCustomGrade(String(foulingCfg.grade));
    }
  }, [customIdleDays, intensity]);   


  

  const fcInput = {
    padding: "10px", borderRadius: 8,
    background: C.inputBg, border: `1px solid ${C.border}`, color: C.textPrimary,
  };

  const curves =
    foulingMode === "custom"
      ? (customFouledCurves || shipData?.draught_curves || {})
      : (fouledCurves || shipData?.draught_curves || {});

  const displayedPenalty =
    foulingMode === "custom"
      ? customPenalty
      : aggregatePenalty;

  const draughtKeys = Object.keys(curves);
  // sort by actual draught value so "lowest" / "highest" are numeric, not insertion order
  const sortedKeys = [...draughtKeys].sort(
    (a, b) => (curves[a]?.draught ?? 0) - (curves[b]?.draught ?? 0)
  );
  const lowKey = sortedKeys[0];                                   // left plot: always lowest
  const highDefaultKey = sortedKeys[sortedKeys.length - 1];       // right plot default: highest
  const rightKey = selectedDraught || highDefaultKey;            // right plot: user-selectable
  // shared Y max across both displayed charts (for the lock toggle)
  const maxOfKey = (key) => {
    const c = curves[key];
    if (!c) return 0;
    const added = addedResistanceData?.[key];
    const hasW = weatherApplied && !!added?.added_power_kW;
    let m = 0;
    c.speed.forEach((_, i) => {
      const brake = c.brake_power[i] || 0;
      const fouled = c.fouled_power ? c.fouled_power[i] : brake;
      const top = hasW ? (fouled + (added.added_power_kW[i] || 0)) : fouled;
      m = Math.max(m, brake, fouled, top);
    });
    return m;
  };
  const sharedMax = Math.ceil((Math.max(maxOfKey(lowKey), maxOfKey(rightKey)) + 500) / 500) * 500;
  const rightMax = Math.ceil((maxOfKey(rightKey) + 500) / 500) * 500;
  // headline delta (penalty) at the top speed point, for a given key
  // delta (penalty) at a given speed (or top speed if none hovered), for a given key
  const deltaSummary = (key, atSpeed = null) => {
    const c = curves[key];
    if (!c) return null;
    const added = addedResistanceData?.[key];
    const hasW = weatherApplied && !!added?.added_power_kW;
    const hasF = !!c.fouled_power;
    if (!hasF && !hasW) return null;

    // pick index: nearest to hovered speed, else last (top speed)
    let i = c.speed.length - 1;
    if (atSpeed != null) {
      let best = Infinity;
      c.speed.forEach((s, idx) => {
        const d = Math.abs(s - atSpeed);
        if (d < best) { best = d; i = idx; }
      });
    }

    const spd = Math.round(c.speed[i] * 10) / 10;
    const brake = Math.round(c.brake_power[i]);
    const fouled = hasF ? Math.round(c.fouled_power[i]) : brake;
    const top = hasW ? Math.round(fouled + (added.added_power_kW[i] || 0)) : fouled;
    const pct = brake > 0 ? Math.round(((top - brake) / brake) * 1000) / 10 : 0;
    return { spd, delta: top - brake, top, brake, pct, hovered: atSpeed != null };
  };
  const anyWeather = weatherApplied && !!addedResistanceData;

  // build the recharts rows for a given draught key
  const buildChartData = (key) => {
    const curve = curves[key];
    if (!curve) return [];
    const added = addedResistanceData?.[key];
    const hasW = weatherApplied && !!added?.added_power_kW;

    return curve.speed.map((s, i) => {
      const brakePower = Math.round(curve.brake_power[i]);
      const fouledPower = curve.fouled_power ? Math.round(curve.fouled_power[i]) : null;

      const row = {
        speed: Math.round(s * 10) / 10,
        brake_power: brakePower,
        fouled_power: fouledPower,
      };

      if (hasW) {
        const addedPower = added.added_power_kW[i] || 0;
        const base = fouledPower !== null ? fouledPower : brakePower;
        row.weather_power = Math.round(base + addedPower);
      }
      const upper = row.weather_power ?? row.fouled_power;
      if (upper != null) row.band = [brakePower, upper];
      return row;
    });
  };

  const renderPowerChart = (key, onHover, forcedMax = null) => {
    const curve = curves[key];
    const data = buildChartData(key);
    const added = addedResistanceData?.[key];
    const hasW = weatherApplied && !!added?.added_power_kW;

    if (!curve || data.length === 0) {
      return (
        <div style={{ height: isMobile ? 240 : 300, display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: 13, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
          No chart available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
          onMouseMove={(st) => {
            if (onHover && st && st.activeLabel != null) onHover(Number(st.activeLabel));
          }}
          onMouseLeave={() => onHover && onHover(null)}>
          <CartesianGrid stroke="rgba(255,255,255,0.12)" strokeDasharray="4 3" vertical={false} />
          <XAxis dataKey="speed" tick={{ fontSize: 10, fill: C.textMuted }}
            label={{ value: "Speed (knots)", position: "insideBottom", offset: -8, fontSize: 11, fill: C.textMuted }} />
          <YAxis tick={{ fontSize: 10, fill: C.textMuted }} width={55}
            domain={forcedMax != null ? [0, forcedMax] : [0, sharedMax]}
            label={{ value: "Power (kW)", angle: -90, position: "insideLeft", fontSize: 11, fill: C.textMuted, offset: 10 }} />
          <Tooltip
            contentStyle={{ background: C.cardSolid, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
            labelFormatter={v => `${v} kn`}
            formatter={(value, name, props) => {
              const clean = props?.payload?.brake_power;
              if (name === "brake_power") return [`${value.toLocaleString()} kW`, "Clean Hull"];
              if (name === "fouled_power") {
                const pct = clean > 0 ? Math.round(((value - clean) / clean) * 1000) / 10 : null;
                return [`${value.toLocaleString()} kW`, pct != null ? `Fouled (+${pct}%)` : "Fouled"];
              }
              if (name === "weather_power") {
                const pct = clean > 0 ? Math.round(((value - clean) / clean) * 1000) / 10 : null;
                return [`${value.toLocaleString()} kW`, pct != null ? `Weather Impact (+${pct}%)` : "Weather Impact"];
              }
              return null;   // hide the band from the tooltip
            }}
          />
          {/* shaded penalty band between clean and the top active curve */}
          <Area type="monotone" dataKey="band" stroke="none" fill="rgba(239,68,68,0.12)" isAnimationActive={false} legendType="none" />
          <Line type="monotone" dataKey="brake_power" stroke={C.accent} strokeWidth={2} dot={false} name="brake_power" />
          {showFouled && displayedPenalty !== null && curve?.fouled_power && (
            <Line type="monotone" dataKey="fouled_power" stroke={C.critical} strokeWidth={2} strokeDasharray="6 3" dot={false} name="fouled_power" />
          )}
          {hasW && (
            <Line type="monotone" dataKey="weather_power" stroke="#fbbf24" strokeWidth={3} dot={false} name="weather_power" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };



  const fetchFuelConsumptionData = async () => {
 

  // the fouled curves currently in view (custom or image-based)
  const fouledSource = foulingMode === "custom" ? customFouledCurves : fouledCurves;
  if (!fouledSource) return;

 const curvesPayload = {};

Object.keys(fouledSource).forEach((key) => {
  const fp = fouledSource[key]?.fouled_power;

  if (!fp) return;

  curvesPayload[key] = {
    fouled_power: fp,

    added_power_kW:
      weatherApplied && addedResistanceData?.[key]?.added_power_kW
        ? addedResistanceData[key].added_power_kW
        : new Array(fp.length).fill(0),
  };
});

  try {
    const response = await fetch("https://da.azolla.sg/vessel/fuel_consumption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imo: shipData.imo,
        curves: curvesPayload,      // <-- the piece that was missing
      }),
    });
    const data = await response.json();
    console.log(data);
    if (data.status === "success") setFuelConsumptionData(data.fuel_consumption_data);
    else setFuelConsumptionData(null);   // clear stale table on error
  } catch (err) {
    console.log(err);
  }
};
useEffect(() => {
  const fouledSource = foulingMode === "custom" ? customFouledCurves : fouledCurves;
 if (
    shipData?.imo &&
    fouledSource
) {
    fetchFuelConsumptionData();
}
}, [customFouledCurves, fouledCurves, weatherApplied, addedResistanceData, foulingMode]);
  const fuelValues = fuelConsumptionData
    ? Object.values(fuelConsumptionData).flatMap(d => d.fuel_t_per_day)
    : [];
  const fuelMin = fuelValues.length ? Math.min(...fuelValues) : 0;
  const fuelMax = fuelValues.length ? Math.max(...fuelValues) : 1;

  const fuelCellStyle = (tpd) => {
    const frac = fuelMax > fuelMin ? (tpd - fuelMin) / (fuelMax - fuelMin) : 0;
    const band = frac < 0.34
      ? { bg: "rgba(16,185,129,0.14)", fg: "#6ee7b7" }
      : frac < 0.67
        ? { bg: "rgba(245,158,11,0.14)", fg: "#fcd34d" }
        : { bg: "rgba(239,68,68,0.14)", fg: "#fca5a5" };
    return { background: band.bg, color: band.fg };
  };

  const priceNum = parseFloat(bunkerPrice) || 0;
  const fmtCell = (tpd) =>
    fuelUnit === "usd" ? Math.round(tpd * priceNum).toLocaleString() : tpd.toFixed(1);


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 14, padding: "20px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
            Speed vs Power — IMO {shipData?.imo}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>

            {/* {draughtKeys.length > 1 && (
              <select value={activeKey || ""} onChange={e => setSelectedDraught(e.target.value)}
                style={{ padding: "5px 10px", borderRadius: 6, background: C.inputBg, border: `1px solid ${C.border}`, color: C.textPrimary, fontSize: 11 }}>
                {draughtKeys.map(k => (
                  <option key={k} value={k}>{curves[k].draught}m draught</option>
                ))}
              </select>
            )} */}

            {displayedPenalty !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                onClick={() => setShowFouled(v => !v)}>
                <div style={{ width: 32, height: 18, borderRadius: 9, position: "relative", background: showFouled ? C.critical : "rgba(255,255,255,0.12)", transition: "background .2s" }}>
                  <div style={{ position: "absolute", top: 2, left: showFouled ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
                </div>
                <span style={{ fontSize: 11, color: C.textSecondary }}>Fouled +{displayedPenalty}%</span>
              </div>
            )}
            {shipData?.pdf_url && (
              <a href={shipData.pdf_url} target="_blank" rel="noopener noreferrer"
                style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.textSecondary, fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                PDF
              </a>
            )}
          </div>
        </div>

        <div
          style={{
            marginBottom: 16, padding: 16,
            background: C.statBg, border: `1px solid ${C.borderCard}`, borderRadius: 12,
          }}
        >
          <label style={{ display: "block", marginBottom: 8, fontSize: 11, color: C.accent }}>
            Fouling Curve
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, alignItems: "center" }}>
            <select
              value={foulingMode}
              onChange={(e) => {
                const value = e.target.value;
                setFoulingMode(value);
                if (value === "image") setActiveTab("hull");
              }}
              style={fcInput}
            >
              <option value="image">Image Based</option>
              <option value="custom">Custom</option>
            </select>

            {foulingMode === "custom" && (
              <>
                {/* Idle Days — comes first now */}
                <input
                  type="number" min="1" max="365"
                  placeholder="Idle Days"
                  value={customIdleDays}
                  onChange={(e) => { setCustomIdleDays(e.target.value); setIntensity(""); }}
                  style={fcInput}
                />

                {/* Fouling Intensity — selectable only in the ≤40 and 88–120 bands */}
                {foulingCfg.needsIntensity ? (
                  <select value={intensity} onChange={(e) => setIntensity(e.target.value)} style={fcInput}>
                    <option value="">Fouling Intensity</option>
                    {foulingCfg.options.map(o => (
                      <option key={o.label} value={o.label}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    readOnly
                    placeholder="Fouling Intensity"
                    value={foulingCfg.valid ? `Auto · Grade ${foulingCfg.grade}` : ""}
                    style={{ ...fcInput, color: C.textMuted, cursor: "not-allowed", opacity: 0.7 }}
                  />
                )}

                <button
                  onClick={calculateCustomCurve}
                  disabled={customLoading || !customGrade || !customIdleDays}
                  style={{
                    padding: "10px 12px", borderRadius: 8,
                    background: (customLoading || !customGrade) ? "rgba(14,165,233,0.4)" : C.accent,
                    border: `1px solid ${C.border}`, color: "#fff", fontSize: 11,
                    cursor: (customLoading || !customGrade) ? "not-allowed" : "pointer",
                  }}
                >
                  {customLoading ? "Calculating..." : "Calculate"}
                </button>
              </>
            )}
          </div>

          {foulingMode === "custom" && foulingCfg.note && (
            <div style={{ marginTop: 8, fontSize: 10, color: C.textMuted }}>{foulingCfg.note}</div>
          )}
        </div>
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            background: C.statBg,
            border: `1px solid ${C.borderCard}`,
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
              gap: 12,
              alignItems: "center",
            }}
          >

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 11,
                  color: C.accent,
                }}
              >
                Transverse area A_T (m²)
              </label>

              <input
                type="number"
                value={areaT}
                onChange={(e) => {
                  setAreaT(e.target.value);
                  setWeatherApplied(false);        // hide line until re-applied
                  setAddedResistanceData(null);
                }}
                placeholder="Enter Area_T"
                style={{
                  width: "100%", padding: "10px", borderRadius: 8,
                  background: C.inputBg, border: `1px solid ${C.accent}`, color: C.textPrimary,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 11,
                  color: C.textMuted,
                }}
              >
                Latitude
              </label>

              <input
                readOnly
                value={marineData?.lat || ""}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  background: C.inputBg,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 11,
                  color: C.textMuted,
                }}
              >
                Longitude
              </label>

              <input
                readOnly
                value={marineData?.lng || ""}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  background: C.inputBg,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 11,
                  color: C.accent,
                  fontWeight: 600,
                }}
              >
                Sea State
              </label>

              <select
                value={seaState}
                onChange={(e) => setSeaState(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  background: C.inputBg,
                  border: `1px solid ${C.accent}`,
                  color: C.textPrimary,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <option value="0">0 - Calm (glassy)</option>
                <option value="1">1 - Calm (rippled)</option>
                <option value="2">2 - Smooth</option>
                <option value="3">3 - Slight</option>
                <option value="4">4 - Moderate</option>
                <option value="5">5 - Rough</option>
                <option value="6">6 - Very rough</option>
                <option value="7">7 - High</option>
                <option value="8">8 - Very high</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 11,
                  color: C.textMuted,
                }}
              >
                Course °
              </label>

              <input
                readOnly
                value={marineData?.hdg || ""}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 8,
                  background: C.inputBg,
                  border: `1px solid ${C.border}`,
                  color: C.textSecondary,
                }}
              />
            </div>

            <button style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: C.accent,
              border: `1px solid ${C.border}`,
              color: "#fff",
              fontSize: 11, cursor: "pointer",
              marginTop: 16,
            }}
              onClick={fetchAddedResistance}
              disabled={!areaT || !marineData}
            >
              Apply Weather
            </button>

          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 20, height: 2, background: C.accent, display: "inline-block", borderRadius: 2 }} />
            <span style={{ fontSize: 11, color: C.textSecondary }}>Clean Hull</span>
          </div>
          {displayedPenalty !== null ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 20, height: 2, background: C.critical, display: "inline-block", borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: C.textSecondary }}>Fouled Hull (power loss by speed point)</span>
            </div>
          ) : (
            <span style={{ fontSize: 11, color: C.textMuted }}>
              Upload hull images → enter idle days → calculate to see fouled curve
            </span>
          )}

          {anyWeather && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 20, height: 2, background: "#fbbf24", display: "inline-block" }} />
              <span style={{ fontSize: 11, color: C.textSecondary }}>Weather Impact</span>
            </div>
          )}
        </div>

        {/* Chart */}
        {/* Charts — left fixed on lowest draught, right selectable (default highest) */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>

          {/* Left — lowest draught (fixed) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, height: 34 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary }}>
                Lowest draught
              </span>
              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: C.accentDim, border: `1px solid ${C.border}`, color: C.accent }}>
                {lowKey ? `${curves[lowKey].draught} m` : "—"}
              </span>
            </div>
            {renderPowerChart(lowKey, setHoverLow, rightMax)}
            {(() => {
              const d = deltaSummary(lowKey, hoverLow);
              return d ? (
                <div style={{ marginTop: 8, fontSize: 11, color: C.textSecondary }}>
                  Penalty at <span style={{ color: C.textPrimary, fontWeight: 600 }}>{d.spd} kn</span>
                  {!d.hovered && <span style={{ color: C.textMuted }}> (max — hover to scan)</span>}:{" "}
                  <span style={{ color: C.critical, fontWeight: 700 }}>+{d.delta.toLocaleString()} kW</span>{" "}
                  <span style={{ color: C.warning, fontWeight: 600 }}>(+{d.pct}%)</span>{" "}
                  <span style={{ color: C.textMuted }}>{d.brake.toLocaleString()} → {d.top.toLocaleString()} kW</span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Right — selectable draught (default highest) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, height: 34, flexWrap: "nowrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary }}>
                Compare draught
              </span>
              {draughtKeys.length > 1 ? (
                <select value={rightKey || ""} onChange={e => setSelectedDraught(e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: 6, background: C.inputBg, border: `1px solid ${C.border}`, color: C.textPrimary, fontSize: 11 }}>
                  {sortedKeys.map(k => (
                    <option key={k} value={k}>{curves[k].draught} m draught</option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: C.accentDim, border: `1px solid ${C.border}`, color: C.accent }}>
                  {rightKey ? `${curves[rightKey].draught} m` : "—"}
                </span>
              )}
            </div>
            {renderPowerChart(rightKey, setHoverRight)}
            {(() => {
              const d = deltaSummary(rightKey, hoverRight);
              return d ? (
                <div style={{ marginTop: 8, fontSize: 11, color: C.textSecondary }}>
                  Penalty at <span style={{ color: C.textPrimary, fontWeight: 600 }}>{d.spd} kn</span>
                  {!d.hovered && <span style={{ color: C.textMuted }}> (max — hover to scan)</span>}:{" "}
                  <span style={{ color: C.critical, fontWeight: 700 }}>+{d.delta.toLocaleString()} kW</span>{" "}
                  <span style={{ color: C.warning, fontWeight: 600 }}>(+{d.pct}%)</span>{" "}
                  <span style={{ color: C.textMuted }}>{d.brake.toLocaleString()} → {d.top.toLocaleString()} kW</span>
                </div>
              ) : null;
            })()}
          </div>
        </div>


        {/* Penalty summary bar */}
        {displayedPenalty !== null && (
          <div style={{ marginTop: 14, padding: "10px 16px", background: "rgba(239,68,68,0.06)", border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 8, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.08em" }}>AVG HULL PENALTY</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.critical }}>{displayedPenalty}%</div>
            </div>
            <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.08)" }} />
            <div style={{ fontSize: 11, color: C.textMuted, flex: 1 }}>
              Hull fouling will lead to <span style={{ color: C.critical, fontWeight: 700 }}>{displayedPenalty}% more power consumption on average</span>.
              {foulingMode === "custom"
                ? " Based on custom idle-days input."
                : " Switch to Hull Analysis to update values."}
            </div>
          </div>
        )}

       
      </div>

       {fuelConsumptionData && Object.keys(fuelConsumptionData).length > 0 && (
  <div style={{ marginTop: 24, border: `1px solid ${C.borderCard}`, borderRadius: 12, background: C.cardSolid, padding: 16 }}>

    {/* Header row: title + caption + unit toggle */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
          Fuel Consumption {fuelUnit === "usd" ? "($/day)" : "(t/day)"}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
          On final power — includes fouling + weather
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {fuelUnit === "usd" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: C.textMuted }}>Bunker $/t</span>
            <input
              type="number"
              value={bunkerPrice}
              onChange={(e) => setBunkerPrice(e.target.value)}
              style={{ width: 70, padding: "5px 8px", borderRadius: 6, background: C.inputBg, border: `1px solid ${C.border}`, color: C.textPrimary, fontSize: 11 }}
            />
          </div>
        )}
        <div style={{ display: "inline-flex", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          {["tpd", "usd"].map((u) => (
            <span
              key={u}
              onClick={() => setFuelUnit(u)}
              style={{
                padding: "6px 14px", fontSize: 11, cursor: "pointer",
                background: fuelUnit === u ? C.accentDim : "transparent",
                color: fuelUnit === u ? C.accent : C.textSecondary,
              }}
            >
              {u === "tpd" ? "t/day" : "$/day"}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Table */}
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ position: "sticky", left: 0, zIndex: 1, background: C.statBg, textAlign: "left", padding: "10px 12px", color: C.accent, fontWeight: 600, border: `1px solid ${C.borderSubtle}` }}>
              Draught \ Speed (kn)
            </th>
            {fuelConsumptionData[Object.keys(fuelConsumptionData)[0]].speed.map((speed) => (
              <th key={speed} style={{ padding: "10px 12px", background: C.statBg, textAlign: "center", color: C.accent, fontWeight: 600, border: `1px solid ${C.borderSubtle}` }}>
                {speed.toFixed(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(fuelConsumptionData).map(([key, d]) => (
            <tr key={key}>
              <td style={{ position: "sticky", left: 0, zIndex: 1, background: C.statBg, padding: "10px 12px", fontWeight: 600, color: C.accent, border: `1px solid ${C.borderSubtle}` }}>
                {d.draught} m
              </td>
              {d.fuel_t_per_day.map((fuel, i) => (
                <td key={i} style={{ padding: "10px 12px", textAlign: "center", border: `1px solid ${C.borderSubtle}`, ...fuelCellStyle(fuel) }}>
                  {fmtCell(fuel)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Legend */}
    <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: C.textMuted }}>
      {[["rgba(16,185,129,0.4)", "lower"], ["rgba(245,158,11,0.4)", "mid"], ["rgba(239,68,68,0.4)", "higher"]].map(([c, l]) => (
        <span key={l}>
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: c, verticalAlign: "middle", marginRight: 5 }} />
          {l}
        </span>
      ))}
    </div>
  </div>
)}
    </div>
  );
}


function HullTab({ isMobile, imo, uploadedImages, setUploadedImages, sectionResults, setSectionResults, onFouledCurvesUpdate }) {
  const [selected, setSelected] = useState(0);
  const [selectedType, setSelectedType] = useState("vertical_sides");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [idleDays, setIdleDays] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  // const [powerLossData, setPowerLossData] = useState({});
  const [powerLossLoading, setPowerLossLoading] = useState(false);

  useEffect(() => {
    // Only auto-populate idle days on first mount if there's data
    if (!isInitialized) {
      const anyIdleDays = Object.values(sectionResults).find(
        (r) => r?.idle_days !== undefined && r?.idle_days !== null
      )?.idle_days;

      if (anyIdleDays !== undefined && anyIdleDays !== null) {
        setIdleDays(String(anyIdleDays));
      }
      setIsInitialized(true);
    }
  }, []);

  const applyIdleDaysToAllSections = (days) => {
    setSectionResults((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;

      const next = { ...prev };
      keys.forEach((key) => {
        next[key] = {
          ...next[key],
          idle_days: days,
        };
      });
      return next;
    });
  };

  const avgList = (arr) => arr.length
    ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100
    : 0;
  // Use the worst fouling grade across all uploaded sections because idle days is a vessel-level characteristic.
  const getMaxFoulingGrade = (results) => {
    const foulingGrades = Object.values(results)
      .map((result) => result?.fouling_grade)
      .filter((grade) => grade !== undefined && grade !== null);

    return foulingGrades.length > 0 ? Math.max(...foulingGrades) : null;
  };

  // Run one vessel-level power-loss request and reuse the same result for Hull Analysis and Dashboard.
  const calculateVesselPowerLoss = async (days, currentResults) => {
    const maxFoulingGrade = getMaxFoulingGrade(currentResults);

    if (!maxFoulingGrade) {
      throw new Error("Missing fouling grades");
    }

    const response = await fetch(
      `https://da.azolla.sg/vessel/fouled_curves?imo=${imo}&idle_days=${days}&fouling_grade=${maxFoulingGrade}`
    );
    const data = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Unable to calculate vessel power loss");
    }

    const penaltyValues = Array.isArray(data.power_loss_pct)
      ? data.power_loss_pct
      : [data.power_loss_pct];
    const vesselPenalty = avgList(penaltyValues.filter((value) => value !== undefined && value !== null));

    const updatedResults = Object.fromEntries(
      Object.entries(currentResults).map(([sectionId, result]) => [
        sectionId,
        {
          ...result,
          power_loss_pct: vesselPenalty,
          roughness: data.roughness,
          idle_days: days,
        },
      ])
    );

    // Copy the vessel-level result to every section so the UI stays consistent across hull panels.
    setSectionResults(updatedResults);
    onFouledCurvesUpdate(data.fouled_curves, vesselPenalty);
  };
  const SCORECARD_DATA = {

    vertical_sides: [
      {
        label: "FOULING GRADE:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "FOULING AGENTS DETECTED:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "IMPACT ON POWER CONSUMPTION:",
        value: "Enter idle days →",
        color: C.textMuted,
      },
    ],

    propeller: [
      {
        label: "FOULING GRADE:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "FOULING AGENTS DETECTED:",
        value: "-",

        color: C.textMuted,
      },
      {
        label: "IMPACT ON POWER CONSUMPTION:",
        value: "Enter idle days →",
        color: C.textMuted,
      },
    ],

    rudder: [
      {
        label: "FOULING GRADE:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "FOULING AGENTS DETECTED:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "IMPACT ON POWER CONSUMPTION:",
        value: "Enter idle days →",
        color: C.textMuted,
      },
    ],

    flat_bottom: [
      {
        label: "FOULING GRADE:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "FOULING AGENTS DETECTED:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "IMPACT ON POWER CONSUMPTION:",
        value: "Enter idle days →",
        color: C.textMuted,
      },
    ],

    bilge_keels: [
      {
        label: "FOULING GRADE:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "FOULING AGENTS DETECTED:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "IMPACT ON POWER CONSUMPTION:",
        value: "Enter idle days →",
        color: C.textMuted,
      },
    ],

    sea_chest: [
      {
        label: "FOULING GRADE:",
        value: "-",
        color: C.textMuted,
      },
      {
        label: "FOULING AGENTS DETECTED:",
        value: "-",

        color: C.textMuted,
      },
      {
        label: "IMPACT ON POWER CONSUMPTION:",
        value: "Enter idle days →",
        color: C.textMuted,
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
        {
          uploadId,
          imageUrl: localPreview,
          annotatedImage: null,
          uploading: true,
        },
      ],
    }));

    setSelectedType(section.id);
    setSelectedImageIndex(-1);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("imo", imo);
      formData.append("section", section.id);
      formData.append("filename", section.s3Key);

      const response = await fetch(
        "https://da.azolla.sg/upload-hull-image",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        // ── Store ALL result fields including agent_patches ──
        setSectionResults(prev => ({
          ...prev,
          [section.id]: {
            fouling_grade: result.fouling_grade,
            fouling_type: result.fouling_type,
            fouling_percentage: result.fouling_percentage,
            idle_days: idleDays ? parseInt(idleDays, 10) : undefined,
            agent_patches: result.agent_patches || {},
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

        setSelectedImageIndex(-1);
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

  // Legacy per-section power-loss flow was removed because calculation must now use the vessel-wide maximum fouling grade.

  const HULL_SECTIONS = [
    { id: "vertical_sides", label: "Vertical Sides", s3Key: "Vertical_Side_img1", required: true },
    { id: "propeller", label: "Propeller", s3Key: "Propeller_img1", required: true },
    { id: "bilge_keels", label: "Bilge Keels", s3Key: "Bilge_Keels_img1", required: false },
    { id: "rudder", label: "Rudder", s3Key: "Rudder_img1", required: true },
    { id: "sea_chest", label: "Sea Chest", s3Key: "Sea_Chest_img1", required: false },
    { id: "flat_bottom", label: "Flat Bottom", s3Key: "Flat_Bottom_img1", required: true },
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
      // ── Show power_loss_pct if available, otherwise show "Enter idle days"
      value: liveResult.power_loss_pct !== undefined
        ? `${liveResult.power_loss_pct}%`
        : "Enter idle days →",
      color: liveResult.power_loss_pct !== undefined
        ? (liveResult.power_loss_pct > 20 ? C.critical
          : liveResult.power_loss_pct > 10 ? C.warning
            : C.success)
        : C.textMuted,
    },
  ] : (SCORECARD_DATA[selectedType] || []);

  const getIncompleteSections = () => HULL_SECTIONS.filter((section) => {
    const sectionImages = uploadedImages[section.id] || [];
    return sectionImages.length === 0 || sectionImages.some((image) => image.uploading);
  });

  const validateAllImagesUploaded = () => {
    const missing = getIncompleteSections();

    if (missing.length > 0) {
      alert(
        `Please upload and complete processing for: ${missing.map(m => m.label).join(", ")}`
      );
      return false;
    }

    return true;
  };

  const hasAllFoulingGrades = HULL_SECTIONS.every(
    (section) => sectionResults[section.id]?.fouling_grade !== undefined
  );

  // Keep calculation disabled until every required image is processed, all fouling grades exist, and idle days is set.
  const canCalculatePowerLoss =
    getIncompleteSections().length === 0 && hasAllFoulingGrades && parseInt(idleDays, 10) > 0;

  const clearSectionUpload = (sectionId) => {
    setUploadedImages(prev => ({
      ...prev,
      [sectionId]: [],
    }));

    setSectionResults(prev => {
      const next = { ...prev };
      delete next[sectionId];
      return next;
    });

    setSelectedImageIndex(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Upload area */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          background: C.cardSolid,
          border: `1px solid ${C.borderCard}`,
          borderRadius: 12,
          padding: "14px",
          flexWrap: "wrap",
        }}
      >

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: C.inputBg,
            border: `1px solid ${C.border}`,
            color: C.textPrimary,
            minWidth: 180,
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
            padding: "10px 18px",
            borderRadius: 8,
            background: C.accentBtn,
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Upload Images

          <input
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={(e) => {
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

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr 1fr", gap: 16 }}>

        {/* Column 1 — Hull photos list */}
        <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderSubtle}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: C.accentDim, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.accent, fontWeight: 700 }}>1</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, fontFamily: "'Aeonik',sans-serif", letterSpacing: "0.05em" }}>HULL PHOTOS</span>
            </div>
          </div>

          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {HULL_SECTIONS.map((img, i) => (
              <div
                key={img.id}
                onClick={() => {
                  setSelected(i);
                  setSelectedType(img.id);
                  setSelectedImageIndex(0);
                }} style={{
                  padding: "10px",
                  borderRadius: 8,
                  cursor: "pointer",
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{
                      fontSize: 12,
                      color: C.textPrimary,
                      fontWeight: 600,
                    }}>
                      {img.label}
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: (uploadedImages[img.id]?.length > 0) ? C.success : C.textMuted
                      }}
                    >
                      {(uploadedImages[img.id]?.length > 0) ? "Uploaded" : "Pending Upload"}
                    </div>
                  </div>

                  {(() => {
                    const imgs = uploadedImages[img.id] || [];
                    const first = imgs[0];
                    if (!first) return null;
                    const src = first.annotatedImage || first.imageUrl;
                    return (
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <img
                          src={src}
                          alt={img.label}
                          style={{
                            width: 40, height: 40,
                            borderRadius: 6, objectFit: "cover",
                            border: `1px solid ${C.border}`,
                            opacity: first.uploading ? 0.5 : 1,
                          }}
                        />
                        {first.uploading && (
                          <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: 6,
                          }}>
                            <div style={{
                              width: 16, height: 16,
                              border: `2px solid rgba(56,189,248,0.3)`,
                              borderTop: `2px solid ${C.accent}`,
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }} />
                          </div>
                        )}
                        {!first.uploading && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSectionUpload(img.id);
                            }}
                            title="Delete image"
                            style={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              background: C.critical,
                              border: "none",
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                              padding: 0,
                            }}
                          >
                            x
                          </button>
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
        <div style={{ padding: "14px" }}>

          {(() => {
            const sectionImages = uploadedImages[selectedType] || [];
            const displayIndex = selectedImageIndex === -1 || selectedImageIndex >= sectionImages.length
              ? sectionImages.length - 1
              : selectedImageIndex;
            const current = sectionImages[displayIndex];

            if (!current) {
              return (
                <div style={{
                  height: "320px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px dashed ${C.border}`,
                  borderRadius: 10,
                  color: C.textMuted,
                  fontSize: 13,
                }}>
                  Upload image for AI analysis
                </div>
              );
            }

            if (current.uploading) {
              return (
                <div style={{
                  height: "320px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px dashed ${C.border}`,
                  borderRadius: 10,
                  gap: 16,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Blurred local preview as background */}
                  {current.imageUrl && (
                    <img
                      src={current.imageUrl}
                      alt="preview"
                      style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        filter: "blur(6px) brightness(0.4)",
                        borderRadius: 10,
                      }}
                    />
                  )}
                  <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    {/* Spinner */}
                    <div style={{
                      width: 40, height: 40,
                      border: `3px solid rgba(56,189,248,0.2)`,
                      borderTop: `3px solid ${C.accent}`,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>Uploading to S3 &amp; running AI detection…</span>
                    <span style={{ fontSize: 11, color: C.textMuted }}>Fouling regions will be highlighted when complete</span>
                  </div>
                </div>
              );
            }

            return (
              <div style={{ position: "relative" }}>
                <img
                  src={current.annotatedImage || current.imageUrl}
                  alt="AI Detection — fouling regions highlighted"
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: `1px solid ${C.borderCard}`,
                    maxHeight: "420px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
                {!current.uploading && (
                  <button
                    onClick={() => clearSectionUpload(selectedType)}
                    title="Delete image"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      padding: "5px 10px",
                      borderRadius: 6,
                      background: "rgba(239,68,68,0.85)",
                      border: `1px solid rgba(239,68,68,0.5)`,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                )}
                {/* Badge shown when annotated image is from backend */}
                {current.annotatedImage && (
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: "rgba(10,25,50,0.85)",
                    border: `1px solid ${C.accent}`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.success, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>AI Detection Complete</span>
                  </div>
                )}
                {/* Thumbnail strip if multiple images in this section */}
                {sectionImages.length > 1 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {sectionImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.annotatedImage || img.imageUrl}
                        alt={`img ${idx + 1}`}
                        onClick={() => setSelectedImageIndex(idx)}
                        style={{
                          width: 48, height: 48,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: `2px solid ${displayIndex === idx ? C.accent : C.borderSubtle}`,
                          cursor: "pointer",
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
        <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.borderSubtle}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: C.accentDim, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.accent, fontWeight: 700 }}>3</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, fontFamily: "'Aeonik',sans-serif", letterSpacing: "0.05em" }}>PENALTY SCORECARD</span>
            </div>
          </div>
          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>



            {scorecard.map((s, i) => (
              <div key={i}>
                {/* Render scorecard item */}
                <div style={{ padding: "12px 14px", background: C.statBg, border: `1px solid ${C.borderCard}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 9, color: C.textMuted, letterSpacing: "0.08em", marginBottom: 5 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'Aeonik',sans-serif" }}>{s.value}</div>
                </div>

                {/* Insert Idle Days input between item 1 and item 2 */}
                {i === 1 && (
                  <div style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    background: C.statBg,
                    border: `1px solid ${C.borderCard}`,
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8
                  }}>
                    <label style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.textMuted,
                      letterSpacing: "0.08em",
                    }}>IDLE DAYS</label>
                    <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                      <input
                        type="number"
                        min="0"
                        max="10000"
                        value={idleDays}
                        onChange={(e) => {
                          const value = e.target.value;
                          setIdleDays(value);

                          const days = parseInt(value, 10);
                          if (!Number.isNaN(days) && days > 0) {
                            applyIdleDaysToAllSections(days);
                          }
                        }}
                        placeholder="Enter idle days"
                        style={{
                          padding: "8px 10px",
                          borderRadius: 6,
                          background: C.inputBg,
                          border: `1px solid ${C.border}`,
                          color: C.textPrimary,
                          fontSize: 12,
                        }}
                      />
                      <button
                        onClick={async () => {
                          const days = parseInt(idleDays, 10);

                          if (!validateAllImagesUploaded()) {
                            return;
                          }

                          if (!days || days <= 0) {
                            alert("Please enter valid idle days");
                            return;
                          }

                          const sectionsToCalculate = Object.entries(sectionResults)
                            .filter(([, result]) => result?.fouling_grade !== undefined);

                          if (sectionsToCalculate.length !== HULL_SECTIONS.length) {
                            alert("Please wait for fouling grades to be predicted for all sections");
                            return;
                          }

                          // This button now triggers one vessel-level request instead of separate per-section calculations.
                          setPowerLossLoading(true);

                          try {
                            await calculateVesselPowerLoss(days, sectionResults);
                          } catch (err) {
                            console.error(err);
                            alert(err.message || "Failed to calculate power loss");
                          } finally {
                            setPowerLossLoading(false);
                          }
                        }}
                        disabled={powerLossLoading || !canCalculatePowerLoss}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          background: powerLossLoading || !canCalculatePowerLoss ? "rgba(14,165,233,0.4)" : C.accentBtn,
                          color: "#fff",
                          cursor: powerLossLoading || !canCalculatePowerLoss ? "not-allowed" : "pointer",
                          fontSize: 11,
                          fontWeight: 600,
                          border: "none",
                          transition: "all 0.2s",
                          opacity: powerLossLoading || !canCalculatePowerLoss ? 0.7 : 1,
                        }}
                      >
                        {powerLossLoading ? "Calculating..." : "Calculate All"}
                      </button>
                      {!canCalculatePowerLoss && (
                        <div style={{ fontSize: 10, color: C.textMuted }}>
                          Upload all hull section images, wait for all fouling grades, and enter idle days to enable calculation.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* ── Gemini agent patches ─────────────────────────────────── */}
            {liveResult?.agent_patches && Object.keys(liveResult.agent_patches).length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{
                  fontSize: 9, color: C.textMuted,
                  letterSpacing: "0.08em", marginBottom: 10,
                  fontWeight: 700,
                }}>
                  DETECTED AGENT CLOSE-UPS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {Object.entries(liveResult.agent_patches).map(([agent, base64Img]) => (
                    <div key={agent} style={{
                      background: C.statBg,
                      border: `1px solid ${C.borderCard}`,
                      borderRadius: 8,
                      overflow: "hidden",
                    }}>
                      {/* Label */}
                      <div style={{
                        padding: "6px 10px",
                        display: "flex", alignItems: "center", gap: 6,
                        borderBottom: `1px solid ${C.borderSubtle}`,
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: C.warning, flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          color: C.warning, letterSpacing: "0.06em",
                          textTransform: "capitalize",
                        }}>
                          {agent}
                        </span>
                      </div>
                      {/* Cropped magnified image */}
                      <img
                        src={base64Img}
                        alt={`${agent} close-up`}
                        style={{
                          width: "100%",
                          display: "block",
                          objectFit: "cover",
                          maxHeight: 120,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Input card */}
      <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 12, padding: "18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.textMuted, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Weather Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.inputBg, color: C.textPrimary, fontSize: 13, cursor: "pointer" }}>
              <option value="calm">Calm</option>
              <option value="light">Light breeze</option>
              <option value="moderate">Moderate</option>
              <option value="strong">Strong wind</option>
              <option value="storm">Storm</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.textMuted, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>Route / Region</label>
            <input value={route} onChange={e => setRoute(e.target.value)} placeholder="e.g. North Atlantic"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.inputBg, color: C.textPrimary, fontSize: 13 }} />
          </div>
          <button>
            Analyze Impact
          </button>
        </div>
      </div>

      {/* Weather chart */}
      <ChartCard title="Weather Impact on Power Requirement"
        controls={
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Dot color={C.accent} /><span style={{ fontSize: 11, color: C.textSecondary }}>Calm water</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Dot color={C.warning} /><span style={{ fontSize: 11, color: C.textSecondary }}>With weather</span></div>
          </div>
        }
      >
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
          <LineChart data={weatherData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 3" />
            <XAxis dataKey="speed" tick={{ fontSize: 10, fill: C.textMuted }} label={{ value: "Speed (Knots)", position: "insideBottom", offset: -8, fontSize: 11, fill: C.textMuted }} />
            <YAxis tick={{ fontSize: 10, fill: C.textMuted }} width={40} />
            <Tooltip contentStyle={{ background: C.cardSolid, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} labelFormatter={v => `${v} kn`} />
            <Line type="monotone" dataKey="actual" stroke={C.accent} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="withWeather" stroke={C.warning} strokeWidth={2} dot={false} strokeDasharray="6 3" />

          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Weather stats */}
      {analyzed && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, animation: "slideUp 0.4s both" }}>
          {[
            { label: "Speed Loss", value: "−1.4 kn", color: C.warning },
            { label: "Added Resistance", value: "+18%", color: C.critical },
            { label: "Extra Fuel/Day", value: "+0.8 MT", color: C.warning },
            { label: "Route Penalty", value: "+$4.2k", color: C.critical },
          ].map((s, i) => (
            <div key={i} style={{ background: C.statBg, border: `1px solid ${C.borderCard}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'Aeonik',sans-serif" }}>{s.value}</div>
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
    { id: "duct", label: "Mewis Duct" },
    { id: "pbcf", label: "PBCF Fins" },
    { id: "coating", label: "Hi-Perf. Coating" },
    { id: "rudder", label: "Rudder Bulb" },
  ];

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const esdData = speedPowerData.map(d => ({
    ...d,
    simulated: Math.round(d.actual * 0.88),
  }));

  const roi = { investment: "$200k", payback: "14 Months", annual: "$170k" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: 16, alignItems: "start" }}>

        {/* Chart */}
        <ChartCard title="Line Chart"
          controls={
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Dot color={C.accent} /><span style={{ fontSize: 11, color: C.textSecondary }}>DESIGN CURVE</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Dot color={C.critical} /><span style={{ fontSize: 11, color: C.textSecondary }}>CURRENT ACTUAL</span></div>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
            <AreaChart data={esdData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.25)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 3" />
              <XAxis dataKey="speed" tick={{ fontSize: 10, fill: C.textMuted }} label={{ value: "Speed (Knots)", position: "insideBottom", offset: -8, fontSize: 11, fill: C.textMuted }} />
              <YAxis tick={{ fontSize: 10, fill: C.textMuted }} width={40} label={{ value: "Power (kW)", angle: -90, position: "insideLeft", fontSize: 11, fill: C.textMuted, offset: 10 }} />
              <Tooltip contentStyle={{ background: C.cardSolid, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }} labelFormatter={v => `${v} kn`} />
              <Area type="monotone" dataKey="design" stroke={C.accent} strokeWidth={2} fill="rgba(56,189,248,0.06)" dot={false} />
              <Area type="monotone" dataKey="actual" stroke={C.critical} strokeWidth={2} fill="transparent" dot={false} />
              {selected.length > 0 && (
                <Area type="monotone" dataKey="simulated" stroke={C.success} strokeWidth={2}
                  strokeDasharray="6 3" fill="url(#savingsGrad)" dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: C.accent, fontFamily: "'Aeonik',sans-serif" }}>DESIGN CURVE</span>
            <span style={{ fontSize: 10, color: C.critical, fontFamily: "'Aeonik',sans-serif", marginLeft: 16 }}>CURRENT ACTUAL</span>
            {selected.length > 0 && <span style={{ fontSize: 10, color: C.success, fontFamily: "'Aeonik',sans-serif", marginLeft: 16 }}>ESD SIMULATED CURVE</span>}
            {selected.length > 0 && <span style={{ fontSize: 10, color: "rgba(16,185,129,0.5)", fontFamily: "'Aeonik',sans-serif", marginLeft: 16 }}>POTENTIAL SAVINGS GAP</span>}
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.borderSubtle}`, flexWrap: "wrap" }}>
            <Toggle label="Show Clean Hull Prediction" value={showClean} onChange={setShowClean} />
            <Toggle label="Show 2MT Weather Impact" value={showWeather} onChange={setShowWeather} />
          </div>
        </ChartCard>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: isMobile ? "auto" : 200 }}>

          {/* ESD selection */}
          <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 12, padding: "16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, letterSpacing: "0.1em", marginBottom: 12 }}>ESD SELECTION MENU</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {devices.map(d => (
                <div key={d.id} onClick={() => toggle(d.id)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${selected.includes(d.id) ? C.accent : C.textMuted}`,
                    background: selected.includes(d.id) ? C.accentDim : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s",
                  }}>
                    {selected.includes(d.id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: selected.includes(d.id) ? C.accent : C.textSecondary }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ROI */}
          <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 12, padding: "16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, letterSpacing: "0.1em", marginBottom: 10 }}>SIMULATED SAVINGS ROI:</div>
            {[
              { label: "Investment:", value: roi.investment },
              { label: "Payback:", value: roi.payback },
              { label: "Annual $ Saving:", value: roi.annual },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: C.textMuted }}>{r.label}</span>
                <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
            <button style={{
              width: "100%", marginTop: 8, padding: "10px",
              background: "rgba(56,189,248,0.1)", border: `1px solid ${C.accent}`,
              color: C.accent, borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Aeonik',sans-serif",
            }}>Generate Comparison Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}


function ReportsTab({ isMobile, imo, shipData }) {
  const reports = [
    {
      title: `IMO ${imo} — Full Performance Report`, date: "Today", type: "PDF",
      status: "ready", url: shipData?.pdf_url
    },
    { title: `Hull Fouling Analysis`, date: "Today", type: "PDF", status: "ready" },
    { title: `ESD Comparison Report`, date: "Today", type: "XLSX", status: "generating" },
    { title: `Weather Impact Summary`, date: "Today", type: "PDF", status: "ready" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.textSecondary, marginBottom: 4 }}>
        Generated reports for IMO {imo}
      </div>
      {reports.map((r, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, padding: "16px 18px",
          background: C.cardSolid, border: `1px solid ${C.borderCard}`,
          borderRadius: 10, animation: `slideUp 0.3s ${i * 0.08}s both`,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.accentDim, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{r.date} · {r.type}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 10, padding: "3px 10px", borderRadius: 20,
              background: r.status === "ready" ? C.successBg : "rgba(245,158,11,0.1)",
              color: r.status === "ready" ? C.success : C.warning,
              border: `1px solid ${r.status === "ready" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              fontWeight: 600, letterSpacing: "0.05em",
              animation: r.status === "generating" ? "pulse 1.5s infinite" : "none",
            }}>{r.status === "ready" ? "Ready" : "Generating…"}</span>
            {r.status === "ready" && (
              <button style={{
                padding: "6px 14px", borderRadius: 7, border: `1px solid ${C.border}`,
                background: "transparent", color: C.textSecondary, fontSize: 12, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


const INACTIVITY_TIMEOUT = 10 * 60 * 1500;

export default function App() {
  // Persist login + IMO + shipData across reloads
  const [page, setPage] = useState(() => {
    if (!localStorage.getItem("token")) return "login";
    if (localStorage.getItem("imo") && localStorage.getItem("shipData")) return "dashboard";
    return "landing";
  });
  const [imo, setImo] = useState(() => localStorage.getItem("imo") || "");
  const [shipData, setShipData] = useState(() => {
    try {
      const saved = localStorage.getItem("shipData");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const inactivityTimer = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("imo");
    localStorage.removeItem("shipData");
    localStorage.removeItem("lastActivity");
    setImo("");
    setShipData(null);
    setPage("login");
  };

  const resetTimer = useRef(null);
  resetTimer.current = () => {
    localStorage.setItem("lastActivity", Date.now());
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (localStorage.getItem("token")) {
      inactivityTimer.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    // On mount: if logged in, check if already timed out from a previous session
    if (localStorage.getItem("token")) {
      const lastActivity = parseInt(localStorage.getItem("lastActivity") || "0");
      const elapsed = Date.now() - lastActivity;
      if (lastActivity && elapsed > INACTIVITY_TIMEOUT) {
        // Session expired while tab was closed
        handleLogout();
        return;
      }
    }

    // Attach activity listeners
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const handler = () => resetTimer.current();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));

    // Start the timer
    resetTimer.current();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  const handleEnter = (id, data) => {
    localStorage.setItem("imo", id);
    localStorage.setItem("shipData", JSON.stringify(data));
    setImo(id);
    setShipData(data);
    setPage("dashboard");
  };

  const handleBack = () => {
    localStorage.removeItem("imo");
    localStorage.removeItem("shipData");
    setImo("");
    setShipData(null);
    setPage("landing");
  };

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
          onLogout={handleLogout}
          onEnter={handleEnter}
        />
      )}

      {page === "dashboard" && (
        <Dashboard
          imo={imo}
          shipData={shipData}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}