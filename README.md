# J.A.R.V.I.S.

**Just A Rather Very Intelligent System** — an Iron Man inspired AI assistant
interface: holographic HUD, live arc-reactor telemetry, a sweeping threat matrix
and a voice-enabled command console.

---

## Tech stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack, React Compiler) |
| UI         | React 19                                          |
| Language   | TypeScript 5 (strict)                             |
| Styling    | Tailwind CSS v4 (CSS-first `@theme` tokens)       |
| Motion     | Motion (Framer Motion successor)                  |
| State      | Zustand 5                                         |
| Icons      | lucide-react                                      |
| Fonts      | Orbitron + JetBrains Mono, self-hosted            |
| Voice      | Web Speech API (`speechSynthesis`)                |

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script              | Purpose                        |
| ------------------- | ------------------------------ |
| `npm run dev`       | Dev server (Turbopack)         |
| `npm run build`     | Production build               |
| `npm run start`     | Serve the production build     |
| `npm run lint`      | ESLint + React Compiler rules  |
| `npm run typecheck` | `tsc --noEmit`                 |

---

## What's in the interface

- **Boot sequence** — staged startup log with an igniting arc reactor. Press any
  key to skip.
- **Command console** — type directives, get JARVIS replies with structured
  readouts. `↑`/`↓` walks command history, `/` focuses the input.
- **Arc reactor** — animated SVG core with counter-rotating rings, coil array
  and a live output arc. Drag the slider to divert power.
- **Subsystems** — six gauges that drift toward their targets with live noise.
- **Threat matrix** — rotating radar sweep with bearing/distance contacts that
  fade as the beam passes.
- **Telemetry** — mode, thermal load, uplink, latency and encryption status.
- **Voice** — JARVIS speaks his replies via the Web Speech API. Toggle with the
  speaker button; degrades silently where unsupported.

## Directives

| Command             | Effect                              |
| ------------------- | ----------------------------------- |
| `status`            | Full systems diagnostic             |
| `scan`              | Sweep the perimeter for contacts    |
| `power <0-100>`     | Divert arc reactor output           |
| `suit up`           | Mark LXXXV deployment sequence      |
| `protocol lockdown` | Seal the facility (also: House Party, Clean Slate) |
| `weather` / `time`  | Conditions and clock                |
| `help`              | Directive index                     |
| `clear`             | Purge the transcript                |

---

## Architecture

```
src/
├── app/                  layout (fonts, metadata), globals.css, page
├── components/
│   ├── core/             BootSequence, Dashboard, Terminal
│   ├── hud/              ArcReactor, Radar, Waveform, Gauge, Panel, Backdrop
│   └── panels/           StatusBar, SystemsPanel, ThreatPanel, ReactorPanel
├── hooks/                useSpeech, useNow
├── lib/                  commands, types, utils
└── store/                jarvis (Zustand)
```

**Notes on the implementation**

- Design tokens live in `globals.css` under Tailwind v4's `@theme` — colours,
  fonts, keyframes and custom `@utility` classes (`hud-panel`, `hud-clip`,
  `text-glow`, `grid-floor`) rather than a JS config.
- The codebase is clean under the **React Compiler** lint rules: no
  `setState`-in-effect and no ref access during render. The shared clock is an
  external store (`useNow`) so SSR and client markup match exactly.
- Ambient particles use a seeded PRNG, keeping server and client output
  identical and avoiding hydration mismatches.
- Fonts are self-hosted from `@fontsource-variable`, so the build never depends
  on reaching Google Fonts at runtime.

---

## Roadmap

- Wire the console to a real LLM backend (streaming responses)
- Speech **recognition** for genuine hands-free operation
- Persistent session memory
- 3D holographic suit viewer (React Three Fiber)
