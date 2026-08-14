"use client";

import { Activity, Shield, Wifi } from "lucide-react";
import { useJarvis } from "@/store/jarvis";
import { useNow } from "@/hooks/useNow";
import { cn, formatClock, formatStardate } from "@/lib/utils";

const STATUS_STYLE = {
  offline: { dot: "bg-hud-500/40", text: "text-hud-500/60", label: "OFFLINE" },
  booting: { dot: "bg-amber-hud", text: "text-amber-hud", label: "INITIALISING" },
  online: { dot: "bg-ok-hud", text: "text-ok-hud", label: "ALL SYSTEMS NOMINAL" },
  alert: { dot: "bg-danger-hud", text: "text-danger-hud", label: "ALERT — LOCKDOWN" },
} as const;

export function StatusBar() {
  const status = useJarvis((s) => s.status);
  const ms = useNow();
  const now = ms === null ? null : new Date(ms);

  const st = STATUS_STYLE[status];

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-hud-400/20 px-3 py-2 sm:gap-4 sm:px-4 sm:py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <div className="h-7 w-7 rounded-full border border-hud-300/50" />
          <div className="absolute inset-[5px] rounded-full bg-hud-300/80 animate-pulse-hud" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[13px] leading-none tracking-[0.42em] text-white text-glow">
            J.A.R.V.I.S.
          </h1>
          <p className="mt-1 hidden truncate font-display text-[8px] tracking-[0.22em] text-hud-400/55 sm:block">
            JUST A RATHER VERY INTELLIGENT SYSTEM
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-2 xl:flex">
        <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse-hud", st.dot)} />
        <span className={cn("font-display text-[9px] tracking-[0.24em]", st.text)}>{st.label}</span>
      </div>

      <div className="flex shrink-0 items-center gap-4 font-display text-[9px] tracking-[0.16em] text-hud-300/70">
        <span className="hidden items-center gap-1.5 lg:flex">
          <Wifi size={11} className="text-hud-300/70" /> UPLINK
        </span>
        <span className="hidden items-center gap-1.5 lg:flex">
          <Shield size={11} className="text-ok-hud/80" /> SECURE
        </span>
        <span className="hidden items-center gap-1.5 xl:flex">
          <Activity size={11} className="text-hud-300/70" /> {now ? formatStardate(now) : "----.---"}
        </span>
        <span className="tabular-nums text-hud-100">{now ? formatClock(now) : "--:--:--"}</span>
      </div>
    </header>
  );
}
