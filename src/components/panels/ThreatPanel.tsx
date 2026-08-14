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
  const live = useJarvis((s) => s.radarLive);
  const radiusKm = useJarvis((s) => s.radarRadiusKm);

  return (
    <Panel
      title={live ? "AIR TRAFFIC" : "THREAT MATRIX"}
      badge={live ? `LIVE · ${threats.length} · ${radiusKm}km` : `${threats.length} CONTACTS`}
      bodyClassName="flex flex-col gap-2"
    >
      <Radar threats={threats} className="mx-auto max-w-[200px]" />

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {threats.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-2 border-l border-hud-400/25 pl-2 text-[10px]"
          >
            <span className="truncate text-hud-200/85">{t.label}</span>
            <span className="shrink-0 tabular-nums text-hud-400/70">
              {t.bearing.toFixed(0)}° · {(t.distance * radiusKm).toFixed(t.distance * radiusKm < 10 ? 1 : 0)}km
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

      <div className="grid shrink-0 grid-cols-2 gap-1.5">
        <button
          onClick={() => runTool({ name: "air_traffic", args: { radiusKm: 150 } })}
          className="min-h-9 rounded-sm border border-ok-hud/40 bg-ok-hud/10 py-1.5 font-display text-[9px] tracking-[0.16em] text-ok-hud transition hover:bg-ok-hud/20"
        >
          LIVE AIRCRAFT
        </button>
        <button
          onClick={() => runTool({ name: "scan_threats", args: { focus: "all" } })}
          className="min-h-9 rounded-sm border border-hud-300/35 bg-hud-500/5 py-1.5 font-display text-[9px] tracking-[0.16em] text-hud-200 transition hover:bg-hud-400/15 hover:text-white"
        >
          SIMULATE
        </button>
      </div>
    </Panel>
  );
}
