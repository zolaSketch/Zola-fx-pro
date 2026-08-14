"use client";

import { X } from "lucide-react";
import { Panel } from "@/components/hud/Panel";
import { useJarvis } from "@/store/jarvis";
import { useNow } from "@/hooks/useNow";
import { cn, pad } from "@/lib/utils";

function remaining(endsAt: number, now: number) {
  const ms = Math.max(0, endsAt - now);
  const s = Math.ceil(ms / 1000);
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}

export function TimersPanel() {
  const timers = useJarvis((s) => s.timers);
  const notes = useJarvis((s) => s.notes);
  const dismiss = useJarvis((s) => s.dismissTimer);
  // `useNow` is null until mounted; fall back to each timer's own end time so
  // render stays pure (no Date.now() during render).
  const nowMs = useNow();

  return (
    <Panel
      title="MEMORY"
      badge={`${timers.length}T · ${notes.length}N`}
      bodyClassName="flex flex-col gap-2 overflow-y-auto"
    >
      {timers.length === 0 && notes.length === 0 && (
        <p className="py-4 text-center font-display text-[9px] tracking-[0.2em] text-hud-500/45">
          NOTHING RECORDED
        </p>
      )}

      {timers.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2 border-l-2 pl-2 text-[10px]",
            t.done ? "border-amber-hud/70" : "border-hud-400/40",
          )}
        >
          <span className="min-w-0 flex-1 truncate text-hud-200/85">{t.label}</span>
          <span
            className={cn(
              "shrink-0 font-display tabular-nums",
              t.done ? "text-amber-hud" : "text-hud-200",
            )}
          >
            {t.done ? "ELAPSED" : nowMs === null ? "--:--" : remaining(t.endsAt, nowMs)}
          </span>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-hud-500/60 transition hover:text-danger-hud"
          >
            <X size={11} />
          </button>
        </div>
      ))}

      {notes.slice(0, 6).map((n) => (
        <div key={n.id} className="border-l-2 border-hud-600/40 pl-2 text-[10px]">
          <p className="line-clamp-2 text-hud-300/75">{n.text}</p>
        </div>
      ))}
    </Panel>
  );
}
