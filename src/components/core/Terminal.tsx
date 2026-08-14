"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Mic, MicOff, Volume2, VolumeX, Square } from "lucide-react";
import { useJarvis } from "@/store/jarvis";
import type { LogEntry } from "@/lib/types";
import { cn, pad } from "@/lib/utils";
import { useSpeech } from "@/hooks/useSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useJarvisChat } from "@/hooks/useJarvisChat";
import { VoiceOrb } from "@/components/hud/VoiceOrb";

const TONE_CLASS: Record<NonNullable<LogEntry["tone"]>, string> = {
  neutral: "text-hud-100",
  ok: "text-ok-hud",
  warn: "text-amber-hud",
  danger: "text-danger-hud",
};

const SUGGESTIONS = [
  "Status report",
  "Scan the perimeter",
  "Divert 100% to the reactor",
  "Suit up",
  "Lockdown protocol",
];

function stamp(at: number) {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function Terminal() {
  const log = useJarvis((s) => s.log);
  const thinking = useJarvis((s) => s.thinking);
  const muted = useJarvis((s) => s.muted);
  const toggleMute = useJarvis((s) => s.toggleMute);
  const engine = useJarvis((s) => s.engine);

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { speak, stop: stopSpeech, speaking } = useSpeech(muted);
  const { send, cancel } = useJarvisChat({ onSentence: speak });

  // Voice input. Gate the mic while JARVIS talks so he never hears himself.
  const handleVoice = useCallback(
    (text: string) => {
      if (text === "__WAKE_ONLY__") {
        speak("Yes, sir?");
        return;
      }
      void send(text);
    },
    [send, speak],
  );

  const mic = useSpeechRecognition({
    onCommand: handleVoice,
    wakeWord: "jarvis",
    requireWake: true,
    paused: speaking,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [log, thinking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Space toggles the mic when not typing.
      if (
        e.code === "Space" &&
        e.ctrlKey &&
        document.activeElement !== inputRef.current
      ) {
        e.preventDefault();
        mic.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mic]);

  const submit = (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;
    setHistory((h) => [text, ...h].slice(0, 40));
    setHIndex(-1);
    setInput("");
    void send(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit(input);
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIndex + 1, history.length - 1);
      if (i >= 0) {
        setHIndex(i);
        setInput(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIndex - 1;
      setHIndex(i);
      setInput(i >= 0 ? history[i] : "");
    }
  };

  const orbMode = speaking
    ? "speaking"
    : thinking
      ? "thinking"
      : mic.heardWake
        ? "wake"
        : mic.state === "listening"
          ? "listening"
          : "idle";

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* voice orb header */}
      <div className="mb-2 flex shrink-0 items-center gap-3 border-b border-hud-400/15 pb-2">
        <VoiceOrb mode={orbMode} className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" onClick={mic.toggle} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[9px] tracking-[0.24em] text-hud-300/70">
            {orbMode === "speaking"
              ? "SPEAKING"
              : orbMode === "thinking"
                ? "PROCESSING"
                : orbMode === "wake"
                  ? "WAKE WORD DETECTED"
                  : mic.state === "listening"
                    ? 'LISTENING — SAY "JARVIS…"'
                    : mic.state === "denied"
                      ? "MIC ACCESS DENIED"
                      : mic.state === "unsupported"
                        ? "VOICE INPUT UNSUPPORTED"
                        : "VOICE STANDBY"}
          </p>
          <p className="mt-0.5 h-4 truncate text-[11px] italic text-hud-400/60">
            {mic.interim || (engine ? `engine · ${engine}` : "\u00a0")}
          </p>
        </div>
        {speaking && (
          <button
            onClick={stopSpeech}
            title="Stop speaking"
            className="rounded-sm border border-danger-hud/40 p-1.5 text-danger-hud transition hover:bg-danger-hud/15"
          >
            <Square size={12} />
          </button>
        )}
      </div>

      {/* transcript */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-[12px] leading-relaxed"
      >
        <AnimatePresence initial={false}>
          {log.map((e) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={cn("flex gap-2.5", e.speaker === "user" && "justify-end")}
            >
              {e.speaker !== "user" && (
                <span
                  className={cn(
                    "mt-[3px] shrink-0 font-display text-[9px] tracking-[0.2em]",
                    e.speaker === "system" ? "text-hud-500/60" : "text-hud-300/80",
                  )}
                >
                  {e.speaker === "system" ? "SYS" : "JVS"}
                </span>
              )}

              <div className={cn("max-w-[85%]", e.speaker === "user" && "text-right")}>
                <div
                  className={cn(
                    "inline-block rounded-sm px-2.5 py-1.5 text-left",
                    e.speaker === "user"
                      ? "border border-hud-400/25 bg-hud-500/10 text-hud-100"
                      : e.speaker === "system"
                        ? "text-hud-500/70"
                        : cn(
                            "border-l-2 border-hud-400/50 bg-hud-900/25",
                            TONE_CLASS[e.tone ?? "neutral"],
                          ),
                  )}
                >
                  {e.text && <p className="whitespace-pre-wrap">{e.text}</p>}
                  {e.meta && e.meta.length > 0 && (
                    <ul
                      className={cn(
                        "space-y-0.5 font-mono-hud text-[10.5px] text-hud-300/70",
                        e.text && "mt-1.5 border-t border-hud-400/15 pt-1.5",
                      )}
                    >
                      {e.meta.map((m, i) => (
                        <li key={i} className="whitespace-pre-wrap">
                          <span className="mr-1.5 text-hud-500/50">·</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div
                  className={cn(
                    "mt-0.5 font-display text-[8.5px] tracking-[0.15em] text-hud-500/45",
                    e.speaker === "user" ? "text-right" : "text-left",
                  )}
                >
                  {stamp(e.at)}
                </div>
              </div>

              {e.speaker === "user" && (
                <span className="mt-[3px] shrink-0 font-display text-[9px] tracking-[0.2em] text-hud-400/70">
                  YOU
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
            <span className="font-display text-[9px] tracking-[0.2em] text-hud-300/80">JVS</span>
            <div className="flex gap-1 py-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-hud-300"
                  style={{ animation: `pulse-hud 1.1s ease-in-out ${i * 0.17}s infinite` }}
                />
              ))}
            </div>
            <button
              onClick={cancel}
              className="font-display text-[8px] tracking-[0.18em] text-hud-500/60 hover:text-danger-hud"
            >
              ABORT
            </button>
          </motion.div>
        )}
      </div>

      {/* suggestions */}
      <div className="mt-3 flex shrink-0 gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => submit(s)}
            disabled={thinking}
            className="shrink-0 whitespace-nowrap rounded-sm border border-hud-400/20 bg-hud-500/5 px-2 py-1.5 font-display text-[9px] tracking-[0.12em] text-hud-300/75 transition hover:border-hud-300/50 hover:bg-hud-400/15 hover:text-hud-100 disabled:opacity-40"
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* input row */}
      <div className="mt-2.5 flex shrink-0 items-center gap-2 border-t border-hud-400/20 pt-2.5">
        <span
          className={cn(
            "font-display text-sm transition-colors",
            thinking ? "text-hud-500/40" : "text-hud-300 text-glow",
          )}
        >
          ›
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={thinking}
          placeholder={thinking ? "processing…" : "Speak or type, sir…"}
          className="min-w-0 flex-1 bg-transparent font-mono-hud text-base text-hud-50 outline-none placeholder:text-hud-500/45 disabled:opacity-50 sm:text-[12.5px]"
          autoComplete="off"
          spellCheck={false}
        />

        <button
          onClick={mic.toggle}
          disabled={mic.state === "unsupported"}
          title={mic.state === "listening" ? "Stop listening (Ctrl+Space)" : "Start listening (Ctrl+Space)"}
          className={cn(
            "flex min-h-9 min-w-9 items-center justify-center rounded-sm border p-1.5 transition disabled:opacity-30",
            mic.state === "listening"
              ? "border-ok-hud/50 bg-ok-hud/10 text-ok-hud"
              : mic.state === "denied"
                ? "border-danger-hud/40 text-danger-hud"
                : "border-hud-500/30 text-hud-400 hover:text-hud-200",
          )}
        >
          {mic.state === "listening" ? <Mic size={13} /> : <MicOff size={13} />}
        </button>

        <button
          onClick={toggleMute}
          title={muted ? "Enable voice" : "Mute voice"}
          className={cn(
            "flex min-h-9 min-w-9 items-center justify-center rounded-sm border p-1.5 transition",
            muted
              ? "border-hud-500/25 text-hud-500/55 hover:text-hud-300"
              : "border-hud-300/40 text-hud-200 hover:bg-hud-400/15",
          )}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        <button
          onClick={() => submit(input)}
          disabled={thinking || !input.trim()}
          className="flex min-h-9 min-w-9 items-center justify-center rounded-sm border border-hud-300/40 p-1.5 text-hud-200 transition hover:bg-hud-400/15 disabled:opacity-30"
        >
          <CornerDownLeft size={13} />
        </button>
      </div>
    </div>
  );
}
