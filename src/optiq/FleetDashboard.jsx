import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { C, useMediaQuery, Logo } from "./shared";

function FleetDashboard({ fleet, results, onBack, onLogout }) {
  const isMobile = useMediaQuery(768);
  const list = Array.isArray(results) ? results : [];
  const ok = list.filter(r => r.status === "success");
  const failed = list.filter(r => r.status !== "success");

  const summary = [
    { label: "FLEET SIZE", value: list.length, color: C.accent },
    { label: "ANALYZED", value: ok.length, color: C.success },
    { label: "FAILED", value: failed.length, color: failed.length ? C.critical : C.textMuted },
  ];

  // highest-draught clean curve for each vessel's mini chart
  const miniData = (data) => {
    const curves = data?.draught_curves || {};
    const keys = Object.keys(curves).sort(
      (a, b) => (curves[a]?.draught ?? 0) - (curves[b]?.draught ?? 0)
    );
    const c = curves[keys[keys.length - 1]];
    if (!c || !Array.isArray(c.speed)) return [];
    return c.speed.map((s, i) => ({
      speed: Math.round(s * 10) / 10,
      power: Math.round(c.brake_power[i]),
    }));
  };

  const btn = {
    padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.mainBg }}>

      {/* Top bar â€” no nav tabs, dashboard only */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "14px 16px" : "16px 28px",
        background: C.sidebarBg, borderBottom: `1px solid ${C.borderSubtle}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo small />
          <div style={{ borderLeft: `1px solid ${C.borderSubtle}`, paddingLeft: 12 }}>
            <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: 600 }}>Fleet Analysis</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{list.length} vessels</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ ...btn, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSubtle}`, color: C.textMuted }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            New Analysis
          </button>
          <button onClick={onLogout} style={{ ...btn, background: "rgba(239,68,68,0.07)", border: `1px solid rgba(239,68,68,0.2)`, color: "#f87171" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, overflow: "auto",
        padding: isMobile ? "16px" : "24px 28px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>

        {/* Summary tiles */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "repeat(3, 200px)", gap: 12 }}>
          {summary.map((s, i) => (
            <div key={i} style={{ background: C.statBg, border: `1px solid ${C.borderCard}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em" }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Vessel cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {list.map((r, i) => {
            const data = r.data || {};
            const isFailed = r.status !== "success";
            const chart = isFailed ? [] : miniData(data);
            return (
              <div key={r.imo || i} style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 14, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 700 }}>IMO {r.imo}</div>
                    <div style={{ fontSize: 11, color: isFailed ? C.critical : C.success }}>
                      {isFailed ? "Analysis failed" : "Analyzed"}
                    </div>
                  </div>
                  {data.pdf_url && (
                    <a href={data.pdf_url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`, color: C.textSecondary, fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      PDF
                    </a>
                  )}
                </div>

                {chart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={chart} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 3" vertical={false} />
                      <XAxis dataKey="speed" tick={{ fontSize: 9, fill: C.textMuted }} />
                      <YAxis tick={{ fontSize: 9, fill: C.textMuted }} width={44} />
                      <Tooltip
                        contentStyle={{ background: C.cardSolid, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11 }}
                        labelFormatter={v => `${v} kn`}
                        formatter={v => [`${v.toLocaleString()} kW`, "Clean Hull"]}
                      />
                      <Line type="monotone" dataKey="power" stroke={C.accent} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: 12, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
                    No curve data
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FleetDashboard;
