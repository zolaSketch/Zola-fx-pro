"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/hud/Panel";
import {
  readMemory,
  readNetwork,
  readBattery,
  readStatic,
  watchFps,
} from "@/lib/capabilities/device";
import { cn } from "@/lib/utils";

interface Row {
  k: string;
  v: string;
  tone?: "ok" | "warn" | "danger";
}

/**
 * Real device telemetry, replacing invented numbers with what the platform
 * will actually report. Unsupported APIs are shown as "n/a" rather than faked.
 */
export function DevicePanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fps, setFps] = useState<number | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => watchFps(setFps), []);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const build = async () => {
      const battery = await readBattery();
      const net = readNetwork();
      const mem = readMemory();
      const st = readStatic();
      if (!alive) return;

      const next: Row[] = [];

      if (battery) {
        next.push({
          k: "BATTERY",
          v: `${battery.level.toFixed(0)}%${battery.charging ? " ⚡" : ""}`,
          tone: battery.level < 20 && !battery.charging ? "danger" : battery.level < 45 ? "warn" : "ok",
        });
      }
      if (net) {
        next.push({ k: "LINK", v: `${net.type} · ${net.downlink}Mb` });
        next.push({
          k: "LATENCY",
          v: `${net.rtt} ms`,
          tone: net.rtt > 300 ? "warn" : "ok",
        });
      }
      if (mem) {
        next.push({
          k: "HEAP",
          v: `${mem.usedMB.toFixed(0)}/${mem.limitMB.toFixed(0)}MB`,
          tone: mem.percent > 85 ? "danger" : mem.percent > 65 ? "warn" : "ok",
        });
      }
      if (st.cores) next.push({ k: "CORES", v: String(st.cores) });
      if (st.screen) {
        next.push({ k: "DISPLAY", v: `${st.screen.w}×${st.screen.h}@${st.screen.dpr}x` });
      }

      setRows(next);
    };

    void build();
    const id = setInterval(build, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const toneClass = (t?: Row["tone"]) =>
    t === "danger" ? "text-danger-hud" : t === "warn" ? "text-amber-hud" : "text-hud-200";

  return (
    <Panel
      title="DEVICE"
      badge={online ? "REAL DATA" : "OFFLINE"}
      bodyClassName="flex flex-col justify-between gap-2"
    >
      <dl className="space-y-1.5 text-[10px]">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="font-display tracking-[0.16em] text-hud-400/60">RENDER</dt>
          <span className="mx-1 h-px flex-1 bg-hud-400/15" />
          <dd
            className={cn(
              "tabular-nums",
              fps !== null && fps < 30 ? "text-amber-hud" : "text-hud-200",
            )}
          >
            {fps === null ? "—" : `${fps} fps`}
          </dd>
        </div>

        {rows.map((r) => (
          <div key={r.k} className="flex items-baseline justify-between gap-2">
            <dt className="font-display tracking-[0.16em] text-hud-400/60">{r.k}</dt>
            <span className="mx-1 h-px flex-1 bg-hud-400/15" />
            <dd className={cn("tabular-nums", toneClass(r.tone))}>{r.v}</dd>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-2">
          <dt className="font-display tracking-[0.16em] text-hud-400/60">UPLINK</dt>
          <span className="mx-1 h-px flex-1 bg-hud-400/15" />
          <dd className={online ? "text-ok-hud" : "text-danger-hud"}>
            {online ? "CONNECTED" : "SEVERED"}
          </dd>
        </div>
      </dl>

      {rows.length === 0 && (
        <p className="text-center font-display text-[8px] tracking-[0.2em] text-hud-500/40">
          LIMITED SENSOR ACCESS IN THIS BROWSER
        </p>
      )}
    </Panel>
  );
}
