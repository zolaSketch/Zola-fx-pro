# J.A.R.V.I.S.

**Just A Rather Very Intelligent System** — an Iron Man inspired AI assistant.
Say *"Jarvis…"* out loud and he wakes, listens, answers in a British butler's
voice, and actually operates the interface in front of you.

He does **real work**: live weather, real knowledge lookup, exact arithmetic,
genuine device telemetry, and memory that persists across sessions.

---

## Quick start

```bash
npm install
npm run dev                    # http://localhost:3000
```

Click the orb (or press `Ctrl+Space`) and say:

> "**Jarvis**, what's the weather in Tokyo?"

### Do I need an API key?

**No.** JARVIS is fully functional without one. A key only upgrades the
*conversation* to an LLM; every capability works either way.

| | No key | With `OPENAI_API_KEY` |
| --- | --- | --- |
| All 20+ tools | ✅ | ✅ |
| Offline knowledge core | ✅ | ✅ |
| Live weather, lookup, rates | ✅ | ✅ |
| Voice in and out | ✅ | ✅ |
| Memory and recall | ✅ | ✅ |
| Free-form chat | rule-based | LLM |

To enable the LLM: `cp .env.example .env.local` and add your key.

### On your phone

The HUD is fully responsive and installable as a PWA.

```bash
npm run dev
# open http://<your-computer-ip>:3000 on the phone, same Wi-Fi
```

Below `lg` the three columns collapse into four thumb-reachable tabs —
**TALK · POWER · SUIT · INTEL** — with safe-area insets for notches, 16px
inputs so iOS never zooms on focus, and 44px touch targets. Use *Add to Home
Screen* to run it fullscreen as an app.

> Voice **input** needs Chrome/Edge on Android. iOS Safari does not implement
> `SpeechRecognition`, so the mic disables itself there — typing and JARVIS's
> spoken replies still work.

---

## Real vs. simulated — an honest table

This is a Stark-fantasy HUD, so some things are theatre. Here is exactly which
is which.

| Genuinely real                                          | Deliberately simulated        |
| ------------------------------------------------------- | ----------------------------- |
| **Knowledge federation — 13 providers** (see below)      | Arc reactor output            |
| Weather + 3-day forecast (Open-Meteo, live)              | Repulsors, thrusters, armour  |
| Arithmetic (a real parser, exact results)                | Threat matrix contacts        |
| Time in any IANA timezone                                | Suit deployment               |
| Battery, network type, RTT, JS heap, CPU cores, live FPS | Stark protocols               |
| Persistent memory with semantic recall (IndexedDB)       |                               |
| Speech recognition and synthesis                         |                               |
| LLM conversation with tool calling                       |                               |

No invented figures are ever presented as real data. If a live source is
unreachable, JARVIS says so in character rather than fabricating a number.

---

## Knowledge

> **On "all the world's knowledge":** that cannot live in a repository —
> Wikipedia alone is ~100 GB. What *is* achievable, and what this implements,
> is **federated access** to a large slice of it, plus an **offline core** so
> JARVIS is never entirely ignorant without a network.

A router classifies each question into a domain, then queries the right
specialists. Offline providers answer instantly; network providers race in
parallel and the highest-confidence answer wins.

### Resident (no network, instant)

| Core           | Contents                                                |
| -------------- | ------------------------------------------------------- |
| Periodic table | All **118 elements** — symbol, Z, mass, category         |
| Constants      | **20 CODATA constants** — c, G, h, Nₐ, k_B, α…           |
| Astronomy      | **11 bodies** — planets, Sun, Moon, Pluto                |
| Units          | **40+ units** across 6 dimensions, plus temperature      |
| Number theory  | Primes, factorisation, GCD/LCM, bases, Roman numerals    |
| Astronomy      | Sunrise/sunset (NOAA), moon phase, day length            |
| Geodesy        | Great-circle distance and bearing (haversine)            |
| Colour         | Hex/RGB/HSL, WCAG luminance and legible foreground       |
| Text           | Word/sentence counts, Flesch readability, reading time   |
| Security       | CSPRNG passwords with entropy, SHA-1/256/384/512, Base64 |
| Chance         | Dice notation, coin flips, secure random numbers         |

