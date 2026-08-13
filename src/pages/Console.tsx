import { useMemo, useState } from "react";
import { AIRFIELDS } from "../data/airfields";
import { AIRCRAFT, FLEET } from "../data/aircraft";
import { copy, t } from "../data/i18n";
import { atmosphereAtHour } from "../lib/atmosphere";
import {
  classifyWindow,
  evaluatePerformance,
  MISSIONS,
  type Release,
  type WindowPoint,
} from "../lib/performance";
import { formatEatLong, hourLabel } from "../lib/time";
import { go, useHash, useStore, type Seller } from "../state";
import {
  Brand,
  EthiopiaMap,
  LangSwitch,
  Metric,
  ReleaseBadge,
  fmt,
} from "../ui/bits";

const PLANS = [
  { id: "abbo", name: "Abbo", nameAm: "አቦ", usd: 0, etb: 0, unit: "mo" as const },
  { id: "operator", name: "Operator", nameAm: "ኦፕሬተር", usd: 390, etb: 22000, unit: "mo" as const },
  { id: "airline", name: "Airline", nameAm: "አየር መንገድ", usd: 2800, etb: 160000, unit: "mo" as const },
  { id: "sovereign", name: "Sovereign", nameAm: "ሉዓላዊ", usd: 186000, etb: 10600000, unit: "yr" as const },
];

