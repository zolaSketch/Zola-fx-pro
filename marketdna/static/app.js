/* ═══════════════════════════════════════════════════════════════
   ZOLA MarketDNA — frontend (vanilla JS, zero dependencies)
   ═══════════════════════════════════════════════════════════════ */
"use strict";

/* ─────────────────────────── i18n ─────────────────────────── */
const I18N = {
  am: {
    tagline: 'AI የገበያውን "የአየር ሁኔታ" የሚማርበት ኳንት ላብ',
    source_sim: "ሲሙሌሽን", source_live: "ቀጥታ ዳታ",
    tab_dna: "ገበያ ዲኤንኤ", tab_evolve: "ስትራቴጂ ኢቮልቨር",
    tab_hof: "የክብር አዳራሽ", tab_about: "ስለ ፕሮጀክቱ",
    symbol: "ምልክት", interval: "የጊዜ ክፍተት", bars: "ካንደሎች",
    load: "ዳታ ጫን", loading: "በመጫን ላይ…",
    weather_now: "የአሁኑ የአየር ሁኔታ", volatility: "መለዋወጥ (Volatility)",
    trend60: "የ60-ካንደል አዝማሚያ", distribution: "የሬጂም ስርጭት",
    dna_note: "እያንዳንዱ ካንደል በተማረው የገበያ \"የአየር ሁኔታ\" (ሬጂም) ቀለም ተቀብቷል — ዘግይቶ የሚመጣ ኢንዲኬተር ሳይሆን፣ AI የገበያውን ሁኔታ ስታቲስቲካዊ አሻራ ነው። ወደ ስትራቴጂ ኢቮልቨር ሂድና ይህን ዲኤንኤ የሚጠቀም ስትራቴጂ እንዲፈጠር አድርግ።",
    evolve_title: "የጄኔቲክ ስትራቴጂ ኢቮሉሽን",
    evolve_sub: "ስትራቴጂዎች እንደ ፍጡራን ተወዳድረው በ Walk-Forward ማረጋገጫ ያሸነፈው ብቻ ይተርፋል — ከናሙና ውጭ በጠንካራ ውጤት ያለው ጂኖም አሸናፊ ይሆናል፣ በባክቴስት ብቻ የሚያብረቀርቅ አይደለም።",
    population: "ህዝብ (Population)", generations: "ትውልዶች",
    folds: "Walk-Forward እጥፋቶች", run: "🧬 ኢቮሉሽን ጀምር",
    running: "በዝግመተ ለውጥ ላይ…",
    champion: "🏆 አሸናፊው ጂኖም", dna_code: "የዲኤንኤ ኮድ",
    copy: "ቅዳ", save_hof: "🏆 አስቀምጥ", copied: "✓ ተቀድቷል!",
    saved: "✓ ወደ ክብር አዳራሽ ገብቷል!",
    honesty: "📜 የሐቀኝነት ሪፖርት", metric: "መለኪያ",
    in_sample: "በስልጠና ዳታ", out_sample: "ከናሙና ውጭ",
    naive_label: "ሙሉ ዳታ (naive)",
    m_total_ret: "ጠቅላላ መመለሻ %", m_sharpe: "Sharpe (አመታዊ)",
    m_dd: "ከፍተኛ ማሽቆልቆል %", m_trades: "ግብይቶች",
    m_win: "የድል መጠን %", m_pf: "የትርፍ ድርሻ",
    folds_title: "🔁 Walk-Forward እጥፋቶች", fold: "እጥፋት",
    oos_sharpe: "OOS Sharpe", oos_trades: "ግብይቶች", oos_dd: "Max DD %",
    gap_note: "⚠️ ልብ በል፡ ሙሉ-ዳታ (naive) ባክቴስት Sharpe {naive} ያሳያል፣ ነገር ግን የእውነተኛው ፈተና — ጂኖሙ ተመልክቶት የማያውቀው ከናሙና ውጭ ያለ ዳታ — {oos} ነው። ይህ ክፍተት የሐሰት ባክቴስት ወጥመድ ነው።",
    consistency_note: "የ OOS ውጤቶች መረጋጋት (std): {c} — ዝቅተኛ = የበለጠ አስተማማኝ።",
    equity_title: "📈 የአሸናፊው አቋም — ከናሙና ውጭ ያልታየ ዳታ ላይ",
    fitness_title: "🧬 የአካል ብቃት (Fitness) ታሪክ — የእያንዳንዱ ትውልድ ምርጥ",
    strategy: "ስትራቴጂ", buyhold: "ይዞ-መቆየት",
    evolve_note: "ይህ ምርምር-ማሳያ መሳሪያ እንጂ የፋይናንስ ምክር አይደለም። ያለፈ ውጤት የወደፊት ውጤትን አያረጋግጥም። በእውነተኛ ገንዘብ ከመጠቀምህ በፊት በደንብ ሞክር።",
    hof_title: "🏆 የክብር አዳራሽ",
    hof_sub: "ያሸነፉት ጂኖሞች — በሐቀኝነት ሪፖርታቸው ጋር። ኮዳቸውን በመቅዳት ለማንም አጋራ።",
    hof_empty: "ገና ባዶ ነው — ሄደህ ኢቮሉሽን አስኪድ እና አሸናፊ ጂኖም አስቀምጥ! 🧬",
    hof_delete: "አጥፋ", hof_deleted: "ተሰርዟል",
    about_title: "ለምን ZOLA MarketDNA? 🧬",
    about_a_title: "የመጀመሪያው አማርኛ-ተኮር ኳንት ላብ",
    about_a_body: "ከ120 ሚሊዮን በላይ የአማርኛ ተናጋሪ ህዝብ አለ — ግን እውነተኛ የኳንት ትንተና መሳሪያ በአማርኛ የለም። ይህ የመጀመሪያው ነው።",
    about_b_title: "የሬጂም ዲኤንኤ ሞተር",
    about_b_body: "AI የገበያውን ሁኔታ ራሱ ተምሮ ይከፍላል — ረጋ፣ ጭማሪ፣ ቅናሽ፣ ማዕበል። ኢንዲኬተር አይደለም — የገበያ ሁኔታ ስታቲስቲካዊ አሻራ ነው።",
    about_c_title: "የጄኔቲክ ኢቮሉሽን",
    about_c_body: "ስትራቴጂዎች በዳርዊናዊ ውድድር ይፈጠራሉ — ምርጦቹ ተዳቅለው፣ ተለውጠው፣ ተወዳድረው። ያሸነፈው በ Walk-Forward ማረጋገጫ የተረጋገጠ ብቻ ነው።",
    about_d_title: "የሐቀኝነት ሞተር",
    about_d_body: "በትሬዲንግ ኢንዱስትሪ ያለው #1 ማጭበርበር ውብ ባክቴስት ነው። እኛ እያንዳንዱ ጂኖም ኢን-ሳምፕል vs አውት-ኦፍ-ሳምፕል ውጤቱን በግልፅ ያሳያል — የሐሰት ተስፋ አይሰጥም።",
    tech_title: "ቴክኖሎጂ",
    tech_body: "100% ኦፕን-ሶርስ፣ ዜሮ ጥገኝነት — ንፁህ Python (stdlib ብቻ) + vanilla JavaScript + Canvas። የገበያ ዳታ በቀጥታ ከBinance/Coinbase/CoinGecko (የተጠቃሚው ብራውዘር) ወይም ከመስመር ውጭ ሲሙሌሽን ሞተር። ሁሉም ኮምፒውቴሽን በአገር ውስጥ ይሰራል።",
    roadmap_title: "የወደፊት መንገድ (Roadmap)",
    rm1: "v1.0 — ኦፕን-ሶርስ ኮር፡ የሬጂም ዲኤንኤ + የጄኔቲክ ኢቮልቨር + የክብር አዳራሽ (✅ አሁን እያየህ ያለው)",
    rm2: "v1.5 — ደመና ኢቮሉሽን፡ ትላልቅ ህዝቦች፣ ብዙ ምልክቶች፣ Telegram ማንቂያዎች",
    rm3: "v2.0 — የህዝብ መሪ ሰሌዳ (Live Leaderboard)፡ ጂኖሞች በቀጥታ ውድድር",
    rm4: "v3.0 — የጂኖም ገበያ (Marketplace) + የአማርኛ ኳንት አካዳሚ",
    about_disclaimer: "ZOLA MarketDNA የምርምር እና ትምህርት መሳሪያ ነው — የፋይናንስ ምክር አይሰጥም።",
    source_binance: "Binance", source_coinbase: "Coinbase", source_coingecko: "CoinGecko",
    reg_calm: "ረጋ ያለ", reg_up: "ጭማሪ", reg_down: "ቅናሽ", reg_storm: "ማዕበል",
    p_fast: "ፈጣን SMA", p_slow: "ዝግ SMA", p_rbuy: "RSI ግዢ", p_rsell: "RSI ሽያጭ",
    p_astop: "ATR ማቆሚያ", p_atp: "ATR ዒላማ", p_risk: "ስጋት %", p_mask: "የሬጂም ጭምብል",
    oos_stamp: "OOS Sharpe", err_load: "መጫን አልተቻለም — ሲሙሌሽን እንጠቀማለን",
    err_run: "ኢቮሉሽኑ ወድቋል — እንደገና ሞክር",
  },
  en: {
    tagline: 'The quant lab where AI learns the market\'s "weather"',
    source_sim: "SIMULATION", source_live: "LIVE",
    tab_dna: "Market DNA", tab_evolve: "Strategy Evolver",
    tab_hof: "Hall of Fame", tab_about: "About",
    symbol: "Symbol", interval: "Interval", bars: "Candles",
    load: "Load data", loading: "Loading…",
    weather_now: "Current weather", volatility: "Volatility",
    trend60: "60-bar trend", distribution: "Regime distribution",
    dna_note: "Every candle is coloured by the market \"weather\" (regime) the AI learned — not a lagging indicator, but a statistical fingerprint of market state. Head to the Strategy Evolver and breed a strategy that uses this DNA.",
    evolve_title: "Genetic Strategy Evolution",
    evolve_sub: "Strategies compete like organisms, and only those validated by walk-forward out-of-sample results survive — never the shiniest in-sample backtest.",
    population: "Population", generations: "Generations",
    folds: "Walk-forward folds", run: "🧬 Start Evolution",
    running: "Evolving…",
    champion: "🏆 Champion Genome", dna_code: "DNA code",
    copy: "Copy", save_hof: "🏆 Save", copied: "✓ Copied!",
    saved: "✓ Added to Hall of Fame!",
    honesty: "📜 Honesty Report", metric: "Metric",
    in_sample: "In-sample", out_sample: "Out-of-sample",
    naive_label: "Full-data (naive)",
    m_total_ret: "Total return %", m_sharpe: "Sharpe (annualized)",
    m_dd: "Max drawdown %", m_trades: "Trades",
    m_win: "Win rate %", m_pf: "Profit factor",
    folds_title: "🔁 Walk-Forward Folds", fold: "Fold",
    oos_sharpe: "OOS Sharpe", oos_trades: "Trades", oos_dd: "Max DD %",
    gap_note: "⚠️ Notice: the naive full-data backtest shows Sharpe {naive}, but the real test — data the genome never saw — is {oos}. That gap is the fake-backtest trap.",
    consistency_note: "OOS consistency (std): {c} — lower = more trustworthy.",
    equity_title: "📈 Champion equity — on unseen out-of-sample data",
    fitness_title: "🧬 Fitness history — best of each generation",
    strategy: "Strategy", buyhold: "Buy & hold",
    evolve_note: "This is a research/demo tool, not financial advice. Past results never guarantee future results. Test thoroughly before using real money.",
    hof_title: "🏆 Hall of Fame",
    hof_sub: "Champion genomes with their full honesty reports. Copy a code and share it with anyone.",
    hof_empty: "Empty so far — run an evolution and save a champion genome! 🧬",
    hof_delete: "Delete", hof_deleted: "Deleted",
    about_title: "Why ZOLA MarketDNA? 🧬",
    about_a_title: "The first Amharic-first quant lab",
    about_a_body: "Over 120 million people speak Amharic — yet no real quant analysis tool exists in the language. This is the first.",
    about_b_title: "Regime DNA engine",
    about_b_body: "AI learns market states on its own — calm, uptrend, downtrend, storm. Not an indicator: a statistical fingerprint of market state.",
    about_c_title: "Genetic evolution",
    about_c_body: "Strategies are born through Darwinian competition — the fittest cross over, mutate and compete. Only walk-forward-validated champions survive.",
    about_d_title: "The honesty engine",
    about_d_body: "The #1 scam in trading is the pretty backtest. Every genome here shows in-sample vs out-of-sample side by side — no false hope.",
    tech_title: "Technology",
    tech_body: "100% open source, zero dependencies — pure Python (stdlib only) + vanilla JavaScript + Canvas. Market data comes live from Binance/Coinbase/CoinGecko (your browser) or from an offline simulation engine. All computation runs locally.",
    roadmap_title: "Roadmap",
    rm1: "v1.0 — open-source core: Regime DNA + Genetic Evolver + Hall of Fame (✅ what you see now)",
    rm2: "v1.5 — cloud evolution: bigger populations, more symbols, Telegram alerts",
    rm3: "v2.0 — public live leaderboard: genomes compete in real time",
    rm4: "v3.0 — genome marketplace + Amharic quant academy",
    about_disclaimer: "ZOLA MarketDNA is a research and education tool — it does not provide financial advice.",
    source_binance: "Binance", source_coinbase: "Coinbase", source_coingecko: "CoinGecko",
    reg_calm: "Calm", reg_up: "Uptrend", reg_down: "Downtrend", reg_storm: "Storm",
    p_fast: "Fast SMA", p_slow: "Slow SMA", p_rbuy: "RSI buy", p_rsell: "RSI sell",
    p_astop: "ATR stop", p_atp: "ATR target", p_risk: "Risk %", p_mask: "Regime mask",
    oos_stamp: "OOS Sharpe", err_load: "Couldn't load — falling back to simulation",
    err_run: "Evolution failed — try again",
  },
};

