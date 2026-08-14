"use client";

import { Panel } from "@/components/hud/Panel";
import { ArcReactor } from "@/components/hud/ArcReactor";
import { Waveform } from "@/components/hud/Waveform";
import { useJarvis } from "@/store/jarvis";

export function ReactorPanel() {
  const power = useJarvis((s) => s.power);
  const setPower = useJarvis((s) => s.setPower);
  const thinking = useJarvis((s) => s.thinking);

  return (
    <Panel title="ARC REACTOR" badge="PALLADIUM-FREE" bodyClassName="flex flex-col items-center gap-3">
      <ArcReactor power={power} className="mx-auto max-w-[190px]" />

      <div className="h-10 w-full">
        <Waveform active={thinking} bars={40} />
      </div>

      <div className="w-full space-y-1.5">
        <div className="flex justify-between font-display text-[9px] tracking-[0.18em] text-hud-400/60">
          <span>OUTPUT CONTROL</span>
          <span className="tabular-nums text-hud-200">{power.toFixed(0)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(power)}
          onChange={(e) => setPower(Number(e.target.value))}
          aria-label="Arc reactor output"
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-hud-900 accent-hud-300 outline-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-hud-200 [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--color-hud-300)]"
          style={{
            background: `linear-gradient(to right, var(--color-hud-400) ${power}%, var(--color-hud-900) ${power}%)`,
          }}
        />
      </div>
    </Panel>
  );
}
