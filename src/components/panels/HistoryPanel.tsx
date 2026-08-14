"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquarePlus, Search, Trash2 } from "lucide-react";
import { Panel } from "@/components/hud/Panel";
import { useJarvis } from "@/store/jarvis";
import { PERSONAS } from "@/lib/personas";
import type { ConversationSummary } from "@/lib/conversations";
import { cn } from "@/lib/utils";

/**
 * Session history and operating mode.
 *
 * Transcripts persist in IndexedDB, so a reload no longer wipes the
 * conversation. Everything stays on the device.
 */
export function HistoryPanel() {
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [query, setQuery] = useState("");
  const activeId = useJarvis((s) => s.conversationId);
  const persona = useJarvis((s) => s.persona);
  const runTool = useJarvis((s) => s.runTool);
  const loadConversation = useJarvis((s) => s.loadConversation);
  const newConversation = useJarvis((s) => s.newConversation);
  const log = useJarvis((s) => s.log);

  const refresh = useCallback(async (q: string) => {
    const { listConversations, searchConversations } = await import("@/lib/conversations");
    setItems(q.trim() ? await searchConversations(q) : await listConversations());
  }, []);

  // Reload the list when the transcript changes, debounced so typing in the
  // search box does not hammer IndexedDB.
  useEffect(() => {
    const id = setTimeout(() => void refresh(query), 250);
    return () => clearTimeout(id);
  }, [query, refresh, log.length]);

  const remove = async (id: string) => {
    const { deleteConversation } = await import("@/lib/conversations");
    await deleteConversation(id);
    await refresh(query);
  };

  return (
    <Panel
      title="SESSIONS"
      badge={items.length ? `${items.length} SAVED` : "ON-DEVICE"}
      bodyClassName="flex flex-col gap-2 min-h-0"
    >
      {/* operating mode */}
      <div className="shrink-0">
        <p className="mb-1 font-display text-[8px] tracking-[0.2em] text-hud-400/60">MODE</p>
        <div className="flex flex-wrap gap-1">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => runTool({ name: "set_persona", args: { persona: p.id } })}
              title={p.hint}
              className={cn(
                "rounded-sm border px-1.5 py-1 font-display text-[8px] tracking-[0.12em] transition",
                persona === p.id
                  ? "border-hud-300/60 bg-hud-400/20 text-hud-100"
                  : "border-hud-400/20 text-hud-400/70 active:bg-hud-400/10",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 gap-1.5">
        <button
          onClick={() => void newConversation()}
          className="flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-sm border border-hud-300/40 bg-hud-500/5 font-display text-[8px] tracking-[0.16em] text-hud-200 transition active:bg-hud-400/15"
        >
          <MessageSquarePlus size={11} /> NEW SESSION
        </button>
      </div>

      <div className="relative shrink-0">
        <Search
          size={10}
          className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-hud-500/50"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search transcripts…"
          className="w-full rounded-sm border border-hud-400/20 bg-hud-900/30 py-1 pl-6 pr-2 font-mono-hud text-[10px] text-hud-100 outline-none placeholder:text-hud-500/45 focus:border-hud-300/50"
          spellCheck={false}
        />
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {items.length === 0 && (
          <p className="py-3 text-center font-display text-[8px] leading-relaxed tracking-[0.16em] text-hud-500/45">
            {query ? "NO MATCH" : "NO SAVED SESSIONS YET"}
          </p>
        )}
        {items.map((c) => (
          <div
            key={c.id}
            className={cn(
              "flex items-center gap-1.5 border-l-2 pl-2 text-[10px]",
              c.id === activeId ? "border-hud-300/70" : "border-hud-400/25",
            )}
          >
            <button
              onClick={() => void loadConversation(c.id)}
              className="min-w-0 flex-1 truncate py-1 text-left text-hud-200/85 transition active:text-hud-100"
            >
              {c.title}
              <span className="ml-1.5 text-hud-500/50">{c.messageCount}</span>
            </button>
            <button
              onClick={() => void remove(c.id)}
              aria-label="Delete session"
              className="shrink-0 p-1 text-hud-500/50 transition active:text-danger-hud"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
