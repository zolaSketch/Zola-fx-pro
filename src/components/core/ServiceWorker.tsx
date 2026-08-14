"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so JARVIS is installable and works offline.
 *
 * Only registers in production: in development Turbopack serves uncached,
 * frequently changing chunks, and a caching worker makes hot reload behave
 * unpredictably.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // Activate a waiting worker immediately so updates are not stranded.
        if (reg.waiting) reg.waiting.postMessage("SKIP_WAITING");

        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          if (!next) return;
          next.addEventListener("statechange", () => {
            if (next.state === "installed" && navigator.serviceWorker.controller) {
              next.postMessage("SKIP_WAITING");
            }
          });
        });
      } catch {
        // Registration failing is never fatal — the app still runs online.
      }
    };

    // Defer past first paint so the boot sequence stays smooth.
    if (document.readyState === "complete") void register();
    else window.addEventListener("load", () => void register(), { once: true });
  }, []);

  return null;
}