let LANG = localStorage.getItem("zola-lang") || "am";
function t(key) { return (I18N[LANG] && I18N[LANG][key]) || key; }
function applyLang() {
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (I18N[LANG][k] !== undefined) el.textContent = I18N[LANG][k];
  });
  document.getElementById("langBtn").textContent = LANG === "am" ? "EN" : "አማ";
  localStorage.setItem("zola-lang", LANG);
  renderAll();
  const active = document.querySelector(".view.active");
  if (active && active.id === "view-hof") renderHof();
}
const fmt = (n, d = 2) => Number(n).toLocaleString(LANG === "am" ? "am-ET" : "en-US",
  { maximumFractionDigits: d });
const fmtDate = (ms) => new Date(ms).toLocaleString(LANG === "am" ? "am-ET" : "en-US",
  { month: "short", day: "numeric", hour: "2-digit" });

/* ─────────────────────────── state ─────────────────────────── */
const SYMBOLS = [
  { id: "BTCUSDT", name: "Bitcoin", live: { bin: "BTCUSDT", cb: "BTC-USD", cg: "bitcoin" } },
  { id: "ETHUSDT", name: "Ethereum", live: { bin: "ETHUSDT", cb: "ETH-USD", cg: "ethereum" } },
  { id: "SOLUSDT", name: "Solana", live: { bin: "SOLUSDT", cb: "SOL-USD", cg: "solana" } },
  { id: "XRPUSDT", name: "XRP", live: { bin: "XRPUSDT", cb: "XRP-USD", cg: "ripple" } },
  { id: "BNBUSDT", name: "BNB", live: { bin: "BNBUSDT", cb: "BNB-USD", cg: "binancecoin" } },
  { id: "DOGEUSDT", name: "Dogecoin", live: { bin: "DOGEUSDT", cb: "DOGE-USD", cg: "dogecoin" } },
  { id: "EURUSD", name: "EUR/USD (sim)", live: null },
  { id: "GBPUSD", name: "GBP/USD (sim)", live: null },
  { id: "USDJPY", name: "USD/JPY (sim)", live: null },
  { id: "GOLD", name: "Gold (sim)", live: null },
  { id: "SP500", name: "S&P 500 (sim)", live: null },
];
const state = {
  symbol: "BTCUSDT", interval: "1h", bars: 1000,
  candles: [], labels: [], meta: null, source: "sim", sourceName: null,
  jobTimer: null, result: null,
};

