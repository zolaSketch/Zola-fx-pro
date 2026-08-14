"use client";

import { create } from "zustand";
import type { LogEntry, Speaker, Subsystem, SystemStatus, Threat } from "@/lib/types";
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

let seq = 0;
const nextId = () => `e${Date.now().toString(36)}-${(seq++).toString(36)}`;

interface JarvisState {
  status: SystemStatus;
  bootProgress: number;
  power: number;
  log: LogEntry[];
  subsystems: Subsystem[];
  threats: Threat[];
  muted: boolean;
  thinking: boolean;

  setStatus: (s: SystemStatus) => void;
  setBootProgress: (n: number) => void;
  setPower: (n: number) => void;
  setThinking: (v: boolean) => void;
  toggleMute: () => void;
  push: (speaker: Speaker, text: string, extra?: Partial<LogEntry>) => void;
  clearLog: () => void;
  tick: () => void;
  setSubsystem: (id: string, target: number) => void;
  scanThreats: () => void;
}

export const useJarvis = create<JarvisState>((set, get) => ({
  status: "booting",
  bootProgress: 0,
  power: 96,
  log: [],
  subsystems: INITIAL_SUBSYSTEMS,
  threats: INITIAL_THREATS,
  muted: false,
  thinking: false,

  setStatus: (status) => set({ status }),
  setBootProgress: (bootProgress) => set({ bootProgress: clamp(bootProgress, 0, 100) }),
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

  push: (speaker, text, extra) =>
    set((s) => ({
      log: [...s.log, { id: nextId(), speaker, text, at: Date.now(), ...extra }].slice(-120),
    })),

  clearLog: () => set({ log: [] }),

  setSubsystem: (id, target) =>
    set((s) => ({
      subsystems: s.subsystems.map((x) =>
        x.id === id ? { ...x, target: clamp(target, 0, 100) } : x,
      ),
    })),

  tick: () =>
    set((s) => ({
      subsystems: s.subsystems.map((x) => {
        const noise = (Math.random() - 0.5) * x.drift;
        const pull = (x.target - x.value) * 0.18;
        return { ...x, value: clamp(x.value + pull + noise, 0, 100) };
      }),
      threats: s.threats.map((t) => ({
        ...t,
        bearing: (t.bearing + (Math.random() * 1.6 - 0.4)) % 360,
        distance: clamp(t.distance + (Math.random() - 0.5) * 0.012, 0.12, 0.95),
      })),
    })),

  scanThreats: () => {
    const labels = [
      "UNREGISTERED DRONE",
      "THERMAL SIGNATURE",
      "ENCRYPTED BURST",
      "ORBITAL DEBRIS",
      "GHOST CONTACT",
    ];
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
    get().push("jarvis", `Sweep complete. ${count} contacts resolved within perimeter.`, {
      tone: threats.some((t) => t.level === "high") ? "warn" : "ok",
      meta: threats.map(
        (t) => `${t.label} · BRG ${t.bearing.toFixed(0)}° · ${(t.distance * 12).toFixed(1)} km · ${t.level.toUpperCase()}`,
      ),
    });
  },
}));
