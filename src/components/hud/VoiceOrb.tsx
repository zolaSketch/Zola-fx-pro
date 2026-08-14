"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Mode = "idle" | "listening" | "wake" | "thinking" | "speaking";

const RING_COLOR: Record<Mode, string> = {
  idle: "rgba(51,199,255,0.35)",
  listening: "rgba(61,220,151,0.9)",
  wake: "rgba(255,181,71,0.95)",
  thinking: "rgba(51,199,255,0.9)",
  speaking: "rgba(166,234,255,0.95)",
};

/**
 * Reactive voice orb. Renders concentric energy rings on canvas whose
 * amplitude and speed respond to what JARVIS is currently doing — and to real
 * microphone amplitude when a stream is supplied.
 */
export function VoiceOrb({
  mode,
  stream,
  className,
  onClick,
}: {
  mode: Mode;
  stream?: MediaStream | null;
  className?: string;
  onClick?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  const levelRef = useRef(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Live microphone amplitude, when available.
  useEffect(() => {
    if (!stream) {
      levelRef.current = 0;
      return;
    }
    let ctx: AudioContext | null = null;
    let raf = 0;
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);

      const read = () => {
        analyser.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i];
        levelRef.current = Math.min(1, sum / buf.length / 90);
        raf = requestAnimationFrame(read);
      };
      raf = requestAnimationFrame(read);
    } catch {
      /* audio analysis unavailable */
    }
    return () => {
      cancelAnimationFrame(raf);
      void ctx?.close();
    };
  }, [stream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let amp = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const r = canvas.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      const cx = w / 2;
      const cy = h / 2;
      const base = Math.min(w, h) * 0.3;

      ctx.clearRect(0, 0, w, h);
      t += 0.02;

      const m = modeRef.current;
      const target =
        m === "speaking" ? 0.75 : m === "thinking" ? 0.5 : m === "wake" ? 0.6 : m === "listening" ? 0.18 + levelRef.current * 0.8 : 0.08;
      amp += (target - amp) * 0.12;

      const color = RING_COLOR[m];
      const speed = m === "thinking" ? 2.6 : m === "speaking" ? 2.0 : 1.1;

      // wobbling concentric rings
      for (let ring = 0; ring < 4; ring++) {
        const rr = base * (0.55 + ring * 0.22);
        const lobes = 3 + ring;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.06) {
          const wob =
            Math.sin(a * lobes + t * speed + ring) * amp * base * 0.16 +
            Math.sin(a * (lobes + 2) - t * speed * 0.7) * amp * base * 0.08;
          const rad = rr + wob;
          const x = cx + Math.cos(a) * rad;
          const y = cy + Math.sin(a) * rad;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5 - ring * 0.1;
        ctx.lineWidth = ring === 0 ? 2 : 1;
        ctx.shadowBlur = 14;
        ctx.shadowColor = color;
        ctx.stroke();
      }

      // core
      ctx.globalAlpha = 1;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * (0.5 + amp * 0.3));
      grad.addColorStop(0, "rgba(255,255,255,0.95)");
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, "rgba(3,13,24,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, base * (0.5 + amp * 0.3), 0, Math.PI * 2);
      ctx.fill();

      // rotating tick marks
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + t * 0.35;
        const inner = base * 1.18;
        const outer = inner + (i % 3 === 0 ? 8 : 4) * (0.6 + amp);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <button
      onClick={onClick}
      aria-label="Toggle voice control"
      className={cn(
        "group relative block cursor-pointer transition-transform hover:scale-[1.03] active:scale-95",
        className,
      )}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </button>
  );
}