/* ─────────────────────────── DOM ─────────────────────────── */
const $ = (id) => document.getElementById(id);
const symbolSel = $("symbolSel"), intervalSeg = $("intervalSeg"),
  barsRange = $("barsRange"), barsVal = $("barsVal"), loadBtn = $("loadBtn"),
  candleCanvas = $("candleCanvas"), chartTooltip = $("chartTooltip"),
  equityCanvas = $("equityCanvas"), fitnessCanvas = $("fitnessCanvas");

function toast(msg) {
  const el = $("toast");
  el.textContent = msg; el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => (el.hidden = true), 2600);
}

/* ─────────────────────────── data loading ─────────────────────────── */
async function fetchTimeout(url, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally { clearTimeout(timer); }
}

async function loadLive(sym, interval, bars) {
  const cfg = sym.live;
  if (!cfg) return null;
  const limit = Math.min(bars, 1000);
  // 1) Binance
  if (cfg.bin && interval !== "1d" || (cfg.bin && interval === "1d")) {
    try {
      const data = await fetchTimeout(
        `https://api.binance.com/api/v3/klines?symbol=${cfg.bin}&interval=${interval}&limit=${limit}`);
      return { candles: data.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] })), source: "binance" };
    } catch (e) { /* next */ }
  }
  // 2) Coinbase (max 300)
  try {
    const g = { "1h": 3600, "4h": 14400, "1d": 86400 }[interval];
    const data = await fetchTimeout(
      `https://api.exchange.coinbase.com/products/${cfg.cb}/candles?granularity=${g}`);
    const candles = data.slice(0, Math.min(bars, 300)).reverse()
      .map(k => ({ t: k[0] * 1000, o: +k[3], h: +k[2], l: +k[1], c: +k[4], v: +k[5] }));
    return { candles, source: "coinbase" };
  } catch (e) { /* next */ }
  // 3) CoinGecko (daily only)
  if (interval === "1d" && cfg.cg) {
    try {
      const data = await fetchTimeout(
        `https://api.coingecko.com/api/v3/coins/${cfg.cg}/ohlc?vs_currency=usd&days=${Math.min(bars, 365)}`);
      return { candles: data.map(k => ({ t: k[0], o: k[1], h: k[2], l: k[3], c: k[4], v: 0 })), source: "coingecko" };
    } catch (e) { /* next */ }
  }
  return null;
}