export function Console() {
  const hash = useHash();
  const view = hash.replace("#/app", "").replace(/^\//, "") || "atlas";
  const s = useStore();
  const { lang, setLang } = s;

  return (
    <div className={`console ${lang === "am" ? "am" : ""}`}>
      <header className="top">
        <Brand light />
        <div className="clock">{formatEatLong()} · EAT</div>
        <div className="top-right">
          <button className="linkish" type="button" onClick={() => go("/")}>
            {t(copy.console.back, lang)}
          </button>
          <LangSwitch lang={lang} setLang={setLang} />
        </div>
      </header>
      <div className="body">
        <nav className="rail">
          {(
            [
              ["atlas", copy.console.atlas],
              ["thin", copy.console.thin],
              ["window", copy.console.window],
              ["fleet", copy.console.fleet],
              ["sell", copy.console.sell],
              ["sovereign", copy.console.sovereign],
            ] as const
          ).map(([id, label]) => (
            <a key={id} className={view === id ? "on" : ""} href={`#/app/${id}`}>
              {t(label, lang)}
            </a>
          ))}
        </nav>
        <main className={`stage ${lang === "am" ? "am" : ""}`}>
          {view === "thin" ? <Thin /> : null}
          {view === "window" ? <WindowView /> : null}
          {view === "fleet" ? <FleetView /> : null}
          {view === "sell" ? <SellView /> : null}
          {view === "sovereign" ? <SovereignView /> : null}
          {view === "atlas" || !["thin", "window", "fleet", "sell", "sovereign"].includes(view) ? (
            <Atlas />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Atlas() {
  const { lang, hour, setHour, live, setLive, field, setFieldId, atm } = useStore();
  return (
    <>
      <div className="kicker">{t(copy.nav.atlas, lang)}</div>
      <h1>{lang === "am" ? "የኢትዮጵያ ቀጭን አየር" : "Ethiopia, in thin air"}</h1>
      <p className="sub">
        {lang === "am"
          ? "እያንዳንዱ ነጥብ በዚህ ሰዓት የአዲስ አበባ ሰዓት የአየር ጥግግት ይዞ ይቆማል። ወርቃማ ደጋ ነው። መዳብ ዛሬ ቀጭን ነው።"
          : "Every point stands in this hour of Addis time. Gold is highland. Copper is thin today."}
      </p>
      <div className="grid-2">
        <div className="panel">
          <EthiopiaMap hour={hour} selected={field.icao} onPick={setFieldId} />
        </div>
        <div>
          <div className="panel">
            <h3>{lang === "am" ? field.nameAm : field.name}</h3>
            <div className="metrics">
              <Metric label="ICAO" value={field.icao} />
              <Metric label={t(copy.elev, lang)} value={fmt(field.elevM)} unit="m" />
              <Metric label={t(copy.da, lang)} value={fmt(atm.densityAltFt)} unit="ft" />
              <Metric label={t(copy.sigma, lang)} value={atm.sigma.toFixed(3)} />
              <Metric label={t(copy.oat, lang)} value={fmt(atm.oatC, 1)} unit="°C" />
              <Metric label="QNH" value={fmt(atm.qnhHpa, 0)} unit="hPa" />
              <Metric label={t(copy.rwy, lang)} value={`${field.rwyId} · ${fmt(field.rwyM)}`} unit="m" />
              <Metric
                label={lang === "am" ? "የ120-ህግ ስህተት" : "120-rule error"}
                value={`${atm.ruleErrorFt >= 0 ? "+" : ""}${fmt(atm.ruleErrorFt)}`}
                unit="ft"
              />
            </div>
            <label className="f" style={{ marginTop: 14 }}>
              {lang === "am" ? "ሰዓት (EAT)" : "Hour (EAT)"} · {hourLabel(hour)}
              <input
                type="range"
                min={0}
                max={23.5}
                step={0.5}
                value={hour}
                onChange={(e) => {
                  setLive(false);
                  setHour(Number(e.target.value));
                }}
              />
            </label>
            <button className="btn slim ghost" type="button" onClick={() => setLive(!live)}>
              {live
                ? lang === "am"
                  ? "ቀጥታ · ንቁ"
                  : "Live · on"
                : lang === "am"
                  ? "ቀጥታ አብራ"
                  : "Resume live"}
            </button>
          </div>
          <p className="tiny" style={{ marginTop: 12 }}>
            {lang === "am"
              ? `${field.cityAm} · ${field.region} · የአየር ሜዳ ከፍታ ${fmt(field.elevM * 3.28084)} እግር`
              : `${field.city} · ${field.region} · field elevation ${fmt(field.elevM * 3.28084)} ft`}
          </p>
        </div>
      </div>
    </>
  );
}

function CraftControls() {
  const s = useStore();
  const ac = AIRCRAFT.find((a) => a.id === s.aircraftId)!;
  return (
    <div className="panel">
      <h3>{s.lang === "am" ? "አውሮፕላን እና ተልእኮ" : "Airframe and mission"}</h3>
      <label className="f">
        {s.lang === "am" ? "ሜዳ" : "Field"}
        <select value={s.field.icao} onChange={(e) => s.setFieldId(e.target.value)}>
          {AIRFIELDS.map((f) => (
            <option key={f.icao} value={f.icao}>
              {f.icao} · {s.lang === "am" ? f.nameAm : f.name} · {f.elevM}m
            </option>
          ))}
        </select>
      </label>
      <label className="f">
        {s.lang === "am" ? "አውሮፕላን" : "Aircraft"}
        <select value={s.aircraftId} onChange={(e) => s.setAircraftId(e.target.value)}>
          {AIRCRAFT.map((a) => (
            <option key={a.id} value={a.id}>
              {s.lang === "am" ? a.nameAm : a.name}
            </option>
          ))}
        </select>
      </label>
      <label className="f">
        {s.lang === "am" ? "ተልእኮ" : "Mission"}
        <select value={s.missionId} onChange={(e) => s.setMissionId(e.target.value)}>
          {MISSIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {s.lang === "am" ? m.labelAm : m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="f">
        {s.lang === "am" ? `ጭነት ${fmt(s.payloadKg)} ኪ.ግ` : `Payload ${fmt(s.payloadKg)} kg`}
        <input
          type="range"
          min={0}
          max={ac.maxPayloadKg}
          value={s.payloadKg}
          onChange={(e) => s.setPayloadKg(Number(e.target.value))}
        />
      </label>
      <label className="f">
        {s.lang === "am" ? `ነዳጅ ${fmt(s.fuelKg)} ኪ.ግ` : `Fuel ${fmt(s.fuelKg)} kg`}
        <input
          type="range"
          min={0}
          max={ac.maxFuelKg}
          value={s.fuelKg}
          onChange={(e) => s.setFuelKg(Number(e.target.value))}
        />
      </label>
      <label className="f">
        {s.lang === "am" ? `የፊት ነፋስ ${s.headwind} kt` : `Headwind ${s.headwind} kt`}
        <input
          type="range"
          min={-8}
          max={20}
          value={s.headwind}
          onChange={(e) => s.setHeadwind(Number(e.target.value))}
        />
      </label>
      <p className="tiny">
        {s.lang === "am" ? ac.roleAm : ac.role} · {s.lang === "am" ? ac.classLabelAm : ac.classLabel}
      </p>
    </div>
  );
}

function Thin() {
  const s = useStore();
  const { lang, field, atm, perf, hour } = s;
  const used = Math.min(140, perf.runwayUsedPct);
  return (
    <>
      <div className="kicker">{t(copy.console.thin, lang)}</div>
      <h1>{lang === "am" ? "የቀጭን አየር ሞተር" : "The thin-air engine"}</h1>
      <p className="sub">
        {lang === "am"
          ? "እርጥብ-አየር ጥግግት፣ ከዚያ መነሻ፣ ውጣት፣ እና ሂድ/ቀንስ/ጠብቅ። የእቅድ ቁጥር እንጂ የተረጋገጠ AFM አይደለም።"
          : "Moist-air density, then takeoff, climb, and a go / reduce / hold. A planning number — not a certified AFM."}
      </p>
      <div className="grid-2">
        <CraftControls />
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <h3>
              {field.icao} · {hourLabel(hour)}
            </h3>
            <ReleaseBadge release={perf.release} lang={lang} />
          </div>
          <div className="metrics">
            <Metric label={t(copy.da, lang)} value={fmt(atm.densityAltFt)} unit="ft" />
            <Metric label="σ" value={atm.sigma.toFixed(3)} />
            <Metric label={lang === "am" ? "መነሻ" : "Takeoff"} value={fmt(perf.takeoffM)} unit="m" />
            <Metric label={lang === "am" ? "ውጣት" : "Climb"} value={fmt(perf.climbFpm)} unit="fpm" />
            <Metric label={lang === "am" ? "ክብደት" : "Weight"} value={fmt(perf.weightKg)} unit="kg" />
            <Metric
              label={lang === "am" ? "የጭነት ጣሪያ" : "Payload cap"}
              value={fmt(perf.payloadCapKg)}
              unit="kg"
            />
            <Metric label={lang === "am" ? "ዑደት ዕዳ" : "Cycle debt"} value={perf.cycleDebt.toFixed(2)} unit="×" />
            <Metric label={lang === "am" ? "ብሬክ ኃይል" : "Brake energy"} value={perf.brakeEnergy.toFixed(2)} unit="×" />
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="tiny">
              {lang === "am" ? "ማኮብኮቢያ አጠቃቀም" : "Runway used"} · {fmt(perf.runwayUsedPct, 0)}%
            </div>
            <div className={`bar ${used > 80 ? "warn" : ""}`}>
              <i style={{ width: `${used}%` }} />
            </div>
          </div>
          <ul className="reasons">
            {(lang === "am" ? perf.reasonsAm : perf.reasons).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="tiny" style={{ marginTop: 14 }}>
            {lang === "am"
              ? `የመማሪያ 120-ህግ ${fmt(atm.ruleOfThumbFt)} ft። ደጋ ${fmt(atm.densityAltFt)} ft። ስህተት ${fmt(atm.ruleErrorFt)} ft።`
              : `Textbook 120-rule ${fmt(atm.ruleOfThumbFt)} ft. Dega ${fmt(atm.densityAltFt)} ft. Error ${fmt(atm.ruleErrorFt)} ft.`}
          </p>
        </div>
      </div>
    </>
  );
}

function buildWindow(
  fieldIcao: string,
  aircraftId: string,
  missionId: string,
  payloadKg: number,
  fuelKg: number,
  headwind: number,
): WindowPoint[] {
  const field = AIRFIELDS.find((f) => f.icao === fieldIcao)!;
  const ac = AIRCRAFT.find((a) => a.id === aircraftId)!;
  const mission = MISSIONS.find((m) => m.id === missionId)!;
  const pts: WindowPoint[] = [];
  for (let h = 5; h <= 18.5; h += 0.5) {
    const atm = atmosphereAtHour(field.elevM, h, field.climate);
    const perf = evaluatePerformance(ac, atm, field.rwyM, payloadKg, fuelKg, mission, headwind);
    pts.push({
      hour: h,
      oatC: atm.oatC,
      daFt: atm.densityAltFt,
      sigma: atm.sigma,
      takeoffM: perf.takeoffM,
      climbFpm: perf.climbFpm,
      payloadCapKg: perf.payloadCapKg,
      release: perf.release,
    });
  }
  return pts;
}

function WindowView() {
  const s = useStore();
  const pts = useMemo(
    () => buildWindow(s.field.icao, s.aircraftId, s.missionId, s.payloadKg, s.fuelKg, s.headwind),
    [s.field.icao, s.aircraftId, s.missionId, s.payloadKg, s.fuelKg, s.headwind],
  );
  const cls = classifyWindow(pts);
  const nearest = pts.reduce((a, b) => (Math.abs(b.hour - s.hour) < Math.abs(a.hour - s.hour) ? b : a), pts[0]);

  return (
    <>
      <div className="kicker">{t(copy.console.window, s.lang)}</div>
      <h1>{s.lang === "am" ? "የቀን መስኮት" : "Today’s release window"}</h1>
      <p className="sub">
        {s.lang === "am"
          ? "ከ05:00 እስከ 18:30 የአዲስ አበባ ሰዓት። አረንጓዴ ሂድ ነው። ወርቃማ ቀንስ። መዳብ አትሂድ።"
          : "05:00 to 18:30 Addis time. Green is go. Gold is reduce. Copper is no-go."}
      </p>
      <div className="grid-2">
        <CraftControls />
        <div className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>{s.field.icao}</h3>
            <ReleaseBadge release={nearest.release} lang={s.lang} />
          </div>
          <div className="window" aria-hidden>
            {pts.map((p) => (
              <button
                key={p.hour}
                type="button"
                title={`${hourLabel(p.hour)} ${p.release} · ${fmt(p.daFt)} ft`}
                className={`wh ${clsName(p.release)} ${Math.abs(p.hour - s.hour) < 0.26 ? "on" : ""}`}
                onClick={() => {
                  s.setLive(false);
                  s.setHour(p.hour);
                }}
              />
            ))}
          </div>
          <div className="window-labs">
            {pts.map((p) =>
              p.hour % 3 === 0 ? (
                <span key={p.hour}>{hourLabel(p.hour)}</span>
              ) : (
                <span key={p.hour} />
              ),
            )}
          </div>
          <div className="metrics" style={{ marginTop: 16 }}>
            <Metric
              label={s.lang === "am" ? "የመጀመሪያ ሂድ" : "First go"}
              value={cls.firstGo === null ? "—" : hourLabel(cls.firstGo)}
            />
            <Metric
              label={s.lang === "am" ? "የመጨረሻ ሂድ" : "Last go"}
              value={cls.lastGo === null ? "—" : hourLabel(cls.lastGo)}
            />
            <Metric
              label={s.lang === "am" ? "ምርጥ ሰዓት" : "Best hour"}
              value={cls.bestHour === null ? "—" : hourLabel(cls.bestHour)}
            />
            <Metric
              label={s.lang === "am" ? "ከፍተኛ ጭነት" : "Best payload"}
              value={fmt(cls.bestPayload)}
              unit="kg"
            />
          </div>
          <p className="tiny" style={{ marginTop: 12 }}>
            {s.lang === "am"
              ? `ዛሬ ${cls.goHours} ሰዓት ሙሉ ሂድ። በ${hourLabel(nearest.hour)} DA ${fmt(nearest.daFt)} ft · መነሻ ${fmt(nearest.takeoffM)} ሜትር።`
              : `${cls.goHours} hours of clean go today. At ${hourLabel(nearest.hour)} DA ${fmt(nearest.daFt)} ft · takeoff ${fmt(nearest.takeoffM)} m.`}
          </p>
        </div>
      </div>
    </>
  );
}

function clsName(r: Release) {
  if (r === "GO") return "go";
  if (r === "REDUCE") return "reduce";
  if (r === "HOLD") return "hold";
  return "nogo";
}

function FleetView() {
  const { lang } = useStore();
  const rows = FLEET.map((fr) => {
    const model = AIRCRAFT.find((a) => a.id === fr.modelId)!;
    return { fr, model };
  });
  const ready = rows.filter((r) => r.fr.status === "ready").length;
  return (
    <>
      <div className="kicker">{t(copy.console.fleet, lang)}</div>
      <h1>{lang === "am" ? "መርከብ እና የደጋ ዕዳ" : "Fleet and highland debt"}</h1>
      <p className="sub">
        {lang === "am"
          ? "እያንዳንዱ ከፍተኛ-DA መነሻ ከባህር ጠለል ዑደት የበለጠ ያስከፍላል። ይህ ነው አየር መንገድ የሚከፍለው — ትክክለኛ የጥገና እውነት።"
          : "Each high-DA takeoff costs more than a sea-level cycle. This is what an airline pays for — a true maintenance picture."}
      </p>
      <div className="grid-3">
        <div className="panel">
          <Metric label={lang === "am" ? "ዝግጁ" : "Ready"} value={`${ready}/${rows.length}`} />
        </div>
        <div className="panel">
          <Metric
            label={lang === "am" ? "አማካይ ዕዳ" : "Mean debt"}
            value={(rows.reduce((a, r) => a + r.fr.highlandDebt, 0) / rows.length).toFixed(2)}
            unit="×"
          />
        </div>
        <div className="panel">
          <Metric
            label={lang === "am" ? "ከ30 ቀን በላይ MX" : "MX older than 30d"}
            value={String(rows.filter((r) => r.fr.lastMxDays > 30).length)}
          />
        </div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>{lang === "am" ? "ጅራት" : "Tail"}</th>
              <th>{lang === "am" ? "መደብ" : "Type"}</th>
              <th>{lang === "am" ? "ኦፕሬተር" : "Operator"}</th>
              <th>FH</th>
              <th>{lang === "am" ? "ዕዳ" : "Debt"}</th>
              <th>MX</th>
              <th>{lang === "am" ? "ሁኔታ" : "State"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ fr, model }) => (
              <tr key={fr.tail}>
                <td className="mono">{fr.tail}</td>
                <td>{lang === "am" ? model.nameAm : model.name}</td>
                <td>{lang === "am" ? fr.operatorAm : fr.operator}</td>
                <td className="mono">{fmt(fr.hours)}</td>
                <td className="mono">{fr.highlandDebt.toFixed(2)}×</td>
                <td className="mono">{fr.lastMxDays}d</td>
                <td className={`st-${fr.status}`}>
                  {fr.status === "ready"
                    ? lang === "am"
                      ? "ዝግጁ"
                      : "ready"
                    : fr.status === "watch"
                      ? lang === "am"
                        ? "ክትትል"
                        : "watch"
                      : lang === "am"
                        ? "ቆይታ"
                        : "hold"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SellView() {
  const { lang, seller, setSeller } = useStore();
  const [planId, setPlanId] = useState("airline");
  const [buyer, setBuyer] = useState("Ethiopian Airlines");
  const [buyerAm, setBuyerAm] = useState("ኢትዮጵያ አየር መንገድ");
  const [years, setYears] = useState(1);
  const [founding, setFounding] = useState(true);
  const [currency, setCurrency] = useState<"USD" | "ETB">("USD");
  const plan = PLANS.find((p) => p.id === planId)!;
  const discount = founding && plan.id !== "abbo" ? 0.6 : 1;
  const units = plan.unit === "mo" ? years * 12 : years;
  const gross = (currency === "USD" ? plan.usd : plan.etb) * units;
  const net = Math.round(gross * discount);
  const invoice = `DEGA-${new Date().getFullYear()}-${plan.id.toUpperCase()}-${String(years)}Y`;

  const setS = (k: keyof Seller, v: string) => setSeller({ ...seller, [k]: v });

  return (
    <>
      <div className="kicker">{t(copy.console.sell, lang)}</div>
      <h1>{lang === "am" ? "የሽያጭ ክፍል" : "The selling room"}</h1>
      <p className="sub">
        {lang === "am"
          ? "ስምህን፣ ቲንህን፣ ባንክህን ጻፍ። ኮንትራቱን አትም። ዛሬ ለአየር መንገድ ወይም ለሚኒስቴር አሳይ።"
          : "Put your name, TIN and bank on the page. Print the contract. Show it to an airline or a ministry today."}
      </p>
      <div className="grid-2">
        <div className="panel no-print">
          <h3>{lang === "am" ? "ሻጭ" : "Seller"}</h3>
          {(
            [
              ["company", lang === "am" ? "ኩባንያ (EN)" : "Company"],
              ["companyAm", lang === "am" ? "ኩባንያ (አማ)" : "Company (Amharic)"],
              ["person", lang === "am" ? "ስም" : "Person"],
              ["tin", "TIN"],
              ["bank", lang === "am" ? "ባንክ" : "Bank"],
              ["account", lang === "am" ? "ሂሳብ" : "Account"],
              ["email", "Email"],
              ["phone", lang === "am" ? "ስልክ" : "Phone"],
              ["city", lang === "am" ? "ከተማ" : "City"],
            ] as const
          ).map(([k, lab]) => (
            <label className="f" key={k}>
              {lab}
              <input value={seller[k]} onChange={(e) => setS(k, e.target.value)} />
            </label>
          ))}
          <label className="f">
            {lang === "am" ? "ገዢ" : "Buyer"}
            <input
              value={lang === "am" ? buyerAm : buyer}
              onChange={(e) => (lang === "am" ? setBuyerAm(e.target.value) : setBuyer(e.target.value))}
            />
          </label>
          <label className="f">
            {lang === "am" ? "ዕቅድ" : "Plan"}
            <select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {lang === "am" ? p.nameAm : p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="f">
            {lang === "am" ? `ዘመን ${years}` : `Term ${years}y`}
            <input type="range" min={1} max={5} value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </label>
          <label className="f">
            {lang === "am" ? "ምንዛሬ" : "Currency"}
            <select value={currency} onChange={(e) => setCurrency(e.target.value as "USD" | "ETB")}>
              <option value="USD">USD</option>
              <option value="ETB">ETB</option>
            </select>
          </label>
          <label className="f" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <input type="checkbox" checked={founding} onChange={(e) => setFounding(e.target.checked)} />
            {lang === "am" ? "የመጀመሪያ 5 ቀያሪ — 40% ቅናሽ" : "First-five founding — 40% off"}
          </label>
          <div className="row-btns">
            <button className="btn gold" type="button" onClick={() => window.print()}>
              {lang === "am" ? "አትም / PDF" : "Print / PDF"}
            </button>
          </div>
        </div>
        <div className="proposal" id="proposal">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <img src="/favicon.png" alt="" width={72} height={72} style={{ objectFit: "cover", borderRadius: "50%", background: "#111" }} />
            <div style={{ textAlign: "right", fontSize: 12 }}>
              <div>{invoice}</div>
              <div>{new Date().toISOString().slice(0, 10)}</div>
            </div>
          </div>
          <h2>{lang === "am" ? "የንግድ ፈቃድ ሀሳብ" : "Commercial licence proposal"}</h2>
          <p>
            {lang === "am"
              ? `${seller.companyAm} ለ${buyerAm} የደጋ ስርዓትን ያቀርባል።`
              : `${seller.company} proposes to license Dega to ${buyer}.`}
          </p>
          <div className="meta">
            <div>
              <strong>{lang === "am" ? "ሻጭ" : "Seller"}</strong>
              <div>{lang === "am" ? seller.companyAm : seller.company}</div>
              <div>{seller.person}</div>
              <div>TIN {seller.tin}</div>
              <div>
                {seller.bank} · {seller.account}
              </div>
              <div>
                {seller.email} · {seller.phone}
              </div>
              <div>{seller.city}</div>
            </div>
            <div>
              <strong>{lang === "am" ? "ገዢ" : "Buyer"}</strong>
              <div>{lang === "am" ? buyerAm : buyer}</div>
              <div>{lang === "am" ? "ዕቅድ" : "Plan"}: {lang === "am" ? plan.nameAm : plan.name}</div>
              <div>
                {lang === "am" ? "ዘመን" : "Term"}: {years} {lang === "am" ? "ዓመት" : "year(s)"}
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>{lang === "am" ? "መግለጫ" : "Description"}</th>
                <th>{lang === "am" ? "መጠን" : "Amount"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Dega {plan.name} · {units}{" "}
                  {plan.unit === "mo"
                    ? lang === "am"
                      ? "ወር"
                      : "months"
                    : lang === "am"
                      ? "ዓመት"
                      : "year(s)"}
                </td>
                <td className="mono">
                  {currency} {fmt(gross)}
                </td>
              </tr>
              {discount < 1 ? (
                <tr>
                  <td>{lang === "am" ? "የቀያሪ ቅናሽ 40%" : "Founding discount 40%"}</td>
                  <td className="mono">
                    − {currency} {fmt(gross - net)}
                  </td>
                </tr>
              ) : null}
              <tr>
                <th>{lang === "am" ? "የሚከፈል" : "Amount due"}</th>
                <th className="mono">
                  {currency} {fmt(net)}
                </th>
              </tr>
            </tbody>
          </table>
          <p style={{ fontSize: 13, marginTop: 22 }}>
            {lang === "am"
              ? "ደጋ የጦር መሣሪያ፣ ኢላማ ወይም ጥቃት ሳይበር አያካትትም። የእቅድ እና የዝግጁነት ስርዓት ብቻ ነው። የተረጋገጠ AFM አይተካም።"
              : "Dega does not include weapons, targeting or offensive cyber. It is a planning and readiness system only. It does not replace a certified AFM."}
          </p>
          <p style={{ fontSize: 13 }}>
            {lang === "am"
              ? "ክፍያ ወደ ከላይ ወደተጠቀሰው ሂሳብ። ፈቃዱ ከክፍያ በኋላ በአምስት የሥራ ቀናት ይከፈታል።"
              : "Wire to the account above. Licence keys issue within five working days of cleared funds."}
          </p>
          <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <div style={{ borderTop: "1px solid #14140f", paddingTop: 8 }}>
                {seller.person} · {lang === "am" ? seller.companyAm : seller.company}
              </div>
            </div>
            <div>
              <div style={{ borderTop: "1px solid #14140f", paddingTop: 8 }}>
                {lang === "am" ? buyerAm : buyer}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SovereignView() {
  const { lang } = useStore();
  return (
    <>
      <div className="kicker">{t(copy.console.sovereign, lang)}</div>
      <h1>{lang === "am" ? "ሉዓላዊ ክፍል" : "Sovereign room"}</h1>
      <p className="sub">
        {lang === "am"
          ? "ለኢትዮጵያ አየር ሃይል፣ ለመከላከያ እና ለኢትዮጵያ ሲቪል አቪዬሽን ባለሥልጣን። በግቢ። ያለ ውጪ ክላውድ። ያለ ጥይት።"
          : "For the Ethiopian Air Force, the ministry, and ECAA. On the premises. No foreign cloud. No munition."}
      </p>
      <div className="grid-3">
        <div className="panel">
          <h3>{lang === "am" ? "ይሰራል" : "It does"}</h3>
          <ul className="reasons">
            <li>{lang === "am" ? "የመርከብ ዝግጁነት እና የደጋ ዑደት ዕዳ" : "Fleet readiness and highland cycle debt"}</li>
            <li>{lang === "am" ? "ስልጠና፣ ትራንስፖርት፣ ፍለጋ፣ ሕክምና፣ አደጋ" : "Training, transport, SAR, medevac, disaster"}</li>
            <li>{lang === "am" ? "የሜዳ ጥግግት እና የቀን መስኮት" : "Field density and the day’s window"}</li>
            <li>{lang === "am" ? "አማርኛ የሥራ ቋንቋ" : "Amharic as a working language"}</li>
          </ul>
        </div>
        <div className="panel">
          <h3>{lang === "am" ? "አይሰራም" : "It does not"}</h3>
          <ul className="reasons">
            <li>{lang === "am" ? "የጦር መሣሪያ ማሰማራት" : "Weapons employment"}</li>
            <li>{lang === "am" ? "ኢላማ ወይም መጥለፍ ጂዮሜትሪ" : "Targeting or intercept geometry"}</li>
            <li>{lang === "am" ? "ጥቃት ሳይበር" : "Offensive cyber"}</li>
            <li>{lang === "am" ? "የፊት ክትትል" : "Face tracking"}</li>
          </ul>
        </div>
        <div className="panel">
          <h3>{lang === "am" ? "ውል" : "The terms"}</h3>
          <p className="tiny">
            {lang === "am"
              ? "$186,000 በዓመት፣ በግቢ ትክክለኛ። አምስት ዓመት $780,000። ምንጭ ኤስክሮው፣ የአየር-ጋፕ ምስል፣ የ20 ሰው ስልጠና።"
              : "$186,000 a year, delivered on-prem. Five years $780,000. Source escrow, air-gap image, training for twenty."}
          </p>
          <div className="row-btns">
            <a className="btn gold" href="#/app/sell">
              {lang === "am" ? "ሉዓላዊ ፈቃድ ጻፍ" : "Write the sovereign licence"}
            </a>
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: 16 }}>
        <h3>{lang === "am" ? "ሐረር ሜዳ እና ልደታ" : "Harar Meda and Lideta"}</h3>
        <p className="tiny">
          {lang === "am"
            ? "ሐረር ሜዳ 1,890 ሜትር ነው። ልደታ 2,362 ሜትር እና 1,170 ሜትር ማኮብኮቢያ ብቻ። የባህር ጠለል ሶፍትዌር ሁለቱንም ይዋሻል። ደጋ የሄሊኮፕተር ምሕረት ክንፍ እና የትራንስፖርት ጭነት በእነዚህ ሜዳዎች ላይ በእውነት ያሰላል።"
            : "Harar Meda is 1,890 m. Lideta is 2,362 m with 1,170 m of pavement. Sea-level software lies about both. Dega prices a mercy helicopter and a transport haul on those fields as they actually are."}
        </p>
      </div>
    </>
  );
}