```
"what is the speed of light"        → 2.997925e+8 m/s          (CODATA)
"tell me about the element gold"    → Au, Z=79, 196.97 u       (periodic table)
"how big is jupiter"                → 69,911 km radius         (astronomy)
"convert 100 km to miles"           → 62.137 miles             (units)
"is 7919 prime"                     → yes                      (number theory)
"45 in roman numerals"              → XLV                      (number theory)
"roll 3d6"                          → 10                       (secure random)
"generate a password"               → 131 bits of entropy      (CSPRNG)
"what is the moon phase"            → New Moon, 2% illuminated (lunar)
"#ff8800"                           → HSL, luminance, contrast (colour)
```

All of the above are **exact and computed**, not fetched — no key, no network,
no rate limit.

### Federated (live network)

Wikipedia (summary + full-text search) · DuckDuckGo · Dictionary API ·
REST Countries · Frankfurter/ECB exchange rates · CoinGecko · Open Library ·
Numbers API

```
"define serendipity"     "capital of Japan"     "100 usd to eur"
"bitcoin price"          "who wrote Dune"       "who is Nikola Tesla"
```

Every provider is optional. If one is unreachable the router simply uses the
next, and if nothing answers JARVIS says so rather than inventing a fact.

---

## The brain

`/api/chat` streams newline-delimited JSON and runs one of two brains:

- **With `OPENAI_API_KEY`** — a real tool-calling LLM. Server tools execute on
  the server and their output is fed *back into the model*, so it reasons about
  genuine data before replying.
- **Without a key** — a deterministic intent engine. **Every tool still works**,
  including the live network ones. He never degrades to "I can't do that."

If the LLM is unreachable mid-request, the turn fails over to local cognition
in ~2 seconds and the HUD shows a notice. It never hangs and never dead-ends.

### Works with any OpenAI-compatible endpoint

The route calls **Chat Completions** (not the newer Responses API), so
`OPENAI_BASE_URL` can point at OpenAI, a corporate proxy, OpenRouter, or a
local model server such as Ollama, LM Studio or vLLM:

```bash
OPENAI_BASE_URL=http://localhost:11434/v1
JARVIS_MODEL=llama3.1
```

---

## Voice

- **Wake word** — the mic runs continuously but only acts on speech following
  "jarvis", so ambient conversation is ignored.
- **Self-hearing guard** — capture pauses while he speaks.
- **Auto-restart** — browsers end recognition on silence; a desired-state flag
  restarts it until you explicitly stop.
- **Sentence streaming** — he begins speaking the first sentence while the rest
  is still generating.
- Say just **"Jarvis"** and he replies *"Yes, sir?"*

Needs a Chromium-based browser for input. Where unsupported, the mic disables
itself and typing is unaffected.

---

## Tools

| Tool              | Try saying                             | Real?         |
| ----------------- | -------------------------------------- | ------------- |
| `get_weather`     | "what's the weather in Tokyo"          | ✅ live API   |
| `web_lookup`      | "who is Nikola Tesla"                  | ✅ live API   |
| `calculate`       | "what is 15 times 24 plus 7"           | ✅ exact      |
| `get_time`        | "what time is it in Tokyo"             | ✅ real       |
| `read_device`     | "what's my battery"                    | ✅ real       |
| `remember`        | "remember that I take my coffee black" | ✅ persistent |
| `recall`          | "what do you remember about me"        | ✅ semantic   |
| `set_power`       | "divert 80% to the reactor"            | HUD           |
| `set_subsystem`   | "set repulsors to 60"                  | HUD           |
| `scan_threats`    | "scan the perimeter"                   | HUD           |
| `suit_control`    | "suit up" · "deploy mark VII"          | HUD           |
| `run_protocol`    | "house party protocol" · "lockdown"    | HUD           |
| `set_status`      | "red alert" · "stand down"             | HUD           |
| `start_timer`     | "set a timer for 5 minutes"            | HUD           |
| `run_diagnostics` | "status report"                        | HUD           |