async function loadSynth(symbol, interval, bars) {
  const data = await fetchTimeout(`/api/synth?symbol=${encodeURIComponent(symbol)}&interval=${interval}&bars=${bars}`, 15000);
  return { candles: data.candles, source: "sim" };
}

async function computeRegimes(candles) {
  const res = await fetch("/api/regimes", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candles }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "regimes failed");
  return data;
}

async function loadData() {
  loadBtn.disabled = true;
  loadBtn.textContent = t("loading");
  const sym = SYMBOLS.find(s => s.id === state.symbol);
  let got = null;
  try {
    got = await loadLive(sym, state.interval, state.bars);
  } catch (e) { got = null; }
  let srcName = null;
  if (!got) {
    got = await loadSynth(state.symbol, state.interval, state.bars);
    state.source = "sim";
    $("sourceBadge").className = "badge badge-sim";
    $("sourceBadge").textContent = t("source_sim");
  } else {
    state.source = "live";
    srcName = t("source_" + got.source) || got.source;
    $("sourceBadge").className = "badge badge-live";
    $("sourceBadge").textContent = t("source_live") + " · " + srcName;
  }
  state.candles = got.candles;
  state.sourceName = srcName;
  state.bars = state.candles.length;
  try {
    const reg = await computeRegimes(state.candles);
    state.labels = reg.labels; state.meta = reg.meta;
  } catch (e) {
    state.labels = state.candles.map(() => 0);
    state.meta = { current: 0, distribution: [100, 0, 0, 0], volatility: 0, trend_60: 0,
      legend: [{ id: "calm", en: "Calm", am: "ረጋ ያለ", color: "#2dd4bf" }] };
  }
  $("footerStatus").textContent = `${sym.name} · ${state.bars} ${t("bars").toLowerCase()} · ${fmtDate(Date.now())}`;
  renderAll();
  loadBtn.disabled = false;
  loadBtn.textContent = t("load");
}

