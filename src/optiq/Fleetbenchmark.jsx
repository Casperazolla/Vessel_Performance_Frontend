import { useMemo, useState } from "react";
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
  { cat: "B1", maxDwt: 30000 },
  { cat: "B2", maxDwt: 55000 },
  { cat: "B3", maxDwt: 80000 },
  { cat: "B4", maxDwt: 150000 },
  { cat: "B5", maxDwt: 400000 },
];

/* ============================================================
   Derived + helpers
   ============================================================ */

const CAT_ORDER = Object.keys(BENCHMARKS);                 // ["B1" ... "B5"]
const CAT_X = Object.fromEntries(CAT_ORDER.map((c, i) => [c, i + 1]));
const BENCH = CAT_ORDER.map((c) => ({ cat: c, x: CAT_X[c], benchmark: BENCHMARKS[c] }));

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

// Shared fleet operating point (min design draught/speed), carried on each result.
function fleetRef(ok) {
  const v = ok.find((x) => x?.fleet_reference || x?.data?.fleet_draught != null);
  const fr = v?.fleet_reference || {};
  const d = Number(fr.fleet_draught ?? v?.data?.fleet_draught);
  const s = Number(fr.fleet_speed ?? v?.data?.fleet_speed);
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

// tpd for one vessel at the fleet design draught + speed (falls back to
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
  const p = payload[0].payload;
  const box = {
    background: C.cardSolid, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "10px 12px", fontSize: 11, color: C.textSecondary,
  };

  if (p.imo) {
    return (
      <div style={box}>
        <div style={{ color: C.textPrimary, fontWeight: 700, marginBottom: 4 }}>IMO {p.imo}</div>
        <div>Category: <span style={{ color: C.accent }}>{p.cat}</span>{p.dwt ? ` · ${Math.round(p.dwt).toLocaleString()} DWT` : ""}</div>
        <div>Consumption: <span style={{ color: C.textPrimary }}>{p.tpd.toFixed(2)} tpd</span></div>
        <div>Benchmark: {p.benchmark.toFixed(2)} tpd</div>
        <div style={{ marginTop: 4, color: p.over ? C.critical : C.success, fontWeight: 700 }}>
          {p.over ? "+" : ""}{p.deltaPct}% vs benchmark
        </div>
      </div>
    );
  }
  return (
    <div style={box}>
      <div style={{ color: C.accent, fontWeight: 700, marginBottom: 4 }}>Category {p.cat}</div>
      <div>Benchmark: <span style={{ color: C.textPrimary }}>{p.benchmark.toFixed(2)} tpd</span></div>
    </div>
  );
}

/* ============================================================
   Component
   ============================================================ */

function FleetBenchmark({ ok = [], fuelByImo = {} }) {
  const [showBench, setShowBench] = useState(true);

  const { vessels, skipped, ref } = useMemo(() => {
    const ref = fleetRef(ok);
    const resolved = [];
    const missing = [];

    ok.forEach((v) => {
      const { dwt, catType } = getDwtInfo(v);
      const cat = resolveCategory(dwt, catType);
      const tpd = tpdAtDesign(fuelByImo[v.imo], ref);
      const benchmark = cat ? BENCHMARKS[cat] : null;

      if (cat == null || tpd == null || benchmark == null) {
        missing.push({ imo: v.imo, noCat: cat == null, noTpd: tpd == null });
        return;
      }
      resolved.push({ imo: v.imo, dwt, cat, tpd, benchmark });
    });

    // spread same-category vessels so their dots don't stack on one X
    const grouped = {};
    resolved.forEach((r) => { (grouped[r.cat] ||= []).push(r); });

    const vessels = [];
    Object.entries(grouped).forEach(([cat, arr]) => {
      const base = CAT_X[cat];
      const n = arr.length;
      arr.forEach((r, i) => {
        const spread = n > 1 ? (i - (n - 1) / 2) * 0.16 : 0;
        const deltaPct = r.benchmark > 0 ? Math.round(((r.tpd - r.benchmark) / r.benchmark) * 1000) / 10 : 0;
        vessels.push({ ...r, x: base + spread, over: r.tpd > r.benchmark, deltaPct });
      });
    });

    return { vessels, skipped: missing, ref };
  }, [ok, fuelByImo]);

  const over = vessels.filter((v) => v.over);
  const under = vessels.filter((v) => !v.over);

  const maxY = Math.max(0, ...BENCH.map((b) => b.benchmark), ...vessels.map((v) => v.tpd));
  const yMax = Math.ceil((maxY + 5) / 5) * 5 || 10;

  return (
    <div style={{ background: C.cardSolid, border: `1px solid ${C.borderCard}`, borderRadius: 14, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 700 }}>
            Fleet Consumption vs Category Benchmark
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
            tpd at fleet design point
            {ref.draught != null ? ` (${ref.draught} m` : " ("}
            {ref.speed != null ? ` · ${ref.speed} kn)` : ")"} · one point per vessel
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

          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart margin={{ top: 10, right: 20, bottom: 24, left: 6 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.10)" strokeDasharray="4 3" />
              <XAxis
                type="number" dataKey="x"
                domain={[0.5, CAT_ORDER.length + 0.5]}
                ticks={CAT_ORDER.map((_, i) => i + 1)}
                tickFormatter={(x) => CAT_ORDER[x - 1] || ""}
                tick={{ fontSize: 11, fill: C.textSecondary }}
                label={{ value: "DWT Category", position: "insideBottom", offset: -10, fontSize: 12, fill: C.textMuted }}
              />
              <YAxis
                type="number" domain={[0, yMax]}
                tick={{ fontSize: 10, fill: C.textMuted }} width={52}
                label={{ value: "Consumption (tpd)", angle: -90, position: "insideLeft", fontSize: 12, fill: C.textMuted, offset: 8 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />

              {showBench && (
                <Line
                  data={BENCH} dataKey="benchmark" stroke={C.accent}
                  strokeWidth={2} strokeDasharray="6 4"
                  dot={{ r: 4, fill: C.accent, stroke: C.cardSolid, strokeWidth: 2 }}
                  isAnimationActive={false} name="benchmark"
                />
              )}

              <Scatter data={under} dataKey="tpd" fill={C.success} />
              <Scatter data={over} dataKey="tpd" fill={C.critical} />
            </ComposedChart>
          </ResponsiveContainer>

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