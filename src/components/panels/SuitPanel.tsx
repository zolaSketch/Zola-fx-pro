"use client";

import dynamic from "next/dynamic";
import { Panel } from "@/components/hud/Panel";
import { useJarvis } from "@/store/jarvis";
import { cn } from "@/lib/utils";

// WebGL is client-only and heavy; load it on demand.
const SuitHologram = dynamic(
  () => import("@/components/hud/SuitHologram").then((m) => m.SuitHologram),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center font-display text-[9px] tracking-[0.24em] text-hud-400/50">
        INITIALISING HOLOGRAM…
      </div>
    ),
  },
);

const LABEL: Record<string, string> = {
  stowed: "STOWED",
  deploying: "ASSEMBLING",
  deployed: "DEPLOYED",
  retracting: "RETRACTING",
};

export function SuitPanel() {
  const suit = useJarvis((s) => s.suit);
  const mark = useJarvis((s) => s.suitMark);
  const progress = useJarvis((s) => s.suitProgress);
  const runTool = useJarvis((s) => s.runTool);

  const deployed = suit === "deployed" || suit === "deploying";

  return (
    <Panel
      title={`MARK ${mark}`}
      badge={LABEL[suit]}
      bodyClassName="flex flex-col gap-2 p-0"
    >
      <div className="relative min-h-0 flex-1">
        <SuitHologram progress={progress} state={suit} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-3 pb-1 font-display text-[8px] tracking-[0.2em] text-hud-400/50">
          <span>NANO-LATTICE</span>
          <span className="tabular-nums text-hud-200">{progress.toFixed(0)}%</span>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="mb-2 h-[3px] overflow-hidden rounded-full bg-hud-900/70">
          <div
            className={cn(
              "h-full transition-[width] duration-200",
              suit === "deployed"
                ? "bg-gradient-to-r from-ok-hud/70 to-ok-hud"
                : "bg-gradient-to-r from-hud-600 to-hud-200",
            )}
            style={{ width: `${progress}%`, filter: "drop-shadow(0 0 5px currentColor)" }}
          />
        </div>
        <button
          onClick={() =>
            runTool({
              name: "suit_control",
              args: { mark, action: deployed ? "retract" : "deploy" },
            })
          }
          className="w-full rounded-sm border border-hud-300/35 bg-hud-500/5 py-1.5 font-display text-[9px] tracking-[0.22em] text-hud-200 transition hover:bg-hud-400/15 hover:text-white"
        >
          {deployed ? "RETRACT ARMOUR" : "DEPLOY ARMOUR"}
        </button>
      </div>
    </Panel>
  );
}
