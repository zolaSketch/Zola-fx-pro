# 🧬 ZOLA MarketDNA — የገበያ ዲኤንኤ ላብ

**The world's first Amharic-first quant intelligence lab** — an open-source
platform where AI learns the market's "weather" (regimes) and breeds trading
strategies through Darwinian evolution, validated by walk-forward analysis so
fake backtests can't fool you.

> በአለም የመጀመሪያ አማርኛ-ተኮር ኳንት ኢንተሊጀንስ ላብ — AI የገበያውን "የአየር ሁኔታ" ተምሮ
> ዳርዊናዊ ዝግመተ ለውጥ በመጠቀም ስትራቴጂ የሚፈጥር፣ እውነተኛ ውጤትን ብቻ የሚያሳይ መድረክ።

---

## ✨ Why this is different

| | Typical tools | ZOLA MarketDNA |
|---|---|---|
| Language | English only | **Amharic-first** (120M+ speakers, first mover) + English |
| Signals | Lagging indicators | **Learned market regimes** (unsupervised ML on volatility / trend / momentum / distance) |
| Strategy building | Manual or naive optimizer | **Genetic evolution** — populations of genomes compete, cross over, mutate |
| Validation | Pretty in-sample backtest | **Walk-forward out-of-sample** — the genome must win on data it never saw |
| Honesty | Hidden | **Honesty report** — in-sample vs out-of-sample vs naive, side by side |
| Stack | Heavy, closed | **Zero dependencies** — pure Python stdlib + vanilla JS, 100% open source |

## 🚀 Run it

```bash
cd marketdna
python3 server.py          # http://localhost:8000  (pure stdlib — nothing to install)
```

Open the app, and:

1. **ገበያ ዲኤንኤ (Market DNA)** — load live crypto data (Binance → Coinbase →
   CoinGecko, fetched from your browser) or offline simulation; every candle is
   coloured by the regime the AI learned: ረጋ ያለ (calm), ጭማሪ (uptrend),
   ቅናሽ (downtrend), ማዕበል (storm).
2. **ስትራቴጂ ኢቮልቨር (Evolver)** — breed a strategy genome. Each genome encodes
   8 genes (SMA fast/slow, RSI thresholds, ATR stop/target, risk %, regime
   mask). The GA optimises on training windows only; the champion is the one
   with the best **out-of-sample** score.
3. **የክብር አዳራሽ (Hall of Fame)** — save champions, copy their DNA code, share it.

A full walk-forward evolution of 16 genomes × 14 generations × 3 folds over
1,000 bars takes **~1–2 seconds** in pure Python.

## 🧬 The genome

```text
Z1|f13-80|r36-85|a5.0-7.6|k1.0|m11
 │   │  │   │   │   │   │   └─ regime mask (bit 0=calm 1=up 2=down 3=storm)
 │   │  │   │   │   │   └─ risk % per trade
 │   │  │   │   │   └─ ATR take-profit multiple
 │   │  │   │   └─ ATR stop multiple
 │   │  │   └─ RSI sell threshold
 │   │  └─ RSI buy threshold
 │   └─ fast/slow SMA lengths
 └─ schema version
```

## 🏗️ Architecture

```
marketdna/
├── server.py              # zero-dependency HTTP server (stdlib only)
├── engine/
│   ├── indicators.py      # SMA/EMA/RSI/ATR/ROC suite, precomputed once
│   ├── synth.py           # seeded regime-switching synthetic market (offline mode)
│   ├── regimes.py         # k-means regime fingerprinting (4 market states)
│   ├── backtest.py        # bar-by-bar simulator: fees, slippage, ATR brackets
│   └── evolve.py          # GA + walk-forward validation + honesty report
└── static/                # vanilla JS frontend (i18n AM/EN, canvas charts)
```

**API**: `GET /api/synth` · `POST /api/regimes` · `POST /api/evolve` ·
`GET /api/job?id=` · `GET/POST /api/hof/*`

## 💰 How this becomes famous + profitable

1. **Fame** — the repo itself is the product. Open-source + "evolve in public"
   (daily: what did the DNA learn today?) + a public live leaderboard where
   genomes compete with proof-of-performance. Trust through radical
   transparency is the moat.
2. **Money (freemium SaaS)** — free local core → paid cloud evolution (bigger
   populations, more symbols, multi-year data), Telegram alert bots, and a
   marketplace fee when champion genomes are sold between users.
3. **Education** — the first Amharic quant academy, built on this tool.
4. **Enterprise/API** — licence the honesty engine for broker/fund compliance
   (anti-fake-backtest reporting).

## ⚠️ Honest disclaimer

This is a research and education tool, **not financial advice**. Backtests —
even walk-forward ones — are no guarantee of future performance. The whole
point of the honesty engine is to make that visible instead of hiding it.
