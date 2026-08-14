"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED = "jarvis-install-dismissed";

/**
 * Install affordance for the PWA.
 *
 * Chromium fires `beforeinstallprompt`, so we can offer a real one-tap
 * install. iOS Safari has no such API — installing there requires
 * Share → Add to Home Screen — so we detect iOS and show those instructions
 * instead of a button that could not work.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed? Say nothing.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    if (localStorage.getItem(DISMISSED) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS: no install API, so offer instructions after a short delay.
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos && isSafari) {
      timer = setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 2500);
    }

    const onInstalled = () => setVisible(false);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {
      /* private mode */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-2 z-40 mx-auto max-w-md sm:inset-x-auto sm:right-4"
          style={{ bottom: "calc(max(0.75rem, env(safe-area-inset-bottom)) + 4.25rem)" }}
        >
          <div className="hud-panel hud-clip flex items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[10px] tracking-[0.2em] text-hud-200">
                INSTALL J.A.R.V.I.S.
              </p>
              <p className="mt-0.5 text-[10.5px] leading-snug text-hud-300/70">
                {iosHint ? (
                  <>
                    Tap <Share size={10} className="inline align-[-1px]" /> then{" "}
                    <span className="text-hud-100">Add to Home Screen</span>
                  </>
                ) : (
                  "Run fullscreen, works offline."
                )}
              </p>
            </div>

            {!iosHint && (
              <button
                onClick={install}
                className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-sm border border-hud-300/50 bg-hud-400/15 px-3 font-display text-[9px] tracking-[0.18em] text-hud-100 transition active:bg-hud-400/30"
              >
                <Download size={12} /> INSTALL
              </button>
            )}

            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="flex min-h-9 min-w-9 shrink-0 items-center justify-center text-hud-500/60 transition active:text-hud-200"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
