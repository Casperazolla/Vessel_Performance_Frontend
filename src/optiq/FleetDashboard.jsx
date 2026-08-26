import { useEffect, useMemo, useState } from "react";
import { C, useMediaQuery, Logo } from "./shared";

function getFoulingConfig(idleDaysRaw) {
  const d = parseInt(idleDaysRaw, 10);

  if (Number.isNaN(d) || d <= 0) {
    return { valid: false, needsIntensity: false, options: [], grade: null, note: "Enter idle days first" };
  }
  if (d > 365) {
    return { valid: false, needsIntensity: false, options: [], grade: null, note: "Idle days must be <= 365" };
  }

  if (d <= 40) {
    return {
      valid: true,
      needsIntensity: true,
      grade: null,
      options: [{ label: "High", grade: 2 }, { label: "Low", grade: 1 }],
      note: "Select fouling intensity (High -> grade 2, Low -> grade 1)",
    };
  }

  if (d <= 49) {
    return { valid: true, needsIntensity: false, options: [], grade: 2, note: "Fouling grade auto-assigned: 2" };
  }
  if (d <= 88) {
    return { valid: true, needsIntensity: false, options: [], grade: 3, note: "Fouling grade auto-assigned: 3" };
  }

  if (d <= 120) {
    return {
      valid: true,
      needsIntensity: true,
      grade: null,
      options: [{ label: "High Calcareous", grade: 4 }, { label: "Low Calcareous", grade: 3 }],
      note: "Select fouling intensity (High Calcareous -> grade 4, Low Calcareous -> grade 3)",
    };
  }

  if (d <= 166) {
    return { valid: true, needsIntensity: false, options: [], grade: 5, note: "Fouling grade auto-assigned: 5" };
  }

  return { valid: true, needsIntensity: false, options: [], grade: 6, note: "Fouling grade auto-assigned: 6" };
}

