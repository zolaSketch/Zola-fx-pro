import { AIRFIELDS, project, ringPath, type Airfield } from "../data/airfields";
import { copy, t, type Lang } from "../data/i18n";
import type { Atmosphere } from "../lib/atmosphere";
import type { Release } from "../lib/performance";
import { atmosphereAtHour } from "../lib/atmosphere";

export function LangSwitch({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div className="lang" role="group" aria-label="language">
      <button className={lang === "am" ? "on" : ""} onClick={() => setLang("am")} type="button">
        አማ
      </button>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")} type="button">
        EN
      </button>
    </div>
  );
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <a className="brand" href="#/" style={light ? { color: "#e6dfd0" } : undefined}>
      <img src="/favicon.png" alt="" />
      <b>ደጋ</b>
      <span>DEGA</span>
    </a>
  );
}

export function ReleaseBadge({ release, lang }: { release: Release; lang: Lang }) {
  const map = {
    GO: { cls: "go", label: copy.go },
    REDUCE: { cls: "reduce", label: copy.reduce },
    HOLD: { cls: "hold", label: copy.hold },
    "NO-GO": { cls: "nogo", label: copy.nogo },
  } as const;
  const m = map[release];
  return (
    <span className={`badge ${m.cls}`}>
      <i className="dot" />
      {t(m.label, lang)}
    </span>
  );
}

export function fmt(n: number, d = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
}

export function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="metric">
      <div className="l">{label}</div>
      <div className="n">
        {value}
        {unit ? <span style={{ fontSize: 12, marginLeft: 6, color: "var(--muted)" }}>{unit}</span> : null}
      </div>
    </div>
  );
}

const W = 640;
const H = 560;

export function EthiopiaMap({
  hour,
  selected,
  onPick,
}: {
  hour: number;
  selected: string;
  onPick: (icao: string) => void;
}) {
  const d = ringPath(W, H);
  return (
    <svg className="map-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ethiopia airfields">
      <path className="land" d={d} />
      {AIRFIELDS.map((f) => {
        const { x, y } = project(f.lon, f.lat, W, H);
        const atm = atmosphereAtHour(f.elevM, hour, f.climate);
        const hot = atm.densityAltFt > 9000;
        const fill = hot ? "#c45c3e" : f.elevM > 1800 ? "#c6a15b" : "#8fb4be";
        const on = f.icao === selected;
        return (
          <g key={f.icao} className="dotf" onClick={() => onPick(f.icao)}>
            <circle cx={x} cy={y} r={on ? 7 : 4.2} fill={fill} stroke="#0c0d0b" strokeWidth={on ? 2 : 1} />
            {on || f.kind === "hub" || f.kind === "joint" ? (
              <text className="lab" x={x + 8} y={y - 6}>
                {f.icao}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function DaReadout({
  field,
  atm,
  lang,
}: {
  field: Airfield;
  atm: Atmosphere;
  lang: Lang;
}) {
  return (
    <div className="live-card">
      <div className="k">
        {t(copy.liveBole, lang).replace("ቦሌ", field.cityAm).replace("Bole", field.city)} · {field.icao}
      </div>
      <div className="v">{fmt(atm.densityAltFt)} ft</div>
      <div className="s">
        {t(copy.da, lang)} · σ {atm.sigma.toFixed(3)} · {fmt(atm.oatC, 1)}°C · QNH {fmt(atm.qnhHpa, 0)}
      </div>
    </div>
  );
}
