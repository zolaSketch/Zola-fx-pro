"use client";

import { useCallback, useRef } from "react";
import { useJarvis } from "@/store/jarvis";
import type { ToolCall } from "@/lib/tools";

interface Options {
  /** Called with each complete sentence so speech can start before the stream ends. */
  onSentence?: (text: string) => void;
  onDone?: (full: string) => void;
}

/**
 * Drives a turn of conversation: posts history to /api/chat, streams NDJSON
 * back, appends text into the transcript live, and executes tool calls against
 * the HUD store as they arrive.
 */
export function useJarvisChat({ onSentence, onDone }: Options = {}) {
  const push = useJarvis((s) => s.push);
  const appendTo = useJarvis((s) => s.appendTo);
  const updateEntry = useJarvis((s) => s.updateEntry);
  const setThinking = useJarvis((s) => s.setThinking);
  const setEngine = useJarvis((s) => s.setEngine);
  const runTool = useJarvis((s) => s.runTool);

  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      push("user", clean);
      setThinking(true);

      // Build history from the store (excluding system rows).
      const history = useJarvis
        .getState()
        .log.filter((e) => e.speaker === "user" || e.speaker === "jarvis")
        .slice(-12)
        .map((e) => ({
          role: e.speaker === "user" ? ("user" as const) : ("assistant" as const),
          content: e.text,
        }));

      let replyId: string | null = null;
      let full = "";
      let spokenUpTo = 0;

      const flushSentences = (final = false) => {
        if (!onSentence) return;
        const pending = full.slice(spokenUpTo);
        // Speak on sentence boundaries so audio starts early.
        const re = /[^.!?]+[.!?]+["')\]]*\s*/g;
        let m: RegExpExecArray | null;
        let consumed = 0;
        while ((m = re.exec(pending)) !== null) {
          const s = m[0].trim();
          if (s) onSentence(s);
          consumed = m.index + m[0].length;
        }
        if (consumed) spokenUpTo += consumed;
        if (final) {
          const rest = full.slice(spokenUpTo).trim();
          if (rest) {
            onSentence(rest);
            spokenUpTo = full.length;
          }
        }
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...history, { role: "user", content: clean }] }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            let evt: { type: string; value?: string; name?: string; args?: unknown; engine?: string };
            try {
              evt = JSON.parse(trimmed);
            } catch {
              continue;
            }

            if (evt.type === "text" && evt.value) {
              if (replyId === null) {
                setThinking(false);
                replyId = push("jarvis", "");
              }
              full += evt.value;
              appendTo(replyId, evt.value);
              flushSentences();
            } else if (evt.type === "tool" && evt.name) {
              runTool({ name: evt.name, args: evt.args ?? {} } as ToolCall);
            } else if (evt.type === "done") {
              setEngine((evt.engine as "llm" | "local") ?? null);
            }
          }
        }

        flushSentences(true);
        if (replyId && !full.trim()) {
          updateEntry(replyId, { text: "Done, sir." });
          onSentence?.("Done, sir.");
        }
        onDone?.(full);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = "My apologies, sir. The link dropped. Try again.";
        if (replyId) updateEntry(replyId, { text: msg, tone: "danger" });
        else push("jarvis", msg, { tone: "danger" });
      } finally {
        setThinking(false);
      }
    },
    [push, appendTo, updateEntry, setThinking, setEngine, runTool, onSentence, onDone],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setThinking(false);
  }, [setThinking]);

  return { send, cancel };
}
