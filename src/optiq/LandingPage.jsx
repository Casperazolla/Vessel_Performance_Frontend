import { useState } from "react";
import { C, useMediaQuery, Logo } from "./shared";

function LandingPage({ onEnter, onLogout }) {
  const [imo, setImo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("single");
  const [fleetImos, setFleetImos] = useState([]);
  const [showFleetModal, setShowFleetModal] = useState(false);
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


  const isValidImo = (value) => /^\d{7}$/.test((value || "").trim());

  const ANALYSIS_URL = "https://da.azolla.sg/Vessel_Performance_Project/run";
  const DESIGN_PARAMS_URL = "https://da.azolla.sg/Vessel_Performance_Project/design_params";

  const fetchFleetDesignParams = async (imos) => {
    const response = await fetch(DESIGN_PARAMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imos }),
    });
    return response.json();
  };
  const toFiniteNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const extractDesignValues = (payload) => {
    if (!payload || typeof payload !== "object") {
      return { draught: null, speed: null };
    }

    const searchSpaces = [payload, payload?.data, payload?.vessel_data, payload?.metadata].filter(Boolean);

    let draught = null;
    let speed = null;

    for (const space of searchSpaces) {
      if (draught == null) {
        draught =
          toFiniteNumber(space?.DESIGN_DRAUGHT) ??
          toFiniteNumber(space?.design_draught) ??
          toFiniteNumber(space?.designDraft) ??
          toFiniteNumber(space?.draft_design);
      }

      if (speed == null) {
        speed =
          toFiniteNumber(space?.DESIGN_SPEED) ??
          toFiniteNumber(space?.design_speed) ??
          toFiniteNumber(space?.designSpeed);
      }

      if (draught != null && speed != null) {
        break;
      }
    }

    return { draught, speed };
  };

  const callRunAnalysis = async (targetImo, options = {}) => {
    const formdata = new FormData();
    formdata.append("text_input", targetImo);

    if (options.fleetDraught != null) {
      formdata.append("fleet_draught", String(options.fleetDraught));
    }
    if (options.fleetSpeed != null) {
      formdata.append("fleet_speed", String(options.fleetSpeed));
    }

    const response = await fetch(ANALYSIS_URL, {
      method: "POST",
      body: formdata,
    });

    return response.json();
  };

  const addFleetImo = () => {
    const nextImo = imo.trim();

    if (!nextImo) {
      setErr("IMO number is required");
      return;
    }

    if (!isValidImo(nextImo)) {
      setErr("IMO must be exactly 7 digits");
      return;
    }

    if (fleetImos.includes(nextImo)) {
      setErr("IMO already added to fleet");
      return;
    }

    setFleetImos((prev) => [...prev, nextImo]);
    setImo("");
    setErr("");
  };

  const handleAnalyze = async (e) => {
    e?.preventDefault();

    // ---------- FLEET MODE ----------
    if (analysisMode === "fleet") {
      if (fleetImos.length === 0) {
        setErr("Add at least one IMO for fleet analysis");
        return;
      }
      setErr("");
      setLoading(true);
      try {
        // Pass 1: one cheap call for the whole fleet's design values.
        const designResp = await fetchFleetDesignParams(fleetImos);

        if (designResp.status !== "success") {
          setErr(designResp.message || "Unable to read design draught/speed for fleet IMOs.");
          setLoading(false);
          return;
        }

        const perVessel = designResp.per_vessel || {};

        const designRows = fleetImos
          .map((fleetImo) => {
            const dp = perVessel[fleetImo] || {};
            return {
              imo: fleetImo,
              draught: toFiniteNumber(dp.design_draught),
              speed: toFiniteNumber(dp.design_speed),
            };
          })
          .filter((row) => row.draught != null && row.speed != null);

        if (designRows.length === 0) {
          setErr("Unable to read design draught/speed for fleet IMOs.");
          setLoading(false);
          return;
        }

        const minFleetDraught = Math.min(...designRows.map((row) => row.draught));
        const minFleetSpeed = Math.min(...designRows.map((row) => row.speed));

        // Pass 2: run all vessels against shared minimum draught/speed.
        const results = await Promise.all(
          fleetImos.map(async (fleetImo) => {
            const json = await callRunAnalysis(fleetImo, {
              fleetDraught: minFleetDraught,
              fleetSpeed: minFleetSpeed,
            });

            return {
              imo: fleetImo,
              status: json.status,
              data: json,
              fleet_reference: {
                fleet_draught: minFleetDraught,
                fleet_speed: minFleetSpeed,
              },
            };
          })
        );

        onEnter(fleetImos, results, "fleet");   // array + results + mode
      } catch (error) {
        console.error(error);
        setErr("Server error");
      }
      setLoading(false);
      return;
    }

    // ---------- SINGLE MODE ----------
    const targetImo = imo.trim();

    if (!targetImo) {
      setErr("IMO number is required");
      return;
    }

    if (!isValidImo(targetImo)) {
      setErr("IMO must be exactly 7 digits");
      return;
    }

    setErr("");
    setLoading(true);

    try {
      const result = await callRunAnalysis(targetImo);


      if (result.status === "success") {
        onEnter(targetImo, result, "single");   // pass mode explicitly
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
          {/* Left - module cards */}
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

          {/* Right - form card */}
          <div className="Rightcard" style={{
            background: "rgba(10,25,50,0.70)",
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            backdropFilter: "blur(20px)",
            animation: "slideUp 0.6s 0.15s both",
            position: "relative",
          }}>
            {/* Card header */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2">
                  <rect x="2" y="2" width="7" height="7" rx="1" />
                  <rect x="15" y="2" width="7" height="7" rx="1" />
                  <rect x="2" y="15" width="7" height="7" rx="1" />
                  <path d="M15 15h7v7" />
                </svg>
                <span style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, fontFamily: "'Aeonik',sans-serif" }}>
                  Detailed Performance Analysis
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { setAnalysisMode("single"); setErr(""); }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 9,
                    border: `1px solid ${analysisMode === "single" ? C.accent : C.border}`,
                    background: analysisMode === "single" ? C.accentDim : "rgba(5,15,35,0.35)",
                    color: analysisMode === "single" ? C.accent : C.textSecondary,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  SINGLE VESSEL ANALYSIS
                </button>
                <button
                  type="button"
                  onClick={() => { setAnalysisMode("fleet"); setErr(""); }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 9,
                    border: `1px solid ${analysisMode === "fleet" ? C.accent : C.border}`,
                    background: analysisMode === "fleet" ? C.accentDim : "rgba(5,15,35,0.35)",
                    color: analysisMode === "fleet" ? C.accent : C.textSecondary,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  FLEET ANALYSIS
                </button>
              </div>
            </div>
            <div style={{ height: 1, background: C.borderSubtle, margin: "16px 0 22px" }} />

            <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 8 }}>Enter IMO Number</div>
            <input
              type="text" maxLength={7}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (analysisMode === "fleet") {
                    addFleetImo();
                  } else {
                    handleAnalyze();
                  }
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

            {analysisMode === "fleet" && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={addFleetImo}
                    disabled={!isValidImo(imo) || loading}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: (!isValidImo(imo) || loading) ? "rgba(14,165,233,0.4)" : C.accentBtn,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: (!isValidImo(imo) || loading) ? "not-allowed" : "pointer",
                    }}
                  >
                    Add IMO
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFleetModal(true)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: `1px solid ${C.border}`,
                      background: "rgba(5,15,35,0.45)",
                      color: C.accent,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="View added IMOs"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>

                  <span style={{ fontSize: 12, color: C.textMuted }}>
                    Added: {fleetImos.length}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || (analysisMode === "fleet" && fleetImos.length === 0)}
              style={{
                width: "100%", padding: "15px",
                background: loading ? "rgba(14,165,233,0.4)" : C.accentBtn,
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: (loading || (analysisMode === "fleet" && fleetImos.length === 0)) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all .25s", marginBottom: 20,
              }}
            >
              {loading ? (
                <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Analyzing</>
              ) : (analysisMode === "fleet" ? "ANALYZE FLEET" : "ANALYZE VESSEL")}
            </button>

            <div style={{ textAlign: "center" }}>

              <a onClick={() => {
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

            {showFleetModal && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(2,8,23,0.72)",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
                padding: 16,
              }}>
                <div style={{
                  width: "100%",
                  maxWidth: 340,
                  background: C.cardSolid,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  overflow: "hidden",
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderBottom: `1px solid ${C.borderSubtle}`,
                  }}>
                    <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: 700 }}>Fleet IMO List</span>
                    <button
                      type="button"
                      onClick={() => setShowFleetModal(false)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: C.textMuted,
                        fontSize: 16,
                        cursor: "pointer",
                        lineHeight: 1,
                      }}
                    >
                      x
                    </button>
                  </div>

                  <div style={{ maxHeight: 220, overflowY: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted, borderBottom: `1px solid ${C.borderSubtle}` }}>#</th>
                          <th style={{ textAlign: "left", padding: "8px 12px", color: C.textMuted, borderBottom: `1px solid ${C.borderSubtle}` }}>IMO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fleetImos.length === 0 ? (
                          <tr>
                            <td colSpan={2} style={{ padding: "12px", color: C.textMuted }}>No IMOs added yet.</td>
                          </tr>
                        ) : (
                          fleetImos.map((fleetImo, idx) => (
                            <tr key={`${fleetImo}-${idx}`}>
                              <td style={{ padding: "8px 12px", color: C.textSecondary, borderBottom: `1px solid ${C.borderSubtle}` }}>{idx + 1}</td>
                              <td style={{ padding: "8px 12px", color: C.textPrimary, borderBottom: `1px solid ${C.borderSubtle}` }}>{fleetImo}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
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

export default LandingPage;
