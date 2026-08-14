"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Boxes,
  Cpu,
  MessageSquare,
  Radar as RadarIcon,
} from "lucide-react";
import { Panel } from "@/components/hud/Panel";
import { Terminal } from "@/components/core/Terminal";
import { StatusBar } from "@/components/panels/StatusBar";
import { SystemsPanel } from "@/components/panels/SystemsPanel";
import { ThreatPanel } from "@/components/panels/ThreatPanel";
import { ReactorPanel } from "@/components/panels/ReactorPanel";
import { SuitPanel } from "@/components/panels/SuitPanel";
import { TimersPanel } from "@/components/panels/TimersPanel";
import { DevicePanel } from "@/components/panels/DevicePanel";
import { KnowledgePanel } from "@/components/panels/KnowledgePanel";
import { DocsPanel } from "@/components/panels/DocsPanel";
import { useJarvis } from "@/store/jarvis";
import { cn } from "@/lib/utils";

const GREETING = [
  "Good to see you again, sir. All systems are at your disposal.",
  "Welcome back, sir. The workshop is warm and the suits are charged.",
  "Online and attentive, sir. Shall we begin?",
];

type Tab = "command" | "power" | "suit" | "intel";

const TABS: { id: Tab; label: string; icon: typeof Cpu }[] = [
  { id: "command", label: "TALK", icon: MessageSquare },
  { id: "power", label: "POWER", icon: Activity },
  { id: "suit", label: "SUIT", icon: Boxes },
  { id: "intel", label: "INTEL", icon: RadarIcon },
];

export function Dashboard() {
  const push = useJarvis((s) => s.push);
  const tick = useJarvis((s) => s.tick);
  const greeted = useRef(false);
  const [tab, setTab] = useState<Tab>("command");

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

      {/* ---------------------------------------------- desktop: full HUD */}
      <div className="hidden min-h-0 flex-1 gap-3 p-3 lg:grid lg:grid-cols-[280px_minmax(0,1fr)_280px] xl:grid-cols-[330px_minmax(0,1fr)_330px]">
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1.05fr)_minmax(0,0.75fr)] gap-3">
          <ReactorPanel />
          <SystemsPanel />
          <DevicePanel />
        </div>

        <Panel title="COMMAND INTERFACE" badge="VOICE + TEXT" className="min-h-0" bodyClassName="min-h-0">
          <Terminal />
        </Panel>

        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] gap-3">
          <SuitPanel />
          <ThreatPanel />
          <KnowledgePanel />
          <DocsPanel />
        </div>
      </div>

      {/* ------------------------------------- mobile & tablet: tabbed HUD */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="min-h-0 flex-1 overflow-hidden p-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="h-full min-h-0"
            >
              {tab === "command" && (
                <Panel title="COMMAND" badge="VOICE + TEXT" className="h-full min-h-0" bodyClassName="min-h-0">
                  <Terminal />
                </Panel>
              )}

              {tab === "power" && (
                <div className="grid h-full min-h-0 grid-rows-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-2 overflow-y-auto">
                  <ReactorPanel />
                  <SystemsPanel />
                  <DevicePanel />
                </div>
              )}

              {tab === "suit" && (
                <div className="grid h-full min-h-0 grid-rows-[minmax(0,1.6fr)_minmax(0,1fr)] gap-2">
                  <SuitPanel />
                  <TimersPanel />
                </div>
              )}

              {tab === "intel" && (
                <div className="grid h-full min-h-0 grid-rows-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.85fr)] gap-2 overflow-y-auto">
                  <ThreatPanel />
                  <KnowledgePanel />
                  <DocsPanel />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* bottom navigation — thumb reachable, safe-area aware */}
        <nav
          className="flex shrink-0 items-stretch gap-1 border-t border-hud-400/20 bg-void-2/80 px-2 pt-1.5 backdrop-blur"
          style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-sm border transition",
                  active
                    ? "border-hud-300/50 bg-hud-400/15 text-hud-100"
                    : "border-transparent text-hud-400/60 active:bg-hud-400/10",
                )}
              >
                <Icon size={15} />
                <span className="font-display text-[8px] tracking-[0.16em]">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </motion.main>
  );
}
