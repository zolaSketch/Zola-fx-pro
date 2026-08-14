"use client";

import { Panel } from "@/components/hud/Panel";
import { Gauge } from "@/components/hud/Gauge";
import { useJarvis } from "@/store/jarvis";

/** Telemetry is advanced by the Dashboard heartbeat, not a local interval. */
export function SystemsPanel() {
  const subsystems = useJarvis((s) => s.subsystems);

  return (
    <Panel title="SUBSYSTEMS" badge="LIVE" bodyClassName="space-y-3.5 overflow-y-auto">
      {subsystems.map((s) => (
        <Gauge key={s.id} item={s} />
      ))}
    </Panel>
  );
}
