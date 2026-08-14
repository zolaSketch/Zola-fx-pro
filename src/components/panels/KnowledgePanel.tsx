"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/hud/Panel";
import { ELEMENTS } from "@/lib/knowledge/core";
import { cn } from "@/lib/utils";

const GROUP_COLOR: Record<string, string> = {
  "nonmetal": "bg-ok-hud/25 border-ok-hud/50",
  "noble gas": "bg-hud-300/25 border-hud-300/60",
  "alkali metal": "bg-danger-hud/25 border-danger-hud/50",
  "alkaline earth metal": "bg-amber-hud/25 border-amber-hud/50",
  "metalloid": "bg-hud-500/25 border-hud-400/50",
  "halogen": "bg-hud-200/25 border-hud-200/50",
  "transition metal": "bg-hud-600/30 border-hud-500/50",
  "post-transition metal": "bg-hud-700/30 border-hud-600/50",
  "lanthanide": "bg-purple-500/20 border-purple-400/40",
  "actinide": "bg-pink-500/20 border-pink-400/40",
  "unknown": "bg-hud-900/40 border-hud-700/40",
};

/**
 * A live window onto the embedded knowledge core — proof that JARVIS knows
 * these things offline rather than fetching them.
 */
export function KnowledgePanel() {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ELEMENTS;
    return ELEMENTS.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.sym.toLowerCase() === q ||
        String(e.z) === q ||
        e.group.includes(q),
    );
  }, [query]);

  return (
    <Panel
      title="KNOWLEDGE CORE"
      badge={`${shown.length}/118 · OFFLINE`}
      bodyClassName="flex flex-col gap-2 min-h-0"
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="filter elements…"
        className="w-full shrink-0 rounded-sm border border-hud-400/20 bg-hud-900/30 px-2 py-1 font-mono-hud text-[10px] text-hud-100 outline-none placeholder:text-hud-500/45 focus:border-hud-300/50"
        spellCheck={false}
      />

      <div className="grid min-h-0 flex-1 grid-cols-6 content-start gap-[3px] overflow-y-auto pr-1">
        {shown.map((e) => (
          <div
            key={e.z}
            title={`${e.name} · Z=${e.z} · ${e.mass} u · ${e.group}`}
            className={cn(
              "flex aspect-square cursor-default flex-col items-center justify-center rounded-[2px] border transition hover:scale-110 hover:border-hud-200",
              GROUP_COLOR[e.group] ?? GROUP_COLOR.unknown,
            )}
          >
            <span className="font-display text-[8px] leading-none text-hud-100">{e.sym}</span>
            <span className="text-[6px] leading-none text-hud-300/60">{e.z}</span>
          </div>
        ))}
        {shown.length === 0 && (
          <p className="col-span-6 py-4 text-center font-display text-[9px] tracking-[0.2em] text-hud-500/45">
            NO MATCH
          </p>
        )}
      </div>

      <p className="shrink-0 font-display text-[7.5px] leading-relaxed tracking-[0.14em] text-hud-500/45">
        118 ELEMENTS · 20 CONSTANTS · 11 BODIES · 40+ UNITS — ALL RESIDENT
      </p>
    </Panel>
  );
}