/* ─────────────────────────── charts ─────────────────────────── */
const REGIME_COLORS = { 0: "#2dd4bf", 1: "#4ade80", 2: "#f87171", 3: "#c084fc" };

function setupCanvas(cv) {
  const rect = cv.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.max(50, Math.floor(rect.width * dpr));
  cv.height = Math.max(50, Math.floor(rect.height * dpr));
  const ctx = cv.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

function niceTicks(min, max, n = 5) {
  if (!(max > min)) return [min];
  const span = max - min;
  const step = Math.pow(10, Math.floor(Math.log10(span / n)));
  const err = span / n / step;
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
  const s = step * mult;
  const ticks = [];
  for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s) ticks.push(v);
  return ticks;
}

function drawGrid(ctx, w, h, pad, ticksY, yMin, yMax, xLabels) {
  ctx.strokeStyle = "rgba(99,102,241,0.10)";
  ctx.fillStyle = "#8b98b8";
  ctx.font = "10px 'Space Grotesk', sans-serif";
  ctx.lineWidth = 1;
  ticksY.forEach(v => {
    const y = pad.t + (yMax - v) / (yMax - yMin) * (h - pad.t - pad.b);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
    ctx.textAlign = "left"; ctx.fillText(fmt(v, v >= 1000 ? 0 : 2), w - pad.r + 6, y + 3);
  });
  xLabels.forEach(({ x, label }) => {
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
    ctx.textAlign = "center"; ctx.fillText(label, x, h - pad.b + 14);
  });
}

function xLabelsFor(candles, w, pad) {
  const out = [];
  const n = Math.min(6, candles.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.round(i * (candles.length - 1) / (n - 1 || 1));
    out.push({ x: pad.l + idx / (candles.length - 1) * (w - pad.l - pad.r), label: fmtDate(candles[idx].t) });
  }
  return out;
}

function drawCandles() {
  if (!state.candles.length) return;
  const { ctx, w, h } = setupCanvas(candleCanvas);
  ctx.clearRect(0, 0, w, h);
  const pad = { l: 10, r: 74, t: 14, b: 26 };
  const cs = state.candles;
  const n = cs.length;
  const step = Math.max(1, Math.ceil(n / (w - pad.l - pad.r)));
  const idxs = [];
  for (let i = 0; i < n; i += step) idxs.push(i);
  const m = idxs.length;
  let yMin = Infinity, yMax = -Infinity;
  for (const i of idxs) { yMin = Math.min(yMin, cs[i].l); yMax = Math.max(yMax, cs[i].h); }
  const yspan = yMax - yMin || 1;
  yMin -= yspan * 0.04; yMax += yspan * 0.04;
  const cw = Math.max(1, (w - pad.l - pad.r) / m);
  const bodyW = Math.max(1, cw * 0.62);
  idxs.forEach((ci, j) => {
    const c = cs[ci];
    const x = pad.l + j * cw + cw / 2;
    const col = REGIME_COLORS[state.labels[ci]] || "#64748b";
    const yOf = (p) => pad.t + (yMax - p) / (yMax - yMin) * (h - pad.t - pad.b);
    ctx.strokeStyle = col;
    ctx.fillStyle = col;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, yOf(c.h)); ctx.lineTo(x, yOf(c.l)); ctx.stroke();
    const yo = yOf(Math.max(c.o, c.c)), yc = yOf(Math.min(c.o, c.c));
    const hh = Math.max(1, yc - yo);
    if (c.c >= c.o) { ctx.fillStyle = "rgba(74,222,128,0.85)"; ctx.strokeStyle = "#4ade80"; }
    else { ctx.fillStyle = "rgba(248,113,113,0.85)"; ctx.strokeStyle = "#f87171"; }
    ctx.fillRect(x - bodyW / 2, yo, bodyW, hh);
    ctx.strokeRect(x - bodyW / 2, yo, bodyW, hh);
  });
  const ticksY = niceTicks(yMin, yMax, 5);
  drawGrid(ctx, w, h, pad, ticksY, yMin, yMax, xLabelsFor(cs, w, pad));

  const hv = candleCanvas._hover;
  if (hv !== undefined && hv >= 0 && hv < n) {
    const j = Math.floor(hv / step);
    const x = pad.l + j * cw + cw / 2;
    const c = cs[hv];
    ctx.strokeStyle = "rgba(226,232,240,0.5)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
    ctx.setLineDash([]);
    const tooltip = chartTooltip;
    tooltip.hidden = false;
    const parts = [
      `<b>${fmtDate(c.t)}</b>`,
      `O ${fmt(c.o, 6)} · H ${fmt(c.h, 6)} · L ${fmt(c.l, 6)} · C ${fmt(c.c, 6)}`,
      `${state.meta && state.meta.legend[state.labels[hv]] ? state.meta.legend[state.labels[hv]][LANG] : ""}`,
    ];
    tooltip.innerHTML = parts.join("<br>");
    const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    let tx = x + 14; if (tx + tw > w - 4) tx = x - tw - 14;
    tooltip.style.left = Math.max(4, tx) + "px";
    tooltip.style.top = Math.min(Math.max(4, (h - th) / 2), h - th - 4) + "px";
  } else {
    chartTooltip.hidden = true;
  }
}

