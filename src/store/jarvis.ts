"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LogEntry, Speaker, Subsystem, SystemStatus, Threat } from "@/lib/types";
import type { ToolCall } from "@/lib/tools";
import { clamp } from "@/lib/utils";

const INITIAL_SUBSYSTEMS: Subsystem[] = [
  { id: "reactor", label: "ARC REACTOR", value: 96, unit: "%", target: 96, drift: 1.4, tone: "hud" },
  { id: "repulsor", label: "REPULSOR BUS", value: 78, unit: "%", target: 78, drift: 4, tone: "hud" },
  { id: "thrust", label: "FLIGHT THRUST", value: 41, unit: "%", target: 41, drift: 6, tone: "amber" },
  { id: "armor", label: "ARMOR INTEGRITY", value: 100, unit: "%", target: 100, drift: 0.6, tone: "ok" },
  { id: "thermal", label: "THERMAL LOAD", value: 32, unit: "°C", target: 32, drift: 3.2, tone: "amber" },
  { id: "uplink", label: "SAT UPLINK", value: 88, unit: "%", target: 88, drift: 5, tone: "hud" },
];

const INITIAL_THREATS: Threat[] = [
  { id: "t1", label: "UNKNOWN AIRFRAME", bearing: 38, distance: 0.62, level: "medium" },
  { id: "t2", label: "CIVILIAN TRANSPORT", bearing: 142, distance: 0.84, level: "low" },
  { id: "t3", label: "SIGNAL ECHO", bearing: 268, distance: 0.44, level: "low" },
];

export interface Timer {
  id: string;
  label: string;
  endsAt: number;
  done: boolean;
}

export interface Note {
  id: string;
  text: string;
  at: number;
}

export type SuitState = "stowed" | "deploying" | "deployed" | "retracting";

let seq = 0;
const nextId = () => `e${Date.now().toString(36)}-${(seq++).toString(36)}`;

interface JarvisState {
  status: SystemStatus;
  power: number;
  log: LogEntry[];
  subsystems: Subsystem[];
  threats: Threat[];
  timers: Timer[];
  notes: Note[];
  suit: SuitState;
  suitMark: string;
  suitProgress: number;
  nowPlaying: string | null;
  muted: boolean;
  thinking: boolean;
  engine: "llm" | "local" | null;

  setStatus: (s: SystemStatus) => void;
  setPower: (n: number) => void;
  setThinking: (v: boolean) => void;
  setEngine: (e: "llm" | "local" | null) => void;
  toggleMute: () => void;
  push: (speaker: Speaker, text: string, extra?: Partial<LogEntry>) => string;
  appendTo: (id: string, chunk: string) => void;
  updateEntry: (id: string, patch: Partial<LogEntry>) => void;
  clearLog: () => void;
  tick: () => void;
  setSubsystem: (id: string, target: number) => void;
  scanThreats: (focus?: string) => Threat[];
  runTool: (call: ToolCall) => void;
  dismissTimer: (id: string) => void;
}

