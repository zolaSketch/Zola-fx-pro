"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Panel } from "@/components/hud/Panel";
import { Terminal } from "@/components/core/Terminal";
import { StatusBar } from "@/components/panels/StatusBar";
import { SystemsPanel } from "@/components/panels/SystemsPanel";
import { ThreatPanel } from "@/components/panels/ThreatPanel";
import { ReactorPanel } from "@/components/panels/ReactorPanel";
import { useJarvis } from "@/store/jarvis";

const GREETING = [
  "Good to see you again, sir. All systems are at your disposal.",
  "Welcome back, sir. The workshop is warm and the suits are charged.",
  "Online and attentive, sir. Shall we begin?",
];

export function Dashboard() {
  const push = useJarvis((s) => s.push);
  const setStatus = useJarvis((s) => s.setStatus);
  const greeted = useRef(false);

  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    setStatus("online");
    push("system", "Session established · encryption AES-256 · biometric lock engaged");
    const t = setTimeout(() => {
      push("jarvis", GREETING[Math.floor(Math.random() * GREETING.length)], {
        tone: "ok",
        meta: ["Type 'help' for the directive index"],
      });
    }, 700);
    return () => clearTimeout(t);
  }, [push, setStatus]);

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 flex h-dvh flex-col"
    >
      <StatusBar />

      <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[280px_minmax(0,1fr)_280px] xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        {/* left column */}
        <div className="hidden min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1.15fr)] gap-3 lg:grid">
          <ReactorPanel />
          <SystemsPanel />
        </div>

        {/* centre — conversation */}
        <Panel
          title="COMMAND INTERFACE"
          badge="VOICE + TEXT"
          className="min-h-0"
          bodyClassName="min-h-0"
        >
          <Terminal />
        </Panel>

        {/* right column */}
        <div className="hidden min-h-0 grid-rows-[minmax(0,1.35fr)_minmax(0,1fr)] gap-3 lg:grid">
          <ThreatPanel />
          <TelemetryPanel />
        </div>
      </div>
    </motion.main>
  );
}

function TelemetryPanel() {
  const subsystems = useJarvis((s) => s.subsystems);
  const status = useJarvis((s) => s.status);
  const thermal = subsystems.find((s) => s.id === "thermal");
  const uplink = subsystems.find((s) => s.id === "uplink");

  const rows: [string, string][] = [
    ["MODE", status === "alert" ? "DEFENSIVE" : "STANDBY"],
    ["THERMAL", `${thermal?.value.toFixed(1) ?? "--"} °C`],
    ["UPLINK", `${uplink?.value.toFixed(0) ?? "--"} %`],
    ["LATENCY", "12 ms"],
    ["NODES", "4 / 4 ONLINE"],
    ["ENCRYPTION", "AES-256-GCM"],
  ];

  return (
    <Panel title="TELEMETRY" badge="SECURE" bodyClassName="flex flex-col justify-between gap-2">
      <dl className="space-y-1.5 text-[10px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <dt className="font-display tracking-[0.16em] text-hud-400/60">{k}</dt>
            <span className="mx-1 h-px flex-1 bg-hud-400/15" />
            <dd className="tabular-nums text-hud-200">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-8 gap-1">
        {Array.from({ length: 32 }, (_, i) => (
          <span
            key={i}
            className="h-1.5 rounded-[1px] bg-hud-300"
            style={{
              opacity: 0.12 + ((i * 7) % 9) / 12,
              animation: `pulse-hud ${2.4 + (i % 6) * 0.35}s ease-in-out ${i * 0.06}s infinite`,
            }}
          />
        ))}
      </div>
    </Panel>
  );
}