function FleetDashboard({ fleet, results, onBack, onLogout }) {
  const isMobile = useMediaQuery(768);
  const list = Array.isArray(results) ? results : [];
  const ok = list.filter(r => r.status === "success");
  const failed = list.filter(r => r.status !== "success");

  const [customIdleDays, setCustomIdleDays] = useState("");
  const [intensity, setIntensity] = useState("");
  const [customGrade, setCustomGrade] = useState("");

  const [seaState, setSeaState] = useState("0");
  const [weatherState, setWeatherState] = useState("1");

  const [customFouledCurvesByImo, setCustomFouledCurvesByImo] = useState({});
  const [addedResistanceByImo, setAddedResistanceByImo] = useState({});
  const [marineDataByImo, setMarineDataByImo] = useState({});
  const [fuelByImo, setFuelByImo] = useState({});

  const [loadingMarine, setLoadingMarine] = useState(false);
  const [foulingLoading, setFoulingLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [fuelLoading, setFuelLoading] = useState(false);
  const [error, setError] = useState("");

  const foulingCfg = getFoulingConfig(customIdleDays);

  useEffect(() => {
    if (!foulingCfg.valid) {
      setCustomGrade("");
      return;
    }
    if (foulingCfg.needsIntensity) {
      const opt = foulingCfg.options.find((o) => o.label === intensity);
      setCustomGrade(opt ? String(opt.grade) : "");
    } else {
      setCustomGrade(String(foulingCfg.grade));
    }
  }, [customIdleDays, intensity]);

  useEffect(() => {
    const fetchMarineData = async () => {
      if (ok.length === 0) return;
      setLoadingMarine(true);
      try {
        const entries = await Promise.all(
          ok.map(async (item) => {
            const res = await fetch(`https://be.azolla.sg/v2/vessel/latest_marine_data/?imo_number=${item.imo}`);
            const data = await res.json();
            return [item.imo, data];
          })
        );
        setMarineDataByImo(Object.fromEntries(entries));
      } catch (e) {
        console.error(e);
        setError("Unable to fetch marine data for one or more vessels.");
      }
      setLoadingMarine(false);
    };

    fetchMarineData();
  }, [results]);

  const getCleanCurves = (imo) => {
    const vessel = ok.find((v) => v.imo === imo);
    return vessel?.data?.draught_curves || {};
  };

  const buildCurvesPayload = (imo) => {
    const cleanCurves = getCleanCurves(imo);
    const fouledSource = customFouledCurvesByImo[imo] || null;
    const addedSource = addedResistanceByImo[imo] || null;

    const payload = {};
    Object.keys(cleanCurves).forEach((key) => {
      const clean = cleanCurves[key];
      const len = Array.isArray(clean?.brake_power) ? clean.brake_power.length : 0;

      payload[key] = {
        draught: clean.draught,
        speed: clean.speed,
        brake_power: clean.brake_power,
        fouled_power: fouledSource?.[key]?.fouled_power || new Array(len).fill(0),
        added_power_kW: addedSource?.[key]?.added_power_kW || new Array(len).fill(0),
      };
    });

    return payload;
  };

  const fetchFuelForFleet = async () => {
    if (ok.length === 0) return;

    setFuelLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        ok.map(async (item) => {
          const response = await fetch("https://da.azolla.sg/vessel/fuel_consumption", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imo: item.imo,
              curves: buildCurvesPayload(item.imo),
            }),
          });

          const json = await response.json();
          if (json.status === "success") {
            return [item.imo, json.fuel_consumption_data || {}];
          }
          return [item.imo, {}];
        })
      );

      setFuelByImo(Object.fromEntries(entries));
    } catch (e) {
      console.error(e);
      setError("Unable to generate fleet fuel table.");
    }
    setFuelLoading(false);
  };

  useEffect(() => {
    fetchFuelForFleet();
  }, [results]);

  const applyCustomFouling = async () => {
    if (!customGrade || !customIdleDays) {
      setError("Idle days and fouling intensity/grade are required.");
      return;
    }

    setFoulingLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        ok.map(async (item) => {
          const res = await fetch(
            `https://da.azolla.sg/vessel/fouled_curves?imo=${item.imo}&idle_days=${customIdleDays}&fouling_grade=${customGrade}`
          );
          const json = await res.json();
          return [item.imo, json.status === "success" ? (json.fouled_curves || {}) : {}];
        })
      );

      setCustomFouledCurvesByImo(Object.fromEntries(entries));
      await fetchFuelForFleet();
    } catch (e) {
      console.error(e);
      setError("Unable to apply custom fouling for fleet.");
    }
    setFoulingLoading(false);
  };

  const applyCustomWeather = async () => {
    setWeatherLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        ok.map(async (item) => {
          const marine = marineDataByImo[item.imo];
          if (!marine?.lat || !marine?.lng) {
            return [item.imo, {}];
          }

          const res = await fetch(
            `https://da.azolla.sg/vessel/added_resistance?imo=${item.imo}&lat=${marine.lat}&lon=${marine.lng}&sea_state=${seaState}&weather_state=${weatherState}`
          );
          const json = await res.json();
          return [item.imo, json.status === "success" ? (json.added_power_data || {}) : {}];
        })
      );

      setAddedResistanceByImo(Object.fromEntries(entries));
      await fetchFuelForFleet();
    } catch (e) {
      console.error(e);
      setError("Unable to apply custom weather for fleet.");
    }
    setWeatherLoading(false);
  };

  const commonDraughtTables = useMemo(() => {
    const activeImos = ok.map((v) => v.imo).filter((imo) => {
      const data = fuelByImo[imo];
      return data && Object.keys(data).length > 0;
    });

    if (activeImos.length === 0) return [];

    const draughtSets = activeImos.map((imo) => {
      const values = Object.values(fuelByImo[imo] || {});
      return new Set(values.map((d) => Number(d?.draught).toFixed(2)));
    });

    const commonDraughts = [...draughtSets[0]].filter((d) => draughtSets.every((s) => s.has(d)));
    commonDraughts.sort((a, b) => Number(a) - Number(b));

    return commonDraughts.map((draughtKey) => {
      const speedSets = activeImos.map((imo) => {
        const rec = Object.values(fuelByImo[imo] || {}).find((v) => Number(v?.draught).toFixed(2) === draughtKey);
        return new Set((rec?.speed || []).map((s) => Number(s).toFixed(1)));
      });

      const commonSpeedKeys = [...speedSets[0]].filter((s) => speedSets.every((set) => set.has(s)));
      commonSpeedKeys.sort((a, b) => Number(a) - Number(b));

      const rows = activeImos.map((imo) => {
        const rec = Object.values(fuelByImo[imo] || {}).find((v) => Number(v?.draught).toFixed(2) === draughtKey);
        const speed = rec?.speed || [];
        const fuel = rec?.fuel_t_per_day || [];
        const valueMap = {};

        speed.forEach((s, i) => {
          valueMap[Number(s).toFixed(1)] = fuel[i];
        });

        const values = commonSpeedKeys.map((k) => valueMap[k]);
        return { imo, values };
      });

      return { draught: draughtKey, speeds: commonSpeedKeys, rows };
    });
  }, [fuelByImo, ok]);

  const summary = [
    { label: "FLEET SIZE", value: list.length, color: C.accent },
    { label: "ANALYZED", value: ok.length, color: C.success },
    { label: "FAILED", value: failed.length, color: failed.length ? C.critical : C.textMuted },
  ];

  const btn = {
    padding: "8px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.mainBg }}>
      {/* Top bar - no nav tabs, dashboard only */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "14px 16px" : "16px 28px",
        background: C.sidebarBg, borderBottom: `1px solid ${C.borderSubtle}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo small />
          <div style={{ borderLeft: `1px solid ${C.borderSubtle}`, paddingLeft: 12 }}>
            <div style={{ fontSize: 14, color: C.textPrimary, fontWeight: 600 }}>Fleet Analysis</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{Array.isArray(fleet) ? fleet.length : list.length} vessels</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} style={{ ...btn, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSubtle}`, color: C.textMuted }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            Back
          </button>
          <button onClick={onLogout} style={{ ...btn, background: "transparent", border: "1px solid rgba(248,113,113,0.35)", color: "#f87171" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 14 : 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0,1fr))", gap: 10 }}>
          {summary.map((item) => (
            <div key={item.label} style={{ border: `1px solid ${C.borderCard}`, borderRadius: 12, background: C.statBg, padding: "12px 14px" }}>
              <div style={{ color: C.textMuted, fontSize: 11 }}>{item.label}</div>
              <div style={{ color: item.color, fontSize: 18, fontWeight: 700, marginTop: 4 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: C.accent, marginBottom: 8, letterSpacing: "0.08em" }}>FOULING CURVE</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 2fr 1fr", gap: 12, alignItems: "center" }}>
            <input
              type="number"
              min="1"
              max="365"
              placeholder="Idle Days"
              value={customIdleDays}
              onChange={(e) => { setCustomIdleDays(e.target.value); setIntensity(""); }}
              style={{ padding: "10px", borderRadius: 8, background: C.inputBg, border: `1px solid ${C.border}`, color: C.textPrimary }}
            />
            {foulingCfg.needsIntensity ? (
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                style={{ padding: "10px", borderRadius: 8, background: C.inputBg, border: `1px solid ${C.border}`, color: C.textPrimary }}
              >
                <option value="">Fouling Intensity</option>
                {foulingCfg.options.map((o) => (
                  <option key={o.label} value={o.label}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                readOnly
                value={foulingCfg.valid ? `Auto - Grade ${foulingCfg.grade}` : ""}
                placeholder="Fouling Intensity"
                style={{ padding: "10px", borderRadius: 8, background: C.inputBg, border: `1px solid ${C.border}`, color: C.textMuted }}
              />
            )}
            <button
              onClick={applyCustomFouling}
              disabled={foulingLoading || !customGrade || !customIdleDays}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: (foulingLoading || !customGrade) ? "rgba(14,165,233,0.4)" : C.accent,
                color: "#fff",
                cursor: (foulingLoading || !customGrade) ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {foulingLoading ? "Applying..." : "Apply Fouling"}
            </button>
          </div>
          {foulingCfg.note && <div style={{ marginTop: 8, fontSize: 11, color: C.textMuted }}>{foulingCfg.note}</div>}
        </div>

        <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: C.accent, marginBottom: 8, letterSpacing: "0.08em" }}>ADDED POWER (CUSTOM)</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 2fr 1fr", gap: 12, alignItems: "center" }}>
            <select
              value={seaState}
              onChange={(e) => setSeaState(e.target.value)}
              style={{ padding: "10px", borderRadius: 8, background: C.inputBg, border: `1px solid ${C.border}`, color: C.textPrimary }}
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
            <select
              value={weatherState}
              onChange={(e) => setWeatherState(e.target.value)}
              style={{ padding: "10px", borderRadius: 8, background: C.inputBg, border: `1px solid ${C.border}`, color: C.textPrimary }}
            >
              <option value="1">1 - Calm</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6 - Stormy</option>
            </select>
            <button
              onClick={applyCustomWeather}
              disabled={weatherLoading || loadingMarine}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: (weatherLoading || loadingMarine) ? "rgba(14,165,233,0.4)" : C.accent,
                color: "#fff",
                cursor: (weatherLoading || loadingMarine) ? "not-allowed" : "pointer",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {weatherLoading ? "Applying..." : "Apply Weather"}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: C.textMuted }}>
            Custom weather uses vessel marine coordinates fetched per IMO.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 12, color: C.textSecondary }}>
            Fleet fuel tables are shown draught-wise with Speed on X-axis and IMO rows on Y-axis.
          </div>
          <button
            onClick={fetchFuelForFleet}
            disabled={fuelLoading}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: fuelLoading ? "rgba(14,165,233,0.4)" : "rgba(56,189,248,0.1)",
              color: C.accent,
              cursor: fuelLoading ? "not-allowed" : "pointer",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {fuelLoading ? "Refreshing..." : "Refresh Fuel Tables"}
          </button>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#f87171" }}>{error}</div>
        )}

        {commonDraughtTables.length === 0 ? (
          <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 14, padding: 16, color: C.textMuted, fontSize: 12 }}>
            No common draught and speed grid is available across all analyzed vessels yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {commonDraughtTables.map((table) => (
              <div key={table.draught} style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 700, marginBottom: 10 }}>
                  Draught {table.draught} m
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "8px 10px", color: C.accent, border: `1px solid ${C.borderSubtle}`, background: C.statBg }}>IMO / Speed</th>
                        {table.speeds.map((s) => (
                          <th key={s} style={{ textAlign: "center", padding: "8px 10px", color: C.accent, border: `1px solid ${C.borderSubtle}`, background: C.statBg }}>
                            {s}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row) => (
                        <tr key={row.imo}>
                          <td style={{ padding: "8px 10px", color: C.textPrimary, border: `1px solid ${C.borderSubtle}`, background: C.statBg, fontWeight: 600 }}>{row.imo}</td>
                          {row.values.map((v, idx) => (
                            <td key={`${row.imo}-${idx}`} style={{ padding: "8px 10px", textAlign: "center", color: C.textSecondary, border: `1px solid ${C.borderSubtle}` }}>
                              {typeof v === "number" ? v.toFixed(3) : "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FleetDashboard;
