"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function useSpeechSupported() {
  return useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );
}

/**
 * Queued speech synthesis for JARVIS.
 *
 * Sentences are enqueued as they stream in, so speech begins before the full
 * reply has arrived. Exposes `speaking` so the mic can be gated (preventing
 * JARVIS from hearing himself) and the voice orb can react.
 */
export function useSpeech(muted: boolean) {
  const supported = useSpeechSupported();
  const [speaking, setSpeaking] = useState(false);

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const queueRef = useRef<string[]>([]);
  const activeRef = useRef(false);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    const pick = () => {
      const voices = synth.getVoices();
      if (!voices.length) return;
      // Prefer a crisp British male — closest to the films.
      const prefer = [/daniel/i, /google uk english male/i, /arthur/i, /oliver/i, /en-GB/i, /male/i];
      for (const p of prefer) {
        const v = voices.find((x) => p.test(x.name) || p.test(x.lang));
        if (v) {
          voiceRef.current = v;
          return;
        }
      }
      voiceRef.current = voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
    };

    pick();
    synth.addEventListener("voiceschanged", pick);
    return () => synth.removeEventListener("voiceschanged", pick);
  }, [supported]);

  /**
   * Play the next queued line. Declared as a named function expression so the
   * utterance's `onend` handler can recurse into it without a use-before-declare
   * cycle or a ref written during render.
   */
  const drain = useCallback(function drainQueue() {
    if (!supported || activeRef.current) return;

    if (mutedRef.current) {
      queueRef.current = [];
      setSpeaking(false);
      return;
    }

    const next = queueRef.current.shift();
    if (next === undefined) {
      setSpeaking(false);
      return;
    }

    const u = new SpeechSynthesisUtterance(next);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.rate = 1.05;
    u.pitch = 0.8;
    u.volume = 1;

    activeRef.current = true;
    setSpeaking(true);

    const finish = () => {
      activeRef.current = false;
      // Continue with whatever queued up while this line was playing.
      if (queueRef.current.length) drainQueue();
      else setSpeaking(false);
    };
    u.onend = finish;
    u.onerror = finish;

    window.speechSynthesis.speak(u);
  }, [supported]);

  /** Enqueue a line. Safe to call repeatedly as text streams in. */
  const speak = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!supported || mutedRef.current || !t) return;
      queueRef.current.push(t);
      drain();
    },
    [supported, drain],
  );

  const stop = useCallback(() => {
    queueRef.current = [];
    activeRef.current = false;
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  // Muting is a command to an external system (the synth). `speaking` is
  // reported as false while muted via the return value, so no setState here.
  useEffect(() => {
    if (!supported || !muted) return;
    queueRef.current = [];
    activeRef.current = false;
    window.speechSynthesis.cancel();
  }, [supported, muted]);

  return { speak, stop, speaking: speaking && !muted, supported };
}
