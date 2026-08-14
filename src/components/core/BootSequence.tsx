"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArcReactor } from "@/components/hud/ArcReactor";

const LINES = [
  "STARK INDUSTRIES · SECURE BOOT",
  "verifying nano-lattice signature .......... OK",
  "mounting cryo-storage volumes ............. OK",
  "arc reactor handshake ..................... OK",
  "calibrating repulsor bus .................. OK",
  "loading natural language cortex ........... OK",
  "threat matrix subscription ................ OK",
  "satellite uplink · 4 birds acquired ....... OK",
  "biometric match: STARK, ANTHONY E. ........ OK",
  "J.A.R.V.I.S. ONLINE",
];

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const step = () => {
      if (i >= LINES.length) {
        timers.push(
          setTimeout(() => {
            setExiting(true);
            timers.push(
              setTimeout(() => {
                if (!done.current) {
                  done.current = true;
                  onDone();
                }
              }, 620),
            );
          }, 520),
        );
        return;
      }
      setShown((s) => [...s, LINES[i]]);
      setProgress(Math.round(((i + 1) / LINES.length) * 100));
      i += 1;
      timers.push(setTimeout(step, i === 1 ? 420 : 130 + Math.random() * 190));
    };
    timers.push(setTimeout(step, 260));

    const skip = () => {
      timers.forEach(clearTimeout);
      setShown(LINES);
      setProgress(100);
      setExiting(true);
      setTimeout(() => {
        if (!done.current) {
          done.current = true;
          onDone();
        }
      }, 420);
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-void px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-40 sm:w-52"
          >
            <ArcReactor power={progress} />
          </motion.div>

          <div className="w-full max-w-xl">
            <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-hud-400/60 to-transparent" />
            <div className="min-h-[220px] space-y-[3px] font-mono-hud text-[11px] leading-relaxed sm:text-xs">
              {shown.map((l, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22 }}
                  className={
                    i === LINES.length - 1
                      ? "pt-2 font-display text-base tracking-[0.32em] text-white text-glow"
                      : "text-hud-300/80"
                  }
                >
                  {i !== LINES.length - 1 && <span className="mr-2 text-hud-500/60">›</span>}
                  {l}
                </motion.p>
              ))}
              <span className="inline-block h-3 w-2 animate-pulse bg-hud-300 align-middle" />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-hud-900/70">
                <div
                  className="h-full bg-gradient-to-r from-hud-600 to-hud-200 transition-[width] duration-200"
                  style={{ width: `${progress}%`, filter: "drop-shadow(0 0 6px var(--color-hud-300))" }}
                />
              </div>
              <span className="font-display text-[10px] tabular-nums text-hud-300/70">
                {String(progress).padStart(3, "0")}%
              </span>
            </div>
            <p className="mt-3 text-center font-display text-[9px] tracking-[0.3em] text-hud-400/45">
              PRESS ANY KEY TO SKIP
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