export const useJarvis = create<JarvisState>()(
  persist(
    (set, get) => ({
      status: "online",
      power: 96,
      log: [],
      subsystems: INITIAL_SUBSYSTEMS,
      threats: INITIAL_THREATS,
      timers: [],
      notes: [],
      suit: "stowed",
      suitMark: "LXXXV",
      suitProgress: 0,
      nowPlaying: null,
      muted: false,
      thinking: false,
      engine: null,

      setStatus: (status) => set({ status }),
      setEngine: (engine) => set({ engine }),

      setPower: (n) => {
        const power = clamp(n, 0, 100);
        set((s) => ({
          power,
          subsystems: s.subsystems.map((x) =>
            x.id === "reactor" ? { ...x, target: power } : x,
          ),
        }));
      },

      setThinking: (thinking) => set({ thinking }),
      toggleMute: () => set((s) => ({ muted: !s.muted })),

      push: (speaker, text, extra) => {
        const id = nextId();
        set((s) => ({
          log: [...s.log, { id, speaker, text, at: Date.now(), ...extra }].slice(-150),
        }));
        return id;
      },

      appendTo: (id, chunk) =>
        set((s) => ({
          log: s.log.map((e) => (e.id === id ? { ...e, text: e.text + chunk } : e)),
        })),

      updateEntry: (id, patch) =>
        set((s) => ({ log: s.log.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),

      clearLog: () => set({ log: [] }),

      setSubsystem: (id, target) =>
        set((s) => ({
          subsystems: s.subsystems.map((x) =>
            x.id === id ? { ...x, target: clamp(target, 0, 100) } : x,
          ),
        })),

      tick: () => {
        const now = Date.now();
        set((s) => {
          const timers = s.timers.map((t) =>
            !t.done && now >= t.endsAt ? { ...t, done: true } : t,
          );
          const justDone = timers.filter(
            (t, i) => t.done && !s.timers[i]?.done,
          );

          // Suit assembly animation.
          let suitProgress = s.suitProgress;
          let suit = s.suit;
          if (s.suit === "deploying") {
            suitProgress = Math.min(100, s.suitProgress + 7);
            if (suitProgress >= 100) suit = "deployed";
          } else if (s.suit === "retracting") {
            suitProgress = Math.max(0, s.suitProgress - 9);
            if (suitProgress <= 0) suit = "stowed";
          }

          return {
            timers,
            suit,
            suitProgress,
            log: justDone.length
              ? [
                  ...s.log,
                  ...justDone.map((t) => ({
                    id: nextId(),
                    speaker: "jarvis" as Speaker,
                    text: `${t.label} has elapsed, sir.`,
                    at: now,
                    tone: "warn" as const,
                  })),
                ].slice(-150)
              : s.log,
            subsystems: s.subsystems.map((x) => {
              const noise = (Math.random() - 0.5) * x.drift;
              const pull = (x.target - x.value) * 0.18;
              return { ...x, value: clamp(x.value + pull + noise, 0, 100) };
            }),
            threats: s.threats.map((t) => ({
              ...t,
              bearing: (t.bearing + (Math.random() * 1.6 - 0.4) + 360) % 360,
              distance: clamp(t.distance + (Math.random() - 0.5) * 0.012, 0.12, 0.95),
            })),
          };
        });
      },

      scanThreats: (focus = "all") => {
        const pools: Record<string, string[]> = {
          orbital: ["ORBITAL DEBRIS", "SATELLITE TRANSIT", "REENTRY OBJECT"],
          thermal: ["THERMAL SIGNATURE", "ENGINE BLOOM", "HEAT PLUME"],
          perimeter: ["PERIMETER BREACH", "GROUND CONTACT", "VEHICLE"],
          all: ["UNREGISTERED DRONE", "THERMAL SIGNATURE", "ENCRYPTED BURST", "GHOST CONTACT"],
        };
        const labels = pools[focus] ?? pools.all;
        const count = 2 + Math.floor(Math.random() * 3);
        const threats: Threat[] = Array.from({ length: count }, (_, i) => {
          const r = Math.random();
          return {
            id: `t${Date.now().toString(36)}${i}`,
            label: labels[Math.floor(Math.random() * labels.length)],
            bearing: Math.random() * 360,
            distance: 0.2 + Math.random() * 0.7,
            level: r > 0.82 ? "high" : r > 0.5 ? "medium" : "low",
          };
        });
        set({ threats });
        return threats;
      },

      dismissTimer: (id) => set((s) => ({ timers: s.timers.filter((t) => t.id !== id) })),

      /** Apply a tool call from either brain to the HUD. */
      runTool: (call) => {
        const s = get();
        const meta = (lines: string[], tone: LogEntry["tone"] = "ok") =>
          s.push("system", "", { meta: lines, tone });

        switch (call.name) {
          case "set_power": {
            const { level } = call.args as { level: number };
            s.setPower(level);
            meta([`ARC REACTOR → ${level}%`], level > 92 ? "warn" : "ok");
            break;
          }
          case "set_subsystem": {
            const { id, level } = call.args as { id: string; level: number };
            s.setSubsystem(id, level);
            meta([`${id.toUpperCase()} → ${level}%`]);
            break;
          }
          case "scan_threats": {
            const { focus } = call.args as { focus?: string };
            const found = s.scanThreats(focus);
            meta(
              found.map(
                (t) =>
                  `${t.label} · BRG ${t.bearing.toFixed(0)}° · ${(t.distance * 12).toFixed(1)} km · ${t.level.toUpperCase()}`,
              ),
              found.some((t) => t.level === "high") ? "warn" : "ok",
            );
            break;
          }
          case "suit_control": {
            const { mark, action } = call.args as { mark: string; action: string };
            set({
              suit: action === "retract" ? "retracting" : "deploying",
              suitMark: mark,
            });
            meta(
              action === "retract"
                ? [`MARK ${mark} · RETRACTING`]
                : [
                    `MARK ${mark} · ASSEMBLY INITIATED`,
                    "Gauntlets · Chestplate · Boots · Helmet",
                  ],
            );
            break;
          }
          case "run_protocol": {
            const { name } = call.args as { name: string };
            const detail: Record<string, string[]> = {
              house_party: ["38 UNITS AIRBORNE", "AUTONOMOUS FLIGHT ENABLED"],
              clean_slate: ["SELF-DESTRUCT ARMED", "AWAITING FINAL CONFIRMATION"],
              lockdown: ["BLAST DOORS SEALED", "EXTERNAL COMMS RESTRICTED"],
              veronica: ["HULKBUSTER DEPLOYING FROM ORBIT", "ETA 90 SECONDS"],
              sentry: ["PASSIVE WATCH ENGAGED", "MOTION TRIPWIRES ARMED"],
            };
            if (name === "lockdown" || name === "clean_slate") s.setStatus("alert");
            meta(
              [`PROTOCOL · ${name.replace("_", " ").toUpperCase()}`, ...(detail[name] ?? [])],
              name === "clean_slate" ? "danger" : "warn",
            );
            break;
          }
          case "set_status": {
            const { status } = call.args as { status: SystemStatus };
            s.setStatus(status);
            meta([`POSTURE → ${status.toUpperCase()}`], status === "alert" ? "danger" : "ok");
            break;
          }
          case "play_music": {
            const { query } = call.args as { query: string };
            set({ nowPlaying: query });
            meta([`NOW PLAYING · ${query.toUpperCase()}`]);
            break;
          }
          case "start_timer": {
            const { seconds, label } = call.args as { seconds: number; label: string };
            set((st) => ({
              timers: [
                ...st.timers,
                { id: nextId(), label, endsAt: Date.now() + seconds * 1000, done: false },
              ],
            }));
            meta([`TIMER · ${label} · ${seconds}s`]);
            break;
          }
          case "log_note": {
            const { text } = call.args as { text: string };
            set((st) => ({
              notes: [{ id: nextId(), text, at: Date.now() }, ...st.notes].slice(0, 50),
            }));
            meta([`NOTE RECORDED · ${text}`]);
            break;
          }
          case "run_diagnostics": {
            const { depth } = call.args as { depth?: string };
            const rows = s.subsystems.map(
              (x) => `${x.label.padEnd(18, ".")} ${x.value.toFixed(1)}${x.unit}`,
            );
            meta(
              depth === "full"
                ? [...rows, "NANO-LATTICE ..... INTACT", "ENCRYPTION ....... AES-256-GCM"]
                : rows,
            );
            break;
          }
          case "clear_log":
            s.clearLog();
            break;
        }
      },
    }),
    {
      name: "jarvis-session",
      storage: createJSONStorage(() => localStorage),
      // Only durable preferences and memory persist; live telemetry resets.
      partialize: (s) => ({
        muted: s.muted,
        notes: s.notes,
        power: s.power,
        suitMark: s.suitMark,
      }),
    },
  ),
);