function drawLineSeries(cv, series, opts = {}) {
  const { ctx, w, h } = setupCanvas(cv);
  ctx.clearRect(0, 0, w, h);
  const pad = { l: 10, r: 66, t: 14, b: 24 };
  let yMin = Infinity, yMax = -Infinity, maxN = 1;
  for (const s of series) {
    maxN = Math.max(maxN, s.data.length);
    for (const v of s.data) { yMin = Math.min(yMin, v); yMax = Math.max(yMax, v); }
  }
  const span = yMax - yMin || 1;
  yMin -= span * 0.05; yMax += span * 0.05;
  const yOf = (p) => pad.t + (yMax - p) / (yMax - yMin) * (h - pad.t - pad.b);
  const xOf = (i) => pad.l + i / (maxN - 1 || 1) * (w - pad.l - pad.r);
  series.forEach(s => {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width || 2;
    ctx.beginPath();
    s.data.forEach((v, i) => {
      const x = xOf(i), y = yOf(v);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    if (s.fill) {
      ctx.lineTo(xOf(s.data.length - 1), h - pad.b);
      ctx.lineTo(xOf(0), h - pad.b);
      ctx.closePath();
      ctx.fillStyle = s.fill;
      ctx.fill();
    }
  });
  drawGrid(ctx, w, h, pad, niceTicks(yMin, yMax, 5), yMin, yMax,
    Array.from({ length: Math.min(5, maxN) }, (_, i) => ({
      x: xOf(Math.round(i * (maxN - 1) / (Math.min(5, maxN) - 1 || 1))),
      label: String(Math.round(i * (maxN - 1) / (Math.min(5, maxN) - 1 || 1))),
    })));
}

/* ─────────────────────────── rendering ─────────────────────────── */
function renderLegend() {
  const el = $("regimeLegend");
  if (!state.meta) { el.innerHTML = ""; return; }
  el.innerHTML = state.meta.legend.map(lg =>
    `<span class="lg-item"><span class="dot" style="background:${lg.color}"></span>${lg[LANG]}</span>`).join("");
}

function renderStats() {
  if (!state.meta) return;
  const m = state.meta;
  const cur = m.legend[m.current] || {};
  $("statRegime").innerHTML = `<span class="dot" style="background:${cur.color};display:inline-block;width:14px;height:14px;border-radius:4px;margin-right:8px"></span>${cur[LANG]}`;
  $("statVol").textContent = (m.volatility * 100).toFixed(2) + "%";
  const tr = m.trend_60 * 100;
  const trEl = $("statTrend");
  trEl.textContent = (tr >= 0 ? "+" : "") + tr.toFixed(2) + "%";
  trEl.style.color = tr >= 0 ? "var(--good)" : "var(--bad)";
  $("statDist").innerHTML = m.distribution.map((d, i) =>
    `<span style="width:${Math.max(3, d)}%;background:${(m.legend[i] || {}).color}" title="${(m.legend[i] || {})[LANG]}: ${d}%"></span>`).join("");
  $("chartTitle").textContent = `${state.symbol} · ${state.interval} · ${state.bars}`;
}

function renderParamChips(p) {
  const bits = ["calm", "up", "down", "storm"].map((id, i) => {
    const on = (p.mask >> i) & 1;
    const name = state.meta ? (state.meta.legend[i] || {})[LANG] : id;
    return `<span class="chip" style="${on ? "" : "opacity:0.3;text-decoration:line-through"}">${name}</span>`;
  });
  $("paramChips").innerHTML = [
    `<span class="chip">${t("p_fast")}: <b>${p.fast}</b></span>`,
    `<span class="chip">${t("p_slow")}: <b>${p.slow}</b></span>`,
    `<span class="chip">${t("p_rbuy")}: <b>${p.rsi_buy}</b></span>`,
    `<span class="chip">${t("p_rsell")}: <b>${p.rsi_sell}</b></span>`,
    `<span class="chip">${t("p_astop")}: <b>${p.atr_stop}</b></span>`,
    `<span class="chip">${t("p_atp")}: <b>${p.atr_tp}</b></span>`,
    `<span class="chip">${t("p_risk")}: <b>${p.risk_pct}</b></span>`,
  ].join("") + bits.join("");
}

function classOf(v) { return v > 0 ? "pos" : v < 0 ? "neg" : ""; }

function renderResults(res) {
  state.result = res;
  $("resultsWrap").hidden = false;
  $("evolveNote").hidden = false;
  const ch = res.champion.test;
  const tr = res.champion.train;
  const nv = res.naive;
  $("dnaText").textContent = ch.dna;
  renderParamChips(ch.params);

  const stamp = $("oosStamp");
  stamp.className = "oos-stamp" + (ch.ann_sharpe < 0 ? " warn" : "");
  stamp.innerHTML = `<span class="big">${ch.ann_sharpe.toFixed(2)}</span><span class="lbl">${t("oos_stamp")}</span>`;

  const rows = [
    ["m_total_ret", "total_ret"], ["m_sharpe", "ann_sharpe"],
    ["m_dd", "max_dd"], ["m_trades", "trades"], ["m_win", "win_rate"],
  ];
  $("honestyTable").querySelector("tbody").innerHTML = rows.map(([k, f]) => {
    const cls = ["total_ret", "ann_sharpe"].includes(f) ? "pos" : "";
    return `<tr><td>${t(k)}</td>
      <td class="${classOf(tr[f])}">${fmt(tr[f])}</td>
      <td class="${classOf(ch[f])}">${fmt(ch[f])}</td>
      <td class="${classOf(nv[f])}">${fmt(nv[f])}</td></tr>`;
  }).join("");

  $("gapNote").textContent = t("gap_note").replace("{naive}", nv.ann_sharpe.toFixed(2))
    .replace("{oos}", ch.ann_sharpe.toFixed(2));

  $("foldsTable").querySelector("tbody").innerHTML = res.folds.map(f =>
    `<tr><td>${f.fold}</td>
     <td class="${classOf(f.test.ann_sharpe)}">${fmt(f.test.ann_sharpe)}</td>
     <td>${f.test.trades}</td>
     <td class="${classOf(-f.test.max_dd)}">${fmt(f.test.max_dd)}</td></tr>`).join("");
  $("consistencyNote").textContent = t("consistency_note").replace("{c}", res.oos_consistency);

  drawLineSeries(equityCanvas, [
    { data: ch.equity, color: "#22d3ee", width: 2.2, fill: "rgba(34,211,238,0.08)", label: t("strategy") },
    { data: ch.buyhold, color: "#8b98b8", width: 1.4, label: t("buyhold") },
  ]);
  $("equityLegend").innerHTML = `<span class="lg-item"><span class="dot" style="background:#22d3ee"></span>${t("strategy")}</span>
    <span class="lg-item"><span class="dot" style="background:#8b98b8"></span>${t("buyhold")}</span>`;

  drawLineSeries(fitnessCanvas, [
    { data: res.naive_history, color: "#a78bfa", width: 2, fill: "rgba(167,139,250,0.08)", label: "fitness" },
  ]);
}

function renderHof() {
  const grid = $("hofGrid");
  fetch("/api/hof").then(r => r.json()).then(data => {
    const entries = data.entries || [];
    if (!entries.length) {
      grid.innerHTML = `<div class="empty">${t("hof_empty")}</div>`;
      return;
    }
    grid.innerHTML = entries.map(e => `
      <div class="hof-card">
        <div class="hof-top">
          <span class="hof-symbol">🧬 ${e.symbol} · ${e.interval}</span>
          <span class="hof-date">${fmtDate(e.saved_at)}</span>
        </div>
        <code>${e.dna}</code>
        <div class="hof-metrics">
          <div><span class="v ${e.oos_sharpe < 0 ? "neg" : "pos"}">${fmt(e.oos_sharpe)}</span><span class="k">OOS Sharpe</span></div>
          <div><span class="v ${e.oos_ret < 0 ? "neg" : "pos"}">${fmt(e.oos_ret)}%</span><span class="k">OOS Ret</span></div>
          <div><span class="v">${e.oos_dd}%</span><span class="k">Max DD</span></div>
        </div>
        <div class="hof-actions">
          <button class="btn btn-ghost" data-copy="${e.dna}">${t("copy")}</button>
          <button class="btn btn-ghost" data-del="${e.id}">${t("hof_delete")}</button>
        </div>
      </div>`).join("");
    grid.querySelectorAll("[data-copy]").forEach(b =>
      b.addEventListener("click", () => copyText(b.dataset.copy)));
    grid.querySelectorAll("[data-del]").forEach(b =>
      b.addEventListener("click", async () => {
        await fetch("/api/hof/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: b.dataset.del }) });
        toast(t("hof_deleted"));
        renderHof();
      }));
  }).catch(() => (grid.innerHTML = `<div class="empty">…</div>`));
}

function renderAll() {
  renderLegend();
  renderStats();
  drawCandles();
  if (state.result) renderResults(state.result);
}

/* ─────────────────────────── clipboard ─────────────────────────── */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove();
  }
  toast(t("copied"));
}

/* ─────────────────────────── evolution ─────────────────────────── */
async function runEvolution() {
  if (!state.candles.length) { await loadData(); }
  const runBtn = $("runBtn");
  runBtn.disabled = true;
  runBtn.textContent = t("running");
  $("progressWrap").hidden = false;
  $("progressFill").style.width = "2%";
  $("progressStage").textContent = "…";
  $("resultsWrap").hidden = true;
  try {
    const body = {
      candles: state.candles,
      symbol: state.symbol, interval: state.interval,
      population: +$("popIn").value, generations: +$("genIn").value,
      folds: +$("foldIn").value,
      seed: Math.floor(Math.random() * 1e9),
    };
    const res = await fetch("/api/evolve", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const { job_id } = await res.json();
    if (!res.ok) throw new Error("start failed");
    const poll = async () => {
      try {
        const jr = await fetch("/api/job?id=" + job_id);
        const job = await jr.json();
        if (job.status === "running") {
          $("progressFill").style.width = Math.max(2, Math.round(job.progress * 100)) + "%";
          $("progressStage").textContent = job.stage || "…";
          state.jobTimer = setTimeout(poll, 650);
        } else if (job.status === "done") {
          $("progressFill").style.width = "100%";
          $("progressStage").textContent = "✓ " + fmt(job.result.elapsed) + "s";
          renderResults(job.result);
          runBtn.disabled = false;
          runBtn.textContent = t("run");
        } else {
          throw new Error(job.error || "error");
        }
      } catch (e) {
        runBtn.disabled = false;
        runBtn.textContent = t("run");
        toast(t("err_run"));
      }
    };
    poll();
  } catch (e) {
    runBtn.disabled = false;
    runBtn.textContent = t("run");
    toast(t("err_run"));
  }
}

async function saveToHof() {
  const res = state.result;
  if (!res) return;
  const ch = res.champion.test;
  await fetch("/api/hof/save", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      saved_at: Date.now(), symbol: state.symbol, interval: state.interval,
      dna: ch.dna, params: ch.params,
      oos_sharpe: ch.ann_sharpe, oos_ret: ch.total_ret, oos_dd: ch.max_dd,
      oos_trades: ch.trades, train_sharpe: res.champion.train.ann_sharpe,
      naive_sharpe: res.naive.ann_sharpe, source: state.source,
    }),
  });
  toast(t("saved"));
}

