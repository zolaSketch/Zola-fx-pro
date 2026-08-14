"use client";

import { Panel } from "@/components/hud/Panel";
import { Radar } from "@/components/hud/Radar";
import { useJarvis } from "@/store/jarvis";
import { cn } from "@/lib/utils";

const LEVEL = {
  low: "text-ok-hud border-ok-hud/40",
  medium: "text-amber-hud border-amber-hud/40",
  high: "text-danger-hud border-danger-hud/50",
} as const;

export function ThreatPanel() {
  const threats = useJarvis((s) => s.threats);
  const runTool = useJarvis((s) => s.runTool);

  return (
    <Panel title="THREAT MATRIX" badge={`${threats.length} CONTACTS`} bodyClassName="flex flex-col gap-2">
      <Radar threats={threats} className="mx-auto max-w-[200px]" />

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {threats.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-2 border-l border-hud-400/25 pl-2 text-[10px]"
          >
            <span className="truncate text-hud-200/85">{t.label}</span>
            <span className="shrink-0 tabular-nums text-hud-400/70">
              {t.bearing.toFixed(0)}° · {(t.distance * 12).toFixed(1)}km
            </span>
            <span
              className={cn(
                "shrink-0 rounded-sm border px-1 font-display text-[8px] tracking-[0.12em]",
                LEVEL[t.level],
              )}
            >
              {t.level.toUpperCase()}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => runTool({ name: "scan_threats", args: { focus: "all" } })}
        className="shrink-0 rounded-sm border border-hud-300/35 bg-hud-500/5 py-1.5 font-display text-[9px] tracking-[0.22em] text-hud-200 transition hover:bg-hud-400/15 hover:text-white"
      >
        INITIATE SWEEP
      </button>
    </Panel>
  );
}
