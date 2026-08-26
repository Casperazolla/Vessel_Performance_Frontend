import { useState, useEffect } from "react";

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
  petrol: "#223548",
  centregrey: "#D8E6F3",

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

export {
  C,
  useMediaQuery,
  makeSpeedPowerData,
  speedPowerData,
  Logo,
  GlobalStyles,
};
