"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  active: boolean;
  className?: string;
  bars?: number;
}

/** Canvas voice-print bar visualiser. Idles low, surges when active. */
export function Waveform({ active, className, bars = 48 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);

  // Mirror the prop into a ref so the rAF loop reads the latest value without
  // being torn down and rebuilt on every toggle.
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const phases = Array.from({ length: bars }, (_, i) => i * 0.42);
    const levels = new Float32Array(bars);
    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, width * dpr);
      canvas.height = Math.max(1, height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, w, h);
      t += 0.055;

      const gap = 2;
      const bw = Math.max(1.5, w / bars - gap);
      const mid = h / 2;

      for (let i = 0; i < bars; i++) {
        const env = Math.sin((i / bars) * Math.PI); // taper at edges
        const wobble =
          Math.sin(t * 1.7 + phases[i]) * 0.5 + Math.sin(t * 3.1 + phases[i] * 1.9) * 0.32;
        const target = activeRef.current
          ? (0.22 + Math.abs(wobble) * 0.95) * env
          : (0.05 + Math.abs(wobble) * 0.1) * env;
        levels[i] += (target - levels[i]) * 0.22;

        const bh = Math.max(1.5, levels[i] * (h * 0.92));
        const x = i * (bw + gap);
        const grad = ctx.createLinearGradient(0, mid - bh / 2, 0, mid + bh / 2);
        grad.addColorStop(0, "rgba(166,234,255,0.95)");
        grad.addColorStop(0.5, "rgba(51,199,255,0.85)");
        grad.addColorStop(1, "rgba(5,107,163,0.5)");
        ctx.fillStyle = grad;
        ctx.shadowBlur = activeRef.current ? 10 : 3;
        ctx.shadowColor = "rgba(109,220,255,0.7)";
        ctx.beginPath();
        ctx.roundRect(x, mid - bh / 2, bw, bh, bw / 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [bars]);

  return <canvas ref={ref} className={cn("h-full w-full", className)} />;
}