/* ─────────────────────────── events ─────────────────────────── */
$("langBtn").addEventListener("click", () => {
  LANG = LANG === "am" ? "en" : "am";
  applyLang();
});

document.getElementById("tabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b === btn));
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + btn.dataset.view));
  if (btn.dataset.view === "hof") renderHof();
  if (btn.dataset.view === "dna") setTimeout(drawCandles, 30);
  if (btn.dataset.view === "evolve" && state.result) setTimeout(() => renderResults(state.result), 30);
});

symbolSel.innerHTML = [
  '<optgroup label="LIVE · Crypto">',
  ...SYMBOLS.filter(s => s.live).map(s => `<option value="${s.id}">${s.name}</option>`),
  '</optgroup><optgroup label="Simulation">',
  ...SYMBOLS.filter(s => !s.live).map(s => `<option value="${s.id}">${s.name}</option>`),
  '</optgroup>',
].join("");
symbolSel.addEventListener("change", () => (state.symbol = symbolSel.value));

intervalSeg.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  intervalSeg.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
  state.interval = b.dataset.iv;
});

barsRange.addEventListener("input", () => {
  state.bars = +barsRange.value;
  barsVal.textContent = state.bars;
});

loadBtn.addEventListener("click", loadData);
$("runBtn").addEventListener("click", runEvolution);
$("copyDna").addEventListener("click", () => copyText($("dnaText").textContent));
$("saveHof").addEventListener("click", saveToHof);

candleCanvas.addEventListener("mousemove", (e) => {
  const rect = candleCanvas.getBoundingClientRect();
  const w = rect.width;
  const n = state.candles.length;
  if (!n) return;
  const step = Math.max(1, Math.ceil(n / (w - 84)));
  const rel = (e.clientX - rect.left - 10) / (w - 84);
  const j = Math.max(0, Math.min(Math.floor(rel * Math.ceil(n / step)), Math.ceil(n / step) - 1));
  candleCanvas._hover = Math.min(n - 1, j * step);
  drawCandles();
});
candleCanvas.addEventListener("mouseleave", () => {
  candleCanvas._hover = undefined;
  drawCandles();
});

window.addEventListener("resize", () => {
  drawCandles();
  if (state.result) renderResults(state.result);
});

/* ─────────────────────────── boot ─────────────────────────── */
applyLang();
loadData();
