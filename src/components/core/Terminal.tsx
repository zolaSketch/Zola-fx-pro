"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Volume2, VolumeX } from "lucide-react";
import { useJarvis } from "@/store/jarvis";
import { fallbackReply, resolveCommand } from "@/lib/commands";
import type { LogEntry } from "@/lib/types";
import { cn, pad } from "@/lib/utils";
import { useSpeech } from "@/hooks/useSpeech";

const TONE_CLASS: Record<NonNullable<LogEntry["tone"]>, string> = {
  neutral: "text-hud-100",
  ok: "text-ok-hud",
  warn: "text-amber-hud",
  danger: "text-danger-hud",
};

const SUGGESTIONS = ["status", "scan", "power 100", "suit up", "protocol lockdown", "help"];

function stamp(at: number) {
  const d = new Date(at);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function Terminal() {
  const {
    log,
    push,
    clearLog,
    power,
    status,
    setPower,
    setStatus,
    scanThreats,
    thinking,
    setThinking,
    muted,
    toggleMute,
  } = useJarvis();

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { speak, speaking } = useSpeech(muted);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [log, thinking]);

  useEffect(() => {
    const focus = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focus);
    return () => window.removeEventListener("keydown", focus);
  }, []);

  const submit = async (raw: string) => {
    const text = raw.trim();
    if (!text || thinking) return;

    push("user", text);
    setHistory((h) => [text, ...h].slice(0, 40));
    setHIndex(-1);
    setInput("");
    setThinking(true);

    await new Promise((r) => setTimeout(r, 320 + Math.random() * 420));

    const say: (t: string, o?: Partial<LogEntry>) => void = (t, o) => {
      push("jarvis", t, o);
      speak(t);
    };

    const cmd = resolveCommand(text);
    if (cmd?.name === "clear") {
      clearLog();
      push("system", "Transcript purged.");
    } else if (cmd?.name === "scan") {
      scanThreats();
      speak("Sweep complete. Contacts resolved within perimeter.");
    } else if (cmd) {
      await cmd.run(text.toLowerCase(), { say, setPower, setStatus, power, status });
    } else {
      say(fallbackReply(text.length));
    }

    setThinking(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void submit(input);
    } else if (e.key === "ArrowUp") {
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

  return (
    <div className="flex h-full min-h-0 flex-col">
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
                        ? "text-hud-500/70 italic"
                        : cn("border-l-2 border-hud-400/50 bg-hud-900/25", TONE_CLASS[e.tone ?? "neutral"]),
                  )}
                >
                  <p className="whitespace-pre-wrap">{e.text}</p>
                  {e.meta && e.meta.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 border-t border-hud-400/15 pt-1.5 font-mono-hud text-[10.5px] text-hud-300/70">
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
          </motion.div>
        )}
      </div>

      {/* suggestions */}
      <div className="mt-3 flex shrink-0 flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => void submit(s)}
            disabled={thinking}
            className="rounded-sm border border-hud-400/20 bg-hud-500/5 px-2 py-1 font-display text-[9px] tracking-[0.12em] text-hud-300/75 transition hover:border-hud-300/50 hover:bg-hud-400/15 hover:text-hud-100 disabled:opacity-40"
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* input */}
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
          placeholder={thinking ? "processing…" : "Speak your directive, sir…  (press / to focus)"}
          className="min-w-0 flex-1 bg-transparent font-mono-hud text-[12.5px] text-hud-50 outline-none placeholder:text-hud-500/45 disabled:opacity-50"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={toggleMute}
          title={muted ? "Enable voice" : "Mute voice"}
          className={cn(
            "rounded-sm border p-1.5 transition",
            muted
              ? "border-hud-500/25 text-hud-500/55 hover:text-hud-300"
              : "border-hud-300/40 text-hud-200 hover:bg-hud-400/15",
            speaking && !muted && "animate-pulse-hud",
          )}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <button
          onClick={() => void submit(input)}
          disabled={thinking || !input.trim()}
          className="rounded-sm border border-hud-300/40 p-1.5 text-hud-200 transition hover:bg-hud-400/15 disabled:opacity-30"
        >
          <CornerDownLeft size={13} />
        </button>
      </div>
    </div>
  );
}
