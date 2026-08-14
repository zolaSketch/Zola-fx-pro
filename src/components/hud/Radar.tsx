"use client";

import { useEffect, useState } from "react";
import type { Threat } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE: Record<Threat["level"], string> = {
  low: "var(--color-ok-hud)",
  medium: "var(--color-amber-hud)",
  high: "var(--color-danger-hud)",
};

export function Radar({ threats, className }: { threats: Threat[]; className?: string }) {
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setSweep((s) => (s + dt * 0.075) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <defs>
          <radialGradient id="sweep-grad">
            <stop offset="0%" stopColor="var(--color-hud-200)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--color-hud-400)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {[92, 69, 46, 23].map((r) => (
          <circle
            key={r}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke="var(--color-hud-400)"
            strokeWidth="0.6"
            opacity="0.28"
          />
        ))}
        <line x1="8" y1="100" x2="192" y2="100" stroke="var(--color-hud-400)" strokeWidth="0.5" opacity="0.22" />
        <line x1="100" y1="8" x2="100" y2="192" stroke="var(--color-hud-400)" strokeWidth="0.5" opacity="0.22" />

        {/* sweep wedge */}
        <g transform={`rotate(${sweep} 100 100)`}>
          <path d="M100 100 L100 8 A92 92 0 0 1 146 20 Z" fill="url(#sweep-grad)" />
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="8"
            stroke="var(--color-hud-200)"
            strokeWidth="1.2"
            opacity="0.85"
          />
        </g>

        {threats.map((t) => {
          const a = ((t.bearing - 90) * Math.PI) / 180;
          const r = t.distance * 90;
          const x = 100 + Math.cos(a) * r;
          const y = 100 + Math.sin(a) * r;
          const delta = Math.abs(((sweep - t.bearing + 540) % 360) - 180);
          const fresh = Math.max(0, 1 - (180 - delta) / 70);
          return (
            <g key={t.id} opacity={0.25 + fresh * 0.75}>
              <circle cx={x} cy={y} r={3.2} fill={TONE[t.level]} />
              <circle
                cx={x}
                cy={y}
                r={3.2 + (1 - fresh) * 9}
                fill="none"
                stroke={TONE[t.level]}
                strokeWidth="0.8"
                opacity={fresh * 0.6}
              />
            </g>
          );
        })}

        {["N", "E", "S", "W"].map((d, i) => {
          const a = ((i * 90 - 90) * Math.PI) / 180;
          return (
            <text
              key={d}
              x={100 + Math.cos(a) * 100}
              y={100 + Math.sin(a) * 100 + 3}
              textAnchor="middle"
              fontSize="8"
              fill="var(--color-hud-300)"
              opacity="0.6"
              className="font-display"
            >
              {d}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
