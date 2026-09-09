import { useMemo, useRef, useState } from "react";
import {
  ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { C } from "./shared";

/* ============================================================
   KNOBS
   ============================================================ */

// Category benchmarks (your B1–B5 numbers, tpd at the fleet design point)
const BENCHMARKS = { B1: 13.663, B2: 24.266, B3: 29.95, B4: 32.813, B5: 56.203 };

// Fallback ONLY — used if DWT_CATAGORY_TYPE ("dwt") doesn't already resolve to
// a B1–B5 label. A vessel falls in the first band whose maxDwt it doesn't exceed.
// >>> replace with your real DWT thresholds if you need the fallback <<<
const CATEGORY_BANDS = [
  { cat: "B1", minDwt: 0, maxDwt: 30000 },
  { cat: "B2", minDwt: 30000, maxDwt: 55000 },
  { cat: "B3", minDwt: 55000, maxDwt: 80000 },
  { cat: "B4", minDwt: 80000, maxDwt: 150000 },
  { cat: "B5", minDwt: 150000, maxDwt: 400000 },
];

/* ============================================================
   Derived + helpers
   ============================================================ */

const CAT_ORDER = Object.keys(BENCHMARKS);                 // ["B1" ... "B5"]
const CAT_INDEX = Object.fromEntries(CAT_ORDER.map((c, i) => [c, i]));
const BAND_BY_CAT = Object.fromEntries(CATEGORY_BANDS.map((b) => [b.cat, b]));
const BENCH = CAT_ORDER.map((c, i) => ({
  cat: c,
  xStart: i,
  xEnd: i + 1,
  benchmark: BENCHMARKS[c],
}));

// Create step-wise benchmark data (start from Y-axis, then step)
const BUILD_STEP_BENCH = () => {
  const steps = [];

  BENCH.forEach((b, i) => {
    if (i === 0) {
      // B1 starts at x=0 and stays flat until the first boundary.
      steps.push({ x: b.xStart, benchmark: b.benchmark, cat: b.cat, isStep: true });
      steps.push({ x: b.xEnd, benchmark: b.benchmark, cat: b.cat, isStep: true });
      return;
    }

    const prev = BENCH[i - 1];
    // Vertical transition at category boundary, then horizontal in new band.
    steps.push({ x: b.xStart, benchmark: prev.benchmark, cat: prev.cat, isStep: true });
    steps.push({ x: b.xStart, benchmark: b.benchmark, cat: b.cat, isStep: true });
    steps.push({ x: b.xEnd, benchmark: b.benchmark, cat: b.cat, isStep: true });
  });
  return steps;
};

const BENCH_STEPS = BUILD_STEP_BENCH();

const first = (v) => (Array.isArray(v) ? v[0] : v);

// Pull deadweight + category-type out of the run response's draught_curves.
function getDwtInfo(vessel) {
  const curves = vessel?.data?.draught_curves || {};
  const c = Object.values(curves)[0];
  if (!c) return { dwt: null, catType: null };
  const dwt = Number(first(c.DWT));
  const catType = first(c.dwt);   // DWT_CATAGORY_TYPE
  return { dwt: Number.isFinite(dwt) ? dwt : null, catType: catType ?? null };
}

// Use the backend's category type directly if it's already B1–B5 or 1–5.
function normalizeCatType(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().toUpperCase();
  if (BENCHMARKS[s] != null) return s;                     // "B3" -> B3
  const n = Number(s);
  if (Number.isInteger(n) && n >= 1 && n <= CAT_ORDER.length) return CAT_ORDER[n - 1]; // 3 -> B3
  return null;
}

function resolveCategory(dwt, catType) {
  const fromType = normalizeCatType(catType);
  if (fromType) return fromType;
  if (dwt == null) return null;
  for (const b of CATEGORY_BANDS) if (dwt <= b.maxDwt) return b.cat;
  return CAT_ORDER[CAT_ORDER.length - 1];
}

function xWithinCategoryBand(cat, dwt) {
  const i = CAT_INDEX[cat];
  if (!Number.isInteger(i)) return null;

  const band = BAND_BY_CAT[cat];
  if (!band || !Number.isFinite(dwt)) return i + 0.5;

  const span = Number(band.maxDwt) - Number(band.minDwt);
  if (!Number.isFinite(span) || span <= 0) return i + 0.5;

  const rawRatio = (Number(dwt) - Number(band.minDwt)) / span;
  // Keep points visibly inside the band and avoid exact overlap on boundaries.
  const ratio = Math.max(0.02, Math.min(0.98, rawRatio));
  return i + ratio;
}

function spreadOverlappingPoints(points) {
  const byKey = {};
  points.forEach((p) => {
    const key = `${p.cat}|${Number(p.x).toFixed(4)}|${Number(p.tpd).toFixed(3)}`;
    (byKey[key] ||= []).push(p);
  });

  const out = [];
  Object.values(byKey).forEach((group) => {
    if (group.length === 1) {
      out.push(group[0]);
      return;
    }

    const sorted = [...group].sort((a, b) => String(a.imo).localeCompare(String(b.imo)));
    const step = 0.02;

    sorted.forEach((p, i) => {
      const bandStart = CAT_INDEX[p.cat];
      const bandEnd = bandStart + 1;
      const offset = (i - (sorted.length - 1) / 2) * step;
      const x = Math.max(bandStart + 0.01, Math.min(bandEnd - 0.01, p.x + offset));
      out.push({ ...p, x });
    });
  });

  return out;
}

// Resolve design operating point per vessel.
function vesselRef(vessel) {
  const fr = vessel?.fleet_reference || {};
  const d = Number(
    fr.fleet_draught ??
    fr.design_draught ??
    vessel?.data?.fleet_draught ??
    vessel?.data?.design_draught ??
    vessel?.data?.DESIGN_DRAUGHT
  );
  const s = Number(
    fr.fleet_speed ??
    fr.design_speed ??
    vessel?.data?.fleet_speed ??
    vessel?.data?.design_speed ??
    vessel?.data?.DESIGN_SPEED
  );
  return { draught: Number.isFinite(d) ? d : null, speed: Number.isFinite(s) ? s : null };
}

function nearestIndex(arr, target) {
  let best = 0, bestD = Infinity;
  arr.forEach((v, i) => {
    const d = Math.abs(Number(v) - target);
    if (d < bestD) { bestD = d; best = i; }
  });
  return best;
}

// tpd for one vessel at that vessel's design draught + speed (falls back to
// highest draught / highest speed if the reference point is missing).
function tpdAtDesign(fuelData, ref) {
  const recs = Object.values(fuelData || {}).filter(
    (r) => Array.isArray(r?.speed) && Array.isArray(r?.fuel_t_per_day) && r.speed.length
  );
  if (!recs.length) return null;

  let rec;
  if (ref.draught != null) {
    rec = recs.reduce((a, b) =>
      Math.abs(Number(b.draught) - ref.draught) < Math.abs(Number(a.draught) - ref.draught) ? b : a
    );
  } else {
    rec = recs.reduce((a, b) => (Number(b.draught) > Number(a.draught) ? b : a));
  }

  const targetSpeed = ref.speed != null ? ref.speed : Math.max(...rec.speed.map(Number));
  const v = rec.fuel_t_per_day[nearestIndex(rec.speed, targetSpeed)];
  return Number.isFinite(v) ? v : null;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  
  // Get the first payload entry
  let p = null;
  
  // Try to find vessel IMO entry
  const vesselEntry = payload.find((entry) => entry?.payload?.imo);
  if (vesselEntry) {
    p = vesselEntry.payload;
  }
  
  // If no vessel entry found, return null (don't show tooltip for benchmark or empty)
  if (!p || !p.imo) return null;
  
  const box = {
    background: "white",
    border: `1px solid #e5e7eb`,
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 11,
    color: "#1f2937",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  };

  return (
    <div style={box}>
      <div style={{ color: "#1f2937", fontWeight: 700, marginBottom: 6 }}>
        IMO {p.imo}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: "#6b7280" }}>Category: </span>
        <span style={{ color: "#3b82f6", fontWeight: 600 }}>{p.cat}</span>
        {p.dwt ? ` · ${Math.round(p.dwt).toLocaleString()} DWT` : ""}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: "#6b7280" }}>Consumption: </span>
        <span style={{ fontWeight: 600 }}>{p.tpd?.toFixed(2) || "N/A"} tpd</span>
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ color: "#6b7280" }}>Benchmark: </span>
        <span style={{ fontWeight: 600 }}>{p.benchmark?.toFixed(2) || "N/A"} tpd</span>
      </div>
      <div style={{
        color: p.over ? "#dc2626" : "#059669",
        fontWeight: 700,
        fontSize: 10,
      }}>
        {p.over ? "+" : ""}{p.deltaPct || 0}% vs benchmark
      </div>
    </div>
  );
}

