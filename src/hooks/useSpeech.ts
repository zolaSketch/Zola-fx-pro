"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Hydration-safe capability probe (no setState-in-effect). */
function useSpeechSupported() {
  return useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    () => false,
  );
}

/** Wraps the Web Speech API for JARVIS voice output, with graceful degradation. */
export function useSpeech(muted: boolean) {
  const supported = useSpeechSupported();
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Pick the most JARVIS-like voice available. Purely an external-system read.
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    const pick = () => {
      const voices = synth.getVoices();
      if (!voices.length) return;
      const prefer = [/daniel/i, /google uk english male/i, /en-GB/i, /male/i];
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

  // When muted, silence the synth. Speaking state is driven by utterance events,
  // so this effect only touches the external system.
  useEffect(() => {
    if (!supported || !muted) return;
    window.speechSynthesis.cancel();
  }, [supported, muted]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || muted) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 1.02;
      u.pitch = 0.82;
      u.volume = 0.95;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    },
    [supported, muted],
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  return { speak, stop, speaking: speaking && !muted, supported };
}
