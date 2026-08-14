# J.A.R.V.I.S.

**Just A Rather Very Intelligent System** — an Iron Man inspired AI assistant.
Say *"Jarvis…"* out loud and he wakes, listens, answers in a British butler's
voice, and actually operates the interface in front of you.

---

## The important part: he works like the films

| Film behaviour                        | How it works here                                                        |
| ------------------------------------- | ------------------------------------------------------------------------ |
| Tony says "Jarvis…" and he responds   | Continuous speech recognition with **wake-word gating**                   |
| Jarvis talks back                     | Queued speech synthesis, British male voice, speaks **while** text streams |
| "Divert power to thrusters" *happens* | Real **tool calling** — the LLM drives the HUD, it does not just describe it |
| Suit assembles around him             | **3D nano-lattice hologram** that assembles piece by piece (WebGL)        |
| Dry, unflappable wit                  | Character-locked system prompt; never breaks role                         |

He never says "I can't do that." With no API key he runs on a built-in intent
engine and **every single tool still works**.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Then either **type** a directive or click the orb / press `Ctrl+Space` and say:

> "**Jarvis**, divert eighty percent to the reactor."

### Optional: a real LLM brain

```bash
cp .env.example .env.local
# add OPENAI_API_KEY=sk-...
```

With a key, conversation is handled by a tool-calling model. Without one, the
offline engine takes over. The transcript footer shows which is active
(`engine · llm` or `engine · local`).

| Script              | Purpose                       |
| ------------------- | ----------------------------- |
| `npm run dev`       | Dev server (Turbopack)        |
| `npm run build`     | Production build              |
| `npm run test`      | Vitest suite                  |
| `npm run lint`      | ESLint + React Compiler rules |
| `npm run typecheck` | `tsc --noEmit`                |

---

## Voice control

- **Wake word** — the mic runs continuously but only acts on speech after
  "jarvis", so ambient conversation is ignored.
- **Self-hearing guard** — capture pauses while he speaks, so he never
  transcribes his own voice.
- **Auto-restart** — browsers end recognition sessions on silence; a
  desired-state flag restarts it until you explicitly stop.
- **Say just "Jarvis"** and he replies *"Yes, sir?"*.

Requires a Chromium-based browser (`webkitSpeechRecognition`). Where
unsupported, the mic button disables itself and typing works unchanged.

---

## What he can do

Everything below is a **tool**, callable by voice, text, or the LLM.

| Tool              | Say something like                        |
| ----------------- | ----------------------------------------- |
| `set_power`       | "divert 80% to the reactor"               |
| `set_subsystem`   | "set repulsors to 60"                     |
| `scan_threats`    | "scan the perimeter" / "anyone out there?" |
| `suit_control`    | "suit up" · "deploy mark VII" · "retract"  |
| `run_protocol`    | "house party protocol" · "lockdown"        |
| `set_status`      | "red alert" · "stand down"                 |
| `start_timer`     | "set a timer for 5 minutes"                |
| `log_note`        | "make a note: buy more palladium"          |
| `play_music`      | "play something"                           |
| `run_diagnostics` | "status report" · "full diagnostics"       |
| `clear_log`       | "clear the log"                            |

---

## Interface

- **Boot sequence** — staged startup with an igniting arc reactor (skippable).
- **Voice orb** — canvas energy rings that react to mic amplitude, thinking and
  speaking states.
- **Arc reactor** — animated SVG core with counter-rotating rings and live output.
- **Suit hologram** — WebGL wireframe armour that assembles from a scatter.
- **Threat matrix** — radar sweep; contacts fade as the beam passes.
- **Subsystems** — six gauges easing toward targets with live noise.
- **Memory** — countdown timers and notes; notes persist across reloads.

---

## Architecture

```
src/
├── app/
│   ├── api/chat/route.ts    NDJSON streaming: LLM tools OR offline brain
│   ├── layout.tsx           self-hosted fonts, metadata
│   └── page.tsx
├── components/
│   ├── core/                BootSequence, Dashboard, Terminal
│   ├── hud/                 ArcReactor, Radar, VoiceOrb, SuitHologram, …
│   └── panels/              StatusBar, Systems, Threat, Reactor, Suit, Timers
├── hooks/                   useSpeech, useSpeechRecognition, useJarvisChat, useNow
├── lib/                     tools (zod schemas), brain (intent engine), utils
└── store/                   jarvis (Zustand + persist)
```

### One contract, two brains

`src/lib/tools.ts` holds zod schemas that are the single source of truth for
three consumers: the LLM route (converted to AI SDK tools), the offline intent
engine, and the client executor. Both brains emit the *same* tool-call shape, so
the HUD behaves identically either way — and the test suite validates every
offline call against the same schemas the LLM is bound to.

### Streaming

`/api/chat` emits newline-delimited JSON:

```jsonc
{"type":"text","value":"Diverting "}      // spoken incrementally
{"type":"tool","name":"set_power","args":{"level":80}}
{"type":"done","engine":"local"}
```

The client appends text into the transcript live, dispatches tool calls to the
store the moment they arrive, and speaks each **sentence** as it completes
rather than waiting for the full reply.

---

## Engineering notes

- **Clean under the React Compiler.** No `setState` in effects, no ref writes
  during render, no impure calls in render. The shared clock is an external
  store (`useNow`) so SSR and client markup match exactly.
- **Deterministic SSR.** Ambient particles use a seeded PRNG, so server and
  client output are byte-identical — no hydration mismatch.
- **Offline-safe fonts.** Self-hosted via `@fontsource-variable`; the build
  never reaches out to Google Fonts.
- **0 npm vulnerabilities.**
- **Tested.** The Vitest suite caught a real bug during development: a `\b`
  anchor after `minute` failed on the plural, so "5 minutes" silently became 60
  seconds. Duration parsing is now pluralisation-aware and range-clamped.
- **Graceful degradation everywhere.** No API key → offline brain. No
  `speechSynthesis` → silent text. No `SpeechRecognition` → mic disabled,
  typing unaffected. Network drop mid-stream → the turn fails safe with an
  in-character message.

---

## Roadmap

- Persistent long-term memory with retrieval
- Multi-turn tool chaining with follow-up questions
- Live external data (real weather, calendar, news)
- Speaker identification for multi-user rooms
