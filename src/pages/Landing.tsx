import { AIRFIELDS, BOLE, GLOBAL_HIGHLANDS } from "../data/airfields";
import { copy, t } from "../data/i18n";
import { atmosphereAtHour } from "../lib/atmosphere";
import { formatEat } from "../lib/time";
import { Brand, DaReadout, EthiopiaMap, LangSwitch, fmt } from "../ui/bits";
import { go, useStore } from "../state";
import { useMemo } from "react";

export function Landing() {
  const { lang, setLang, hour, field, setFieldId, atm } = useStore();
  const boleNow = useMemo(() => atmosphereAtHour(BOLE.elevM, hour, BOLE.climate), [hour]);
  const gode = AIRFIELDS.find((f) => f.icao === "HAGO")!;
  const dbt = AIRFIELDS.find((f) => f.icao === "HADT")!;
  const godeAtm = atmosphereAtHour(gode.elevM, hour, gode.climate);
  const dbtAtm = atmosphereAtHour(dbt.elevM, hour, dbt.climate);
  const highShare = Math.round((AIRFIELDS.filter((f) => f.elevM >= 1500).length / AIRFIELDS.length) * 100);

  return (
    <div className={`landing ${lang}`}>
      <header className="nav">
        <Brand />
        <nav className="nav-links">
          <a href="#product">{t(copy.nav.product, lang)}</a>
          <a href="#atlas">{t(copy.nav.atlas, lang)}</a>
          <a href="#price">{t(copy.nav.price, lang)}</a>
          <a href="#sovereign">{t(copy.nav.sovereign, lang)}</a>
        </nav>
        <LangSwitch lang={lang} setLang={setLang} />
        <a className="nav-cta" href="#/app/atlas">
          {t(copy.openConsole, lang)}
        </a>
      </header>

      <section className="hero">
        <div className="hero-photo" />
        <div className="hero-inner">
          <div className="eyebrow">
            <span>{formatEat()}</span>
            <span>EAT</span>
            <span>{t(copy.brandSub, lang)}</span>
          </div>
          <h1>
            ደጋ
            <small>{t(copy.thesis, lang)}</small>
          </h1>
          <div className="hero-row">
            <DaReadout field={BOLE} atm={boleNow} lang={lang} />
            <div>
              <p className="lede" style={{ color: "#14140f" }}>
                {t(copy.dek, lang)}
              </p>
              <div className="cta-row" style={{ marginTop: 18 }}>
                <a className="btn" href="#/app/atlas">
                  {t(copy.openConsole, lang)}
                </a>
                <a className="btn ghost" href="#price">
                  {t(copy.seePricing, lang)}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="product">
        <h2 className={lang}>{t(copy.thesis, lang)}</h2>
        <p className="lede">
          {lang === "am"
                ? "የምዕራብ የአየር ማመላለሻ ሶፍትዌር በባህር ጠለል ይጀምራል። ኢትዮጵያ ግን በደጋ ላይ ትበራለች። ቦሌ 2,326 ሜትር ነው። ደብረ ታቦር 2,588። ጎዴ 254። አንድ ሀገር፣ ሁለት ከባቢ። ያንን እንደ ምርት የሚሸጥ ስርዓት አልነበረም።"
                : "Western dispatch software starts at sea level. Ethiopia flies on a plateau. Bole sits at 2,326 m. Debre Tabor at 2,588. Gode at 254. One country, two atmospheres. That has not been sold as a product."}
        </p>
        <div className="stats">
          <div className="stat">
            <b>{highShare}%</b>
            <span>
              {lang === "am"
                ? "ከዚህ አትላስ ውስጥ ከ1,500 ሜትር በላይ የሆኑ ማኮብኮቢያዎች"
                : "of fields in this atlas sit above 1,500 m"}
            </span>
          </div>
          <div className="stat">
            <b>{fmt(boleNow.densityAltFt)}</b>
            <span>
              {lang === "am" ? "የቦሌ ጥግግት ከፍታ አሁን፣ በእግር" : "Bole density altitude this hour, feet"}
            </span>
          </div>
          <div className="stat">
            <b>{fmt(dbtAtm.densityAltFt - godeAtm.densityAltFt)}</b>
            <span>
              {lang === "am"
                ? "ደብረ ታቦር እና ጎዴ መካከል ያለው የDA ልዩነት"
                : "density-altitude gap, Debre Tabor vs Gode"}
            </span>
          </div>
          <div className="stat">
            <b>{fmt(Math.abs(atm.ruleErrorFt))}</b>
            <span>
              {lang === "am"
                ? `የFAA 120-ህግ ስህተት በ${field.icao} አሁን፣ በእግር`
                : `FAA 120-rule error at ${field.icao} this hour, feet`}
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className={lang}>
          {lang === "am" ? "ሦስት ነገሮች እስካሁን አልተሸጡም።" : "Three things nobody has sold."}
        </h2>
        <div className="pillars">
          <article className="pillar">
            <h3>{lang === "am" ? "እርጥብ አየር፣ ቀጥተኛ ህግ አይደለም" : "Moist air, not a straight-line rule"}</h3>
            <p>
              {lang === "am"
                ? "የመማሪያ መጽሐፍ ደረቅ እና ቀጥተኛ ነው። ደጋ ጣቢያ ግፊትን ከQNH ይወስዳል፣ የውሃ ትነትን ይቀላቅላል፣ ስህተቱን በምልክት ያሳያል። በእርጥብ ጋምቤላ ከሰዓት አራት መቶ እግር ሊደርስ ይችላል። በደረቅ ደጋ ወደ ሌላ አቅጣጫ ይዋሻል። ሁለቱም በጠርዝ ላይ ሂድ/ቀንስን ይገለብጣሉ።"
                : "The textbook is dry and linear. Dega takes station pressure from QNH, mixes water vapour, and signs the error. A wet Gambela afternoon can be four hundred feet. A dry plateau lies the other way. Either lie flips a reduce call when you are already on the edge."}
            </p>
          </article>
          <article className="pillar">
            <h3>{lang === "am" ? "የቀን መስኮት" : "The diurnal window"}</h3>
            <p>
              {lang === "am"
                ? "በአዲስ አበባ ጥዋት እና ከሰዓት መካከል ጥግግት ከፍታ በሁለት ሺህ እግር ይንቀሳቀሳል። ደጋ ለእያንዳንዱ ሜዳ፣ አውሮፕላን እና ጭነት የሂድ መስኮትን ይሳላል። ጠዋት ሂድ። ከሰዓት ጠብቅ።"
                : "Between dawn and mid-afternoon in Addis, density altitude can move two thousand feet. Dega draws the go-window for every field, airframe and payload. Leave at dawn. Hold after lunch."}
            </p>
          </article>
          <article className="pillar">
            <h3>{lang === "am" ? "የደጋ ዑደት ዕዳ" : "Highland cycle debt"}</h3>
            <p>
              {lang === "am"
                ? "ከ5,000 እግር DA በላይ እያንዳንዱ መነሻ በኤንጂን፣ ብሬክ እና ጎማ ላይ ውድ ነው። ደጋ ያንን ዕዳ ይቆጥራል — አየር መንገድ ወጪን ያያል፣ ሉዓላዊ መርከብ ዝግጁነትን ያያል።"
                : "Every takeoff above 5,000 ft DA costs the engine, the brakes, the tyre more than a sea-level cycle. Dega counts that debt — airlines see cost, a sovereign fleet sees readiness."}
            </p>
          </article>
        </div>
      </section>

      <section className="section" id="atlas">
        <div className="split">
          <div>
            <h2 className={lang}>{lang === "am" ? "አንድ ሀገር። ሁለት ከባቢ።" : "One country. Two atmospheres."}</h2>
            <p className="lede">
              {lang === "am"
                ? "ነጥቡን ይጫኑ። ወርቃማ = ደጋ። ሰማያዊ = ቆላ። መዳብ = ዛሬ ቀጭን። ከዚያ ኮንሶሉ ውስጥ ሙሉውን ሞተር ይክፈቱ።"
                : "Click a point. Gold is highland. Cyan is lowland. Copper is thin today. Then open the full engine in the console."}
            </p>
            <div className="rule-err" style={{ marginTop: 24 }}>
              <div className="kicker" style={{ color: "var(--gold-2)" }}>
                {field.icao} · {lang === "am" ? field.nameAm : field.name}
              </div>
              <div className="big">{fmt(atm.densityAltFt)} ft</div>
              <p style={{ color: "var(--muted)", margin: "10px 0 0" }}>
                {lang === "am"
                  ? `የመማሪያ ህግ ${fmt(atm.ruleOfThumbFt)} ft ይላል። ደጋ ${fmt(atm.ruleErrorFt)} ft ይለያል። σ = ${atm.sigma.toFixed(3)}።`
                  : `The textbook rule says ${fmt(atm.ruleOfThumbFt)} ft. Dega disagrees by ${fmt(atm.ruleErrorFt)} ft. σ = ${atm.sigma.toFixed(3)}.`}
              </p>
            </div>
          </div>
          <div className="map-card">
            <EthiopiaMap hour={hour} selected={field.icao} onPick={setFieldId} />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className={lang}>{lang === "am" ? "ማን ይከፍላል" : "Who pays"}</h2>
        <p className="lede">
          {lang === "am"
            ? "የአየር ሃይል ብቻ አይደለም። ገንዘቡ ከበረራ ይጀምራል፣ ከመከላከያ ይበዛል፣ ከአህጉር ይወጣል።"
            : "Not only an air force. Money starts with airlines, thickens with a ministry, and leaves the continent."}
        </p>
        <div className="who">
          <article>
            <h3>{lang === "am" ? "አየር መንገድ እና ቻርተር" : "Airline and charter"}</h3>
            <p>
              {lang === "am"
                ? "ኢትዮጵያ አየር መንገድ፣ የውስጥ አገልግሎት፣ የበረራ ትምህርት ቤቶች። ወርሃዊ ክፍያ። ውጤት፡ ትክክለኛ ጭነት፣ ትክክለኛ ጠዋት፣ ትክክለኛ ጥገና ወጪ።"
                : "Ethiopian Airlines, domestics, schools. Monthly fee. They buy correct payload, correct hour, correct maintenance cost."}
            </p>
          </article>
          <article>
            <h3>{lang === "am" ? "ሉዓላዊ — አየር ሃይል / መከላከያ / ECAA" : "Sovereign — air force / defence / ECAA"}</h3>
            <p>
              {lang === "am"
                ? "በግቢ ውስጥ፣ ያለ ውጪ ክላውድ። ዝግጁነት፣ ስልጠና፣ ትራንስፖርት፣ ፍለጋ፣ ሕክምና፣ የአደጋ እርዳታ። የጦር መሣሪያ የለም። ዓመታዊ ፈቃድ።"
                : "On-prem, no foreign cloud. Readiness, training, transport, SAR, medevac, disaster. No weapons. Annual licence."}
            </p>
          </article>
          <article>
            <h3>{lang === "am" ? "ከአዲስ በኋላ፣ ዓለም" : "After Addis, the world"}</h3>
            <p>
              {lang === "am"
                ? "ናይሮቢ፣ ጆሃንስበርግ፣ ዴንቨር፣ ቦጎታ፣ ኪቶ፣ ላፓዝ፣ ካትማንዱ፣ ሌህ። ደጋ የኢትዮጵያ ምርት ነው፣ የደጋ ገበያ ግን ዓለም አቀፍ ነው።"
                : "Nairobi, Johannesburg, Denver, Bogotá, Quito, La Paz, Kathmandu, Leh. Dega is Ethiopian. The highland market is global."}
            </p>
          </article>
        </div>
        <div className="stats" style={{ marginTop: 22 }}>
          {GLOBAL_HIGHLANDS.slice(0, 4).map((g) => (
            <div className="stat" key={g.icao}>
              <b>{g.elevM} m</b>
              <span>
                {g.city} · {g.icao} · {g.market}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="price">
        <h2 className={lang}>{lang === "am" ? "ዋጋ። ገንዘብ የሚገባበት።" : "Price. Where the money comes in."}</h2>
        <p className="lede">
          {lang === "am"
            ? "የመጀመሪያዎቹ አምስት የኢትዮጵያ ቀያሪዎች 40% ቅናሽ። ኮንትራቱን ኮንሶሉ ውስጥ ይጻፉ።"
            : "The first five Ethiopian operators take 40% founding rate. Write the contract inside the console."}
        </p>
        <div className="prices">
          <article className="price">
            <div className="plan">{lang === "am" ? "አቦ — ነጻ" : "Abbo — free"}</div>
            <div className="amt">$0</div>
            <ul>
              <li>{lang === "am" ? "3 ሜዳዎች" : "3 airfields"}</li>
              <li>{lang === "am" ? "1 የአውሮፕላን መደብ" : "1 aircraft class"}</li>
              <li>{lang === "am" ? "የውሃ ምልክት ያለው ሪፖርት" : "Watermarked report"}</li>
            </ul>
            <a className="btn" href="#/app/thin">
              {lang === "am" ? "ሞክር" : "Try"}
            </a>
          </article>
          <article className="price">
            <div className="plan">{lang === "am" ? "ኦፕሬተር" : "Operator"}</div>
            <div className="amt">$390<span style={{ fontSize: 14 }}>/mo</span></div>
            <div className="tiny">≈ 22,000 ብር / ወር</div>
            <ul>
              <li>{lang === "am" ? "ሙሉ ኢትዮጵያ አትላስ" : "Full Ethiopia atlas"}</li>
              <li>{lang === "am" ? "15 አውሮፕላኖች" : "15 airframes"}</li>
              <li>{lang === "am" ? "የቀን መስኮት" : "Diurnal windows"}</li>
            </ul>
            <a className="btn" href="#/app/sell">
              {lang === "am" ? "ፈቃድ ጻፍ" : "Write a licence"}
            </a>
          </article>
          <article className="price feat">
            <div className="plan">{lang === "am" ? "አየር መንገድ" : "Airline"}</div>
            <div className="amt">$2,800<span style={{ fontSize: 14 }}>/mo</span></div>
            <div className="tiny">≈ 160,000 ብር / ወር</div>
            <ul>
              <li>{lang === "am" ? "ያልተገደበ መርከብ" : "Unlimited fleet"}</li>
              <li>{lang === "am" ? "የደጋ ዑደት ዕዳ" : "Highland cycle debt"}</li>
              <li>{lang === "am" ? "API እና ስልጠና" : "API and training"}</li>
            </ul>
            <a className="btn gold" href="#/app/sell">
              {lang === "am" ? "ለET ሽጥ" : "Sell to ET"}
            </a>
          </article>
          <article className="price">
            <div className="plan">{lang === "am" ? "ሉዓላዊ" : "Sovereign"}</div>
            <div className="amt">$186k<span style={{ fontSize: 14 }}>/yr</span></div>
            <div className="tiny">{lang === "am" ? "በግቢ · ያለ ክላውድ" : "On-prem · no cloud"}</div>
            <ul>
              <li>{lang === "am" ? "አየር ሃይል / መከላከያ / ECAA" : "Air force / defence / ECAA"}</li>
              <li>{lang === "am" ? "ምንጭ ኤስክሮው" : "Source escrow"}</li>
              <li>{lang === "am" ? "አማርኛ ስልጠና" : "Amharic training"}</li>
            </ul>
            <a className="btn" href="#/app/sovereign">
              {lang === "am" ? "ሉዓላዊ ክፍል" : "Sovereign room"}
            </a>
          </article>
        </div>
      </section>

      <section className="section" id="sovereign">
        <h2 className={lang}>{lang === "am" ? "ለአየር ሃይል — ያለ ጥይት" : "For an air force — without a round"}</h2>
        <p className="lede">
          {lang === "am"
            ? "ብሔራዊ አየር ሃይል የሚገዛው ዝግጁነት ነው እንጂ የኢላማ ሶፍትዌር አይደለም። ደጋ በሐረር ሜዳ፣ ልደታ እና በጋራ ሜዳዎች ላይ ትራንስፖርት፣ ስልጠና፣ ፍለጋ እና ሕክምናን ያሰላል። መረጃው በሀገር ውስጥ ይቀራል።"
            : "A national air arm buys readiness, not a targeting stack. Dega prices transport, training, search and mercy on Harar Meda, Lideta and the joint fields. The data stays inside the country."}
        </p>
        <div className="charter">
          <strong>{t(copy.notAWeapon, lang)}</strong>
          <p style={{ margin: "10px 0 0", maxWidth: "70ch" }}>{t(copy.charter, lang)}</p>
        </div>
        <div className="cta-row" style={{ marginTop: 22 }}>
          <button className="btn" type="button" onClick={() => go("/app/atlas")}>
            {t(copy.openConsole, lang)}
          </button>
        </div>
      </section>

      <footer className="foot">
        <div>ደጋ ሲስተምስ · Dega Systems · Addis Ababa</div>
        <div>
          {lang === "am"
            ? "የእቅድ መሣሪያ እንጂ የተረጋገጠ AFM አይደለም።"
            : "A planning instrument, not a certified AFM."}
        </div>
      </footer>
    </div>
  );
}
