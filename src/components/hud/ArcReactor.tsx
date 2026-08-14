"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  power: number;
  active?: boolean;
  className?: string;
}

export function ArcReactor({ power, active = true, className }: Props) {
  const coils = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  const intensity = Math.max(0.18, power / 100);

  return (
    <div className={cn("relative aspect-square w-full max-w-[260px]", className)}>
      {/* outer bloom */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-700"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-hud-300) 55%, transparent) 0%, transparent 68%)",
          opacity: active ? intensity * 0.9 : 0.08,
        }}
      />

      <svg viewBox="0 0 200 200" className="relative h-full w-full">
        <defs>
          <radialGradient id="core-grad">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="42%" stopColor="var(--color-hud-200)" stopOpacity="0.92" />
            <stop offset="100%" stopColor="var(--color-hud-600)" stopOpacity="0.25" />
          </radialGradient>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-hud-200)" />
            <stop offset="100%" stopColor="var(--color-hud-700)" />
          </linearGradient>
        </defs>

        {/* rotating outer ring with ticks */}
        <g
          className={active ? "animate-[spin_28s_linear_infinite]" : ""}
          style={{ transformOrigin: "100px 100px" }}
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="1"
            opacity="0.55"
          />
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const long = i % 5 === 0;
            const r1 = long ? 80 : 85;
            return (
              <line
                key={i}
                x1={100 + Math.cos(a) * r1}
                y1={100 + Math.sin(a) * r1}
                x2={100 + Math.cos(a) * 90}
                y2={100 + Math.sin(a) * 90}
                stroke="var(--color-hud-300)"
                strokeWidth={long ? 1.4 : 0.6}
                opacity={long ? 0.75 : 0.32}
              />
            );
          })}
        </g>

        {/* counter-rotating ring */}
        <g
          className={active ? "animate-[spin-reverse_18s_linear_infinite]" : ""}
          style={{ transformOrigin: "100px 100px" }}
        >
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke="var(--color-hud-400)"
            strokeWidth="0.8"
            strokeDasharray="18 8 4 8"
            opacity="0.6"
          />
        </g>

        {/* coil housing */}
        <circle
          cx="100"
          cy="100"
          r="58"
          fill="none"
          stroke="var(--color-hud-500)"
          strokeWidth="8"
          opacity="0.18"
        />
        {coils.map((i) => {
          const a = (i / coils.length) * Math.PI * 2 - Math.PI / 2;
          const cx = 100 + Math.cos(a) * 58;
          const cy = 100 + Math.sin(a) * 58;
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="9"
                fill="var(--color-void-2)"
                stroke="var(--color-hud-400)"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <circle
                cx={cx}
                cy={cy}
                r="4.5"
                fill="var(--color-hud-200)"
                opacity={active ? 0.35 + intensity * 0.6 : 0.1}
                style={{
                  animation: active
                    ? `pulse-hud ${2.2 + i * 0.11}s ease-in-out infinite`
                    : undefined,
                }}
              />
            </g>
          );
        })}

        {/* triangle core */}
        <g style={{ transformOrigin: "100px 100px" }}>
          <circle cx="100" cy="100" r="42" fill="url(#core-grad)" opacity={active ? intensity : 0.12} />
          <polygon
            points="100,66 129,116 71,116"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            opacity={active ? 0.85 : 0.15}
            style={{ filter: "drop-shadow(0 0 8px var(--color-hud-200))" }}
          />
          <polygon
            points="100,78 120,112 80,112"
            fill="#ffffff"
            opacity={active ? intensity * 0.85 : 0.08}
          />
          <circle cx="100" cy="100" r="10" fill="#ffffff" opacity={active ? intensity : 0.1} />
        </g>

        {/* power arc */}
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke="var(--color-hud-200)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${(power / 100) * 527.8} 527.8`}
          transform="rotate(-90 100 100)"
          opacity="0.9"
          style={{ filter: "drop-shadow(0 0 6px var(--color-hud-300))", transition: "stroke-dasharray .6s ease" }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-1">
        <span className="font-display text-[11px] tracking-[0.35em] text-hud-300/70">OUTPUT</span>
        <span className="font-display text-2xl leading-none text-white text-glow tabular-nums">
          {power.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
