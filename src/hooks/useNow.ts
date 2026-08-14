"use client";

import { useSyncExternalStore } from "react";

/**
 * A shared 1 Hz clock exposed as an external store. Using useSyncExternalStore
 * keeps the value hydration-safe (server renders `null`) without calling
 * setState from inside an effect.
 */
let snapshot: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (!timer) {
    snapshot = Date.now();
    timer = setInterval(() => {
      snapshot = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => null;

/** Current epoch ms, updated once per second. `null` until mounted. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
