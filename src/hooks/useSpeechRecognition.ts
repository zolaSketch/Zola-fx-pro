"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/* The Web Speech API is not in TypeScript's DOM lib, so we type what we use. */
interface SRAlternative {
  transcript: string;
  confidence: number;
}
interface SRResult {
  0: SRAlternative;
  isFinal: boolean;
  length: number;
}
interface SREvent extends Event {
  resultIndex: number;
  results: { length: number; [i: number]: SRResult };
}
interface SRErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SRCtor = new () => SpeechRecognitionLike;

function getCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SRCtor;
    webkitSpeechRecognition?: SRCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const emptySubscribe = () => () => {};

function useRecognitionSupported() {
  return useSyncExternalStore(
    emptySubscribe,
    () => getCtor() !== null,
    () => false,
  );
}

export type MicState = "idle" | "listening" | "denied" | "unsupported";

interface Options {
  /** Called with a final transcript that should be treated as a command. */
  onCommand: (text: string) => void;
  /** Wake word — when armed, only speech after this phrase counts. */
  wakeWord?: string;
  /** Require the wake word before accepting a command. */
  requireWake?: boolean;
  /** Suspend capture (e.g. while JARVIS is speaking) to avoid self-hearing. */
  paused?: boolean;
  lang?: string;
}

/**
 * Continuous speech recognition with wake-word gating and auto-restart.
 *
 * Browsers end recognition sessions frequently (silence timeouts, tab focus),
 * so this keeps a desired-state flag and restarts until explicitly stopped.
 */
export function useSpeechRecognition({
  onCommand,
  wakeWord = "jarvis",
  requireWake = true,
  paused = false,
  lang = "en-US",
}: Options) {
  const supported = useRecognitionSupported();
  // `state` tracks runtime status; unsupported is derived from capability so it
  // never needs to be written from an effect.
  const [state, setState] = useState<MicState>("idle");
  const [interim, setInterim] = useState("");
  const [heardWake, setHeardWake] = useState(false);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const wantOnRef = useRef(false);
  const pausedRef = useRef(paused);
  const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callbacks/flags in refs so the recognition instance is built once.
  const onCommandRef = useRef(onCommand);
  const requireWakeRef = useRef(requireWake);
  const wakeWordRef = useRef(wakeWord);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);
  useEffect(() => {
    requireWakeRef.current = requireWake;
  }, [requireWake]);
  useEffect(() => {
    wakeWordRef.current = wakeWord.toLowerCase();
  }, [wakeWord]);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!supported) return;
    const Ctor = getCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recRef.current = rec;

    rec.onstart = () => setState("listening");

    rec.onresult = (e: SREvent) => {
      if (pausedRef.current) return;

      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interimText += r[0].transcript;
      }
      setInterim(interimText.trim());

      const wake = wakeWordRef.current;

      // Light up the indicator as soon as the wake word is heard.
      if (requireWakeRef.current && interimText.toLowerCase().includes(wake)) {
        setHeardWake(true);
      }

      if (!finalText.trim()) return;
      setInterim("");

      let cmd = finalText.trim();
      if (requireWakeRef.current) {
        const lower = cmd.toLowerCase();
        const at = lower.lastIndexOf(wake);
        if (at === -1) return; // not addressed to us
        cmd = cmd.slice(at + wake.length).replace(/^[\s,.:;!?-]+/, "").trim();
        setHeardWake(false);
        if (!cmd) {
          onCommandRef.current("__WAKE_ONLY__");
          return;
        }
      }
      if (cmd) onCommandRef.current(cmd);
    };

    rec.onerror = (e: SRErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantOnRef.current = false;
        setState("denied");
      }
      // 'no-speech' / 'aborted' / 'network' are transient; onend will restart.
    };

    rec.onend = () => {
      setInterim("");
      if (wantOnRef.current) {
        // Debounce the restart; immediate restarts can throw in some browsers.
        restartRef.current = setTimeout(() => {
          try {
            rec.start();
          } catch {
            /* already starting */
          }
        }, 260);
      } else {
        setState((s) => (s === "denied" ? s : "idle"));
      }
    };

    return () => {
      wantOnRef.current = false;
      if (restartRef.current) clearTimeout(restartRef.current);
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      rec.onstart = null;
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      recRef.current = null;
    };
  }, [supported, lang]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    wantOnRef.current = true;
    try {
      recRef.current.start();
      setState("listening");
    } catch {
      /* already running */
    }
  }, []);

  const stop = useCallback(() => {
    wantOnRef.current = false;
    setHeardWake(false);
    setInterim("");
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setState((s) => (s === "denied" ? s : "idle"));
  }, []);

  const toggle = useCallback(() => {
    if (wantOnRef.current) stop();
    else start();
  }, [start, stop]);

  const micState: MicState = supported ? state : "unsupported";

  return { state: micState, interim, heardWake, supported, start, stop, toggle };
}
