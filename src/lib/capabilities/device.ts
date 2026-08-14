"use client";

/**
 * Real device telemetry from browser APIs.
 *
 * These replace the invented numbers in the HUD wherever the platform will
 * actually tell us something. Every reading is optional — unsupported APIs
 * simply report null and the UI falls back to simulated telemetry.
 */

export interface DeviceSnapshot {
  battery: { level: number; charging: boolean } | null;
  network: { type: string; downlink: number; rtt: number } | null;
  memory: { usedMB: number; limitMB: number; percent: number } | null;
  cores: number | null;
  online: boolean;
  /** Frames per second, measured live. */
  fps: number | null;
  screen: { w: number; h: number; dpr: number } | null;
  platform: string | null;
}

interface BatteryLike extends EventTarget {
  level: number;
  charging: boolean;
}

interface ConnectionLike {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (t: string, cb: () => void) => void;
  removeEventListener?: (t: string, cb: () => void) => void;
}

export function readNetwork(): DeviceSnapshot["network"] {
  if (typeof navigator === "undefined") return null;
  const c = (navigator as unknown as { connection?: ConnectionLike }).connection;
  if (!c) return null;
  return {
    type: c.effectiveType ?? "unknown",
    downlink: c.downlink ?? 0,
    rtt: c.rtt ?? 0,
  };
}

export function readMemory(): DeviceSnapshot["memory"] {
  if (typeof performance === "undefined") return null;
  const m = (performance as unknown as {
    memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
  }).memory;
  if (!m) return null;
  const usedMB = m.usedJSHeapSize / 1_048_576;
  const limitMB = m.jsHeapSizeLimit / 1_048_576;
  return {
    usedMB,
    limitMB,
    percent: limitMB ? (usedMB / limitMB) * 100 : 0,
  };
}

export async function readBattery(): Promise<DeviceSnapshot["battery"]> {
  if (typeof navigator === "undefined") return null;
  const getBattery = (navigator as unknown as {
    getBattery?: () => Promise<BatteryLike>;
  }).getBattery;
  if (!getBattery) return null;
  try {
    const b = await getBattery.call(navigator);
    return { level: b.level * 100, charging: b.charging };
  } catch {
    return null;
  }
}

export function readStatic() {
  if (typeof navigator === "undefined") return { cores: null, platform: null, screen: null };
  return {
    cores: navigator.hardwareConcurrency ?? null,
    platform:
      (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData
        ?.platform ?? navigator.platform ?? null,
    screen:
      typeof window !== "undefined"
        ? { w: window.screen.width, h: window.screen.height, dpr: window.devicePixelRatio }
        : null,
  };
}

/** Subscribe to a live FPS counter. Returns an unsubscribe function. */
export function watchFps(cb: (fps: number) => void) {
  let raf = 0;
  let frames = 0;
  let last = performance.now();

  const loop = (now: number) => {
    frames++;
    if (now - last >= 1000) {
      cb(Math.round((frames * 1000) / (now - last)));
      frames = 0;
      last = now;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}

/** Where the user actually is, if they permit it. */
export function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 300_000,
    });
  });
}