/* ============================================================
   Component
   ============================================================ */

function FleetBenchmark({ ok = [], fuelByImo = {} }) {
  const [showBench, setShowBench] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hover, setHover] = useState(null); // { point, cx, cy }
  const lastPointClickAtRef = useRef(0);

  const { vessels, skipped } = useMemo(() => {
    const resolved = [];
    const missing = [];

    ok.forEach((v) => {
      const { dwt, catType } = getDwtInfo(v);
      const cat = resolveCategory(dwt, catType);
      const tpd = tpdAtDesign(fuelByImo[v.imo], vesselRef(v));
      const benchmark = cat ? BENCHMARKS[cat] : null;

      if (cat == null || tpd == null || benchmark == null) {
        missing.push({ imo: v.imo, noCat: cat == null, noTpd: tpd == null });
        return;
      }
      resolved.push({ imo: v.imo, dwt, cat, tpd, benchmark });
    });

    const baseVessels = resolved.map((r) => {
      const deltaPct = r.benchmark > 0 ? Math.round(((r.tpd - r.benchmark) / r.benchmark) * 1000) / 10 : 0;
      return {
        ...r,
        x: xWithinCategoryBand(r.cat, r.dwt),
        over: r.tpd > r.benchmark,
        deltaPct,
      };
    });

    const vessels = spreadOverlappingPoints(baseVessels);

    return { vessels, skipped: missing };
  }, [ok, fuelByImo]);

  const over = vessels.filter((v) => v.over);
  const under = vessels.filter((v) => !v.over);

  const handleVesselPointClick = (point) => {
    const p = point?.payload?.imo ? point.payload : point?.imo ? point : null;
    if (!p) return;
    lastPointClickAtRef.current = Date.now();
    setSelectedPoint(p);
  };

  const VesselDot = (props) => {
    const { cx, cy, payload, color } = props;
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
    const active = hover?.point?.imo === payload?.imo;
    return (
      <g>
        {/* transparent, slightly larger hit area for easier hovering */}
        <circle
          cx={cx} cy={cy} r={11}
          fill="transparent"
          style={{ cursor: "pointer" }}
          onMouseEnter={() => setHover({ point: payload, cx, cy })}
          onMouseLeave={() => setHover(null)}
          onClick={() => handleVesselPointClick(payload)}
        />
        <circle
          cx={cx} cy={cy} r={active ? 6.5 : 5}
          fill={color}
          stroke="#fff" strokeWidth={1.5}
          pointerEvents="none"
        />
      </g>
    );
  };

  const handleChartClick = (state) => {
    if (Date.now() - lastPointClickAtRef.current < 180) return;

    const clicked = (state?.activePayload || [])
      .map((entry) => entry?.payload)
      .find((p) => p?.imo);
    if (clicked) {
      setSelectedPoint(clicked);
      return;
    }
    if (!state?.activePayload?.length) {
      setSelectedPoint(null);
    }
  };

  const maxY = Math.max(0, ...BENCH.map((b) => b.benchmark), ...vessels.map((v) => v.tpd));
  const yMax = Math.ceil((maxY + 5) / 5) * 5 || 10;

  return (
    <div style={{ background: "white", border: `1px solid ${C.borderCard}`, borderRadius: 14, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: "black", fontWeight: 700 }}>
            Fleet Consumption vs Category Benchmark
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
            Fleet consumption benchmark comparison · one point per vessel
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => setShowBench((s) => !s)}>
          <div style={{ width: 32, height: 18, borderRadius: 9, position: "relative", background: showBench ? C.accent : "rgba(255,255,255,0.12)", transition: "background .2s" }}>
            <div style={{ position: "absolute", top: 2, left: showBench ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
          </div>
          <span style={{ fontSize: 11, color: C.textSecondary }}>Benchmark line</span>
        </div>
      </div>

      {vessels.length === 0 ? (
        <div style={{ padding: "28px 12px", textAlign: "center", color: C.textMuted, fontSize: 12, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
          Nothing to plot yet — waiting on fuel data and a resolvable category per vessel.
          {skipped.some((s) => s.noCat) && (
            <div style={{ marginTop: 8, color: C.warning }}>
              Some vessels have no category — confirm draught_curves now carry DWT / DWT_CATAGORY_TYPE (redeploy backend), or set the DWT bands in FleetBenchmark.jsx.
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Legend */}
          <div style={{ display: "flex", gap: 18, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textSecondary }}>
              <span style={{ width: 20, height: 2, background: C.accent, display: "inline-block", borderRadius: 2 }} /> Category benchmark
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textSecondary }}>
              <span style={{ width: 10, height: 10, background: C.success, display: "inline-block", borderRadius: "50%" }} /> At / below benchmark
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textSecondary }}>
              <span style={{ width: 10, height: 10, background: C.critical, display: "inline-block", borderRadius: "50%" }} /> Above benchmark
            </span>
          </div>

          <div style={{ marginBottom: 8, fontSize: 11, color: C.textMuted }}>
            Click a red or green vessel dot to pin its tooltip. Hover still works for quick view.
          </div>

          {selectedPoint && (
            <div style={{ marginBottom: 10, display: "inline-block" }}>
              <CustomTooltip active payload={[{ payload: selectedPoint }]} />
            </div>
          )}

          <div style={{ position: "relative", width: "100%" }}>
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart margin={{ top: 10, right: 20, bottom: 24, left: 6 }} onClick={handleChartClick}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 3" vertical={false} />
                <XAxis
                  type="number" dataKey="x"
                  domain={[0, CAT_ORDER.length]}
                  ticks={CAT_ORDER.map((_, i) => i + 0.5)}
                  tickFormatter={(x) => CAT_ORDER[Math.floor(x)] || ""}
                  tick={{ fontSize: 11, fill: C.textSecondary }}
                  label={{ value: "DWT Category Bands", position: "insideBottom", offset: -10, fontSize: 12, fill: C.textMuted }}
                />
                <YAxis
                  type="number" domain={[0, yMax]}
                  tick={{ fontSize: 10, fill: C.textMuted }} width={52}
                  label={{ value: "Consumption (tpd)", angle: -90, position: "insideLeft", fontSize: 12, fill: C.textMuted, offset: 8 }}
                />
          
                {/* recharts <Tooltip> removed on purpose — hover is driven by VesselDot */}
          
                {showBench && (
                  <Line
                    data={BENCH_STEPS} dataKey="benchmark" stroke={C.accent}
                    strokeWidth={2} strokeDasharray="6 4"
                    dot={false} isAnimationActive={false} name="benchmark"
                  />
                )}
          
                <Scatter
                  data={under} dataKey="tpd"
                  shape={<VesselDot color={C.success} />}
                  isAnimationActive={false} name="Vessels"
                />
                <Scatter
                  data={over} dataKey="tpd"
                  shape={<VesselDot color={C.critical} />}
                  isAnimationActive={false} name="Vessels"
                />
              </ComposedChart>
            </ResponsiveContainer>
          
            {hover && (
              <div
                style={{
                  position: "absolute",
                  left: hover.cx,
                  top: hover.cy,
                  transform: hover.cy < 130
                    ? "translate(-50%, 14px)"           // flip below when near the top
                    : "translate(-50%, calc(-100% - 12px))",
                  pointerEvents: "none",
                  zIndex: 20,
                }}
              >
                <CustomTooltip active payload={[{ payload: hover.point }]} />
              </div>
            )}
          </div>

          {skipped.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: C.warning }}>
              {skipped.length} vessel(s) not plotted (missing category or fuel data):{" "}
              {skipped.map((s) => s.imo).join(", ")}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FleetBenchmark;
