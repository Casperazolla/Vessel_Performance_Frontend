import { useState } from "react";

function LandingPage({ onEnter, onLogout }) {
  const [imo, setImo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("single");
  const [fleetImos, setFleetImos] = useState([]);
  const [showFleetModal, setShowFleetModal] = useState(false);

  const modules = [
    {
      icon: "📊",
      title: "Hull Analysis",
      desc: "AI powered hull fouling analysis and its impact on the Resistance and Power consumption based on the images uploaded.",
    },
    {
      icon: "⚙️",
      title: "ESD Simulator",
      desc: "ESD module which quantifies the power saving and the overall impact of different ESDs on the performance curve.",
    },
    {
      icon: "🌊",
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

        onEnter(fleetImos, results, "fleet");
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
        onEnter(targetImo, result, "single");
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
      background: "#f5f5f5",
      display: "flex",
      flexDirection: "column",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    }}>
      {/* Top navbar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        borderBottom: "1px solid #e5e7eb",
        background: "#ffffff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1f2937",
            letterSpacing: 2,
          }}>OPTIQ</div>
          <div style={{ borderLeft: "1px solid #e5e7eb", paddingLeft: 16 }}>
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Vessel Performance Platform</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <span style={{
            fontSize: 13,
            color: "#6b7280",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#1f2937"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
          >API Docs</span>
          <span style={{
            fontSize: 13,
            color: "#6b7280",
            cursor: "pointer",
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#1f2937"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
          >Platform Status</span>
          <button onClick={onLogout} style={{
            fontSize: 13,
            color: "#1f2937",
            cursor: "pointer",
            background: "transparent",
            border: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#1f2937"}
          >
            → Logout
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        alignItems: "center",
        padding: "60px 40px",
        maxWidth: 1400,
        margin: "0 auto",
        width: "100%",
      }}>
        {/* Left - module cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {modules.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              padding: "20px 24px",
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: 12,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                flexShrink: 0,
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}>{m.icon}</div>
              <div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1f2937",
                  marginBottom: 6,
                }}>
                  {m.title}
                </div>
                <div style={{
                  fontSize: 13,
                  color: "#6b7280",
                  lineHeight: 1.55,
                }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Right - form card */}
        <div style={{
          background: "#1e3a5fe0",
          border: "1px solid #2d5a8c",
          borderRadius: 12,
          padding: "32px",
          position: "relative",
        }}>
          {/* Card header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#ffffff",
              }}>⊞ Detailed Performance Analysis</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                onClick={() => { setAnalysisMode("single"); setErr(""); }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1px solid ${analysisMode === "single" ? "#ffffff" : "#475569"}`,
                  background: analysisMode === "single" ? "#ffffff" : "transparent",
                  color: analysisMode === "single" ? "#1e3a5f" : "#ffffff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                SINGLE VESSEL ANALYSIS
              </button>
              <button
                type="button"
                onClick={() => { setAnalysisMode("fleet"); setErr(""); }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1px solid ${analysisMode === "fleet" ? "#ffffff" : "#475569"}`,
                  background: analysisMode === "fleet" ? "#ffffff" : "transparent",
                  color: analysisMode === "fleet" ? "#1e3a5f" : "#ffffff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                FLEET ANALYSIS
              </button>
            </div>
          </div>

          <div style={{ height: 1, background: "#2d5a8c", margin: "16px 0 24px" }} />

          <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 10 }}>Enter IMO Number</div>
          <input
            type="text"
            maxLength={7}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (analysisMode === "fleet") {
                  addFleetImo();
                } else {
                  handleAnalyze();
                }
              }
            }}
            placeholder="e.g. 9483451"
            value={imo}
            onChange={(e) => { setImo(e.target.value); setErr(""); }}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: `1px solid ${err ? "#f87171" : "#cbd5e1"}`,
              background: "#ffffff",
              color: "#1f2937",
              fontSize: 14,
              marginBottom: err ? 8 : 20,
              outline: "none",
            }}
          />
          {err && <p style={{ margin: "0 0 16px", fontSize: 12, color: "#fca5a5" }}>{err}</p>}

          {analysisMode === "fleet" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={addFleetImo}
                  disabled={!isValidImo(imo) || loading}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: (!isValidImo(imo) || loading) ? "#4b7ba7" : "#3b82f6",
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
                    borderRadius: 6,
                    border: "1px solid #2d5a8c",
                    background: "transparent",
                    color: "#3b82f6",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="View added IMOs"
                >
                  👁
                </button>

                <span style={{ fontSize: 12, color: "#cbd5e1" }}>
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
              width: "100%",
              padding: "13px",
              background: loading ? "#4b7ba7" : "#1e3a8a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: (loading || (analysisMode === "fleet" && fleetImos.length === 0)) ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.25s",
              marginBottom: 20,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                }} /> Analyzing</>
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
                fontSize: 12,
                color: "#3b82f6",
                textDecoration: "underline",
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
              background: "rgba(0,0,0,0.5)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              padding: 16,
            }}>
              <div style={{
                width: "100%",
                maxWidth: 340,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                overflow: "hidden",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 14px",
                  borderBottom: "1px solid #e5e7eb",
                }}>
                  <span style={{ fontSize: 13, color: "#1f2937", fontWeight: 700 }}>Fleet IMO List</span>
                  <button
                    type="button"
                    onClick={() => setShowFleetModal(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#6b7280",
                      fontSize: 16,
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px 12px", color: "#9ca3af", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>#</th>
                        <th style={{ textAlign: "left", padding: "8px 12px", color: "#9ca3af", borderBottom: "1px solid #e5e7eb", fontWeight: 600 }}>IMO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetImos.length === 0 ? (
                        <tr>
                          <td colSpan={2} style={{ padding: "12px", color: "#9ca3af" }}>No IMOs added yet.</td>
                        </tr>
                      ) : (
                        fleetImos.map((fleetImo, idx) => (
                          <tr key={`${fleetImo}-${idx}`}>
                            <td style={{ padding: "8px 12px", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{idx + 1}</td>
                            <td style={{ padding: "8px 12px", color: "#1f2937", borderBottom: "1px solid #e5e7eb" }}>{fleetImo}</td>
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
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        padding: "14px 40px",
        borderTop: "1px solid #e5e7eb",
        fontSize: 12,
        color: "#6b7280",
        background: "#ffffff",
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
              color: "#6b7280",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#1f2937"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}
          >
            AZOLLA
          </a>
          <span>|</span>
        </div>
        <span>© 2026 Azolla, All Rights Reserved</span>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