---

## Memory

Facts persist in IndexedDB and are retrieved by **TF-IDF cosine similarity**
over stop-word-filtered tokens, weighted by recency and reinforced on each
successful recall.

This runs entirely on-device: no embedding API, no key, no network. Recall
works offline, and nothing you tell him leaves the machine unless you enable
the LLM.

```
"remember that I take my coffee black"   → stored
"how do I like my coffee?"               → recalls it, days later
```

---

## Architecture

```
src/
├── app/api/chat/route.ts    NDJSON streaming; LLM tools OR offline brain
├── components/
│   ├── core/                BootSequence, Dashboard, Terminal
│   ├── hud/                 ArcReactor, Radar, VoiceOrb, SuitHologram, …
│   └── panels/              Systems, Threat, Reactor, Suit, Device, Timers
├── hooks/                   useSpeech, useSpeechRecognition, useJarvisChat
├── lib/
│   ├── knowledge/           router · offline core · 20 providers · compute
│   ├── capabilities/        weather · search · calc · device  (real work)
│   ├── tools.ts             zod schemas — the single source of truth
│   ├── brain.ts             offline intent engine
│   └── memory.ts            IndexedDB + semantic ranking
└── store/                   jarvis (Zustand + persist)
```

### One contract, two brains

`lib/tools.ts` holds zod schemas used by **four** consumers: the LLM route, the
offline engine, the client executor, and the test suite. Both brains emit the
same tool-call shape, so the HUD behaves identically either way — and tests
validate every offline call against the schemas the LLM is bound to.

Tools are split by where they must run: **server tools** (network, computation)
execute in the route so the model can reason about their results; **HUD tools**
are forwarded to the browser, which owns that state.

---

## Testing

**188 tests.** Run with `npm test`.

The suite is not decoration — it caught three real bugs during development:

1. **Duration parsing** — `\b` after `minute` failed on the plural, so
   "5 minutes" silently became 60 seconds.
2. **Lexer whitespace** — stripping spaces up front fused `"1 2"` into `12`
   instead of rejecting it.
3. **Plural regex, twice more** — `\b` after a singular noun fails on the
   plural. After "minutes" it recurred with "roman numerals", silently
   misrouting the query in three separate files. `knowledge.test.ts` now pins
   both singular and plural forms.
4. **Intent precedence** — the `lookup` rule matches any question word, so it
   was shadowing weather, time and device queries. Adding unit conversion
   reopened the same hazard ("convert 100 km to miles" contains digits and was
   nearly parsed as arithmetic). `routing.test.ts` now pins the full ordering.

The knowledge core is also property-tested: all 118 elements must have valid
symbols and unique identifiers, planets must be ordered outward from the Sun,
constants must match on whole words only (so "c" does not fire inside "cats"),
and offline providers are asserted to make **no network calls at all**.

The calculator is a **recursive-descent parser, never `eval`**, because it
receives untrusted input from voice and LLM output. 14 escape attempts
(`process`, `require`, `constructor`, `__proto__`, IIFEs…) are tested and
rejected.

Network capabilities are tested against recorded response shapes, so CI does
not depend on third-party uptime.

---

## Engineering notes

- **Clean under the React Compiler** — no `setState` in effects, no ref writes
  during render, no impure calls in render.
- **Deterministic SSR** — seeded PRNG for ambient particles; no hydration
  mismatch.
- **0 npm vulnerabilities** (required upgrading `@ai-sdk/openai` to v4 to clear
  a vulnerable `undici` chain).
- **Offline-safe fonts** — self-hosted; the build never calls Google Fonts.
- **Degrades everywhere** — no key, no speech APIs, no network, no WebGL, or a
  dropped stream: each fails soft and in character.

## Security

`.env.local` is gitignored and never committed. **Rotate any key that has been
pasted into a chat, issue tracker or shared terminal** — treat it as public.

---

## Roadmap

- Calendar and email integration
- Speaker identification for multi-user rooms
- Vector embeddings for memory when a key is present
- Home automation bridge (Matter / Home Assistant)
