"use client";

import type { Subsystem } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONES: Record<Subsystem["tone"], { bar: string; text: string }> = {
  hud: { bar: "from-hud-500 to-hud-200", text: "text-hud-200" },
  amber: { bar: "from-amber-hud/70 to-amber-hud", text: "text-amber-hud" },
  danger: { bar: "from-danger-hud/70 to-danger-hud", text: "text-danger-hud" },
  ok: { bar: "from-ok-hud/70 to-ok-hud", text: "text-ok-hud" },
};

export function Gauge({ item }: { item: Subsystem }) {
  const tone = TONES[item.tone];
  return (
    <div className="group">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-display text-[9px] tracking-[0.18em] text-hud-300/70">
          {item.label}
        </span>
        <span className={cn("font-display text-[11px] tabular-nums", tone.text)}>
          {item.value.toFixed(1)}
          <span className="ml-0.5 text-[8px] opacity-60">{item.unit}</span>
        </span>
      </div>
      <div className="relative h-[5px] overflow-hidden rounded-full bg-hud-900/60">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-[width] duration-500", tone.bar)}
          style={{ width: `${item.value}%`, filter: "drop-shadow(0 0 4px currentColor)" }}
        />
        {/* segment ticks */}
        <div className="pointer-events-none absolute inset-0 flex justify-between px-[2px]">
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} className="h-full w-px bg-void/45" />
          ))}
        </div>
      </div>
    </div>
  );
}
