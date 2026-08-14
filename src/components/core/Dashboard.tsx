"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Panel } from "@/components/hud/Panel";
import { Terminal } from "@/components/core/Terminal";
import { StatusBar } from "@/components/panels/StatusBar";
import { SystemsPanel } from "@/components/panels/SystemsPanel";
import { ThreatPanel } from "@/components/panels/ThreatPanel";
import { ReactorPanel } from "@/components/panels/ReactorPanel";
import { SuitPanel } from "@/components/panels/SuitPanel";
import { TimersPanel } from "@/components/panels/TimersPanel";
import { useJarvis } from "@/store/jarvis";

const GREETING = [
  "Good to see you again, sir. All systems are at your disposal.",
  "Welcome back, sir. The workshop is warm and the suits are charged.",
  "Online and attentive, sir. Shall we begin?",
];

export function Dashboard() {
  const push = useJarvis((s) => s.push);
  const tick = useJarvis((s) => s.tick);
  const greeted = useRef(false);

  // Single global heartbeat drives telemetry, timers and suit assembly.
  useEffect(() => {
    const id = setInterval(tick, 600);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    push("system", "", {
      meta: [
        "SESSION ESTABLISHED · AES-256-GCM",
        "BIOMETRIC LOCK ENGAGED",
        'VOICE CONTROL READY · SAY "JARVIS…"',
      ],
    });
    const t = setTimeout(() => {
      push("jarvis", GREETING[Math.floor(Math.random() * GREETING.length)], { tone: "ok" });
    }, 600);
    return () => clearTimeout(t);
  }, [push]);

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 flex h-dvh flex-col"
    >
      <StatusBar />

      <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[280px_minmax(0,1fr)_280px] xl:grid-cols-[330px_minmax(0,1fr)_330px]">
        {/* left column */}
        <div className="hidden min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1.1fr)] gap-3 lg:grid">
          <ReactorPanel />
          <SystemsPanel />
        </div>

        {/* centre — conversation */}
        <Panel title="COMMAND INTERFACE" badge="VOICE + TEXT" className="min-h-0" bodyClassName="min-h-0">
          <Terminal />
        </Panel>

        {/* right column */}
        <div className="hidden min-h-0 grid-rows-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.7fr)] gap-3 lg:grid">
          <SuitPanel />
          <ThreatPanel />
          <TimersPanel />
        </div>
      </div>
    </motion.main>
  );
}
