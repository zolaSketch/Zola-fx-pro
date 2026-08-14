"use client";

import { useEffect } from "react";
import { Panel } from "@/components/hud/Panel";
import { Gauge } from "@/components/hud/Gauge";
import { useJarvis } from "@/store/jarvis";

export function SystemsPanel() {
  const subsystems = useJarvis((s) => s.subsystems);
  const tick = useJarvis((s) => s.tick);

  useEffect(() => {
    const id = setInterval(tick, 900);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <Panel title="SUBSYSTEMS" badge="LIVE" bodyClassName="space-y-3.5 overflow-y-auto">
      {subsystems.map((s) => (
        <Gauge key={s.id} item={s} />
      ))}
    </Panel>
  );
}
