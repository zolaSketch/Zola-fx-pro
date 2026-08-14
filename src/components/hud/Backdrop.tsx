"use client";

import { useMemo } from "react";
import { seeded } from "@/lib/utils";

/** Ambient layers: grid floor, drifting particles, scanline, vignette. */
export function Backdrop() {
  const particles = useMemo(() => {
    const rnd = seeded(20260814);
    return Array.from({ length: 42 }, () => ({
      left: rnd() * 100,
      top: rnd() * 100,
      size: 1 + rnd() * 2.2,
      delay: rnd() * 8,
      dur: 8 + rnd() * 14,
      op: 0.15 + rnd() * 0.5,
    }));
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* grid floor with perspective */}
      <div
        className="grid-floor absolute inset-x-[-40%] bottom-[-30%] h-[70%] opacity-45"
        style={{ transform: "perspective(520px) rotateX(72deg)", maskImage: "linear-gradient(to top, black, transparent 78%)" }}
      />
      {/* top arc glow */}
      <div
        className="absolute inset-x-0 top-0 h-[45%]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--color-hud-500) 16%, transparent), transparent 70%)",
        }}
      />
      {/* particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-hud-200"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: p.op,
            boxShadow: "0 0 6px currentColor",
            animation: `pulse-hud ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      {/* scanline */}
      <div
        className="absolute inset-x-0 h-24 animate-[scan_7s_linear_infinite]"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-hud-300) 9%, transparent), transparent)",
        }}
      />
      {/* CRT line texture */}
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.72) 100%)" }}
      />
    </div>
  );
}
