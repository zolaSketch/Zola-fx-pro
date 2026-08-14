"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { Panel } from "@/components/hud/Panel";

/**
 * Personal document ingestion.
 *
 * Files are chunked and indexed in IndexedDB on the device — nothing is
 * uploaded anywhere. JARVIS can then quote them back via "search my notes".
 */
export function DocsPanel() {
  const [docs, setDocs] = useState<{ name: string; chunks: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const { listDocuments } = await import("@/lib/rag");
    setDocs(await listDocuments());
  }, []);

  // Reading IndexedDB is subscribing to an external system, and the setState
  // happens in the async continuation rather than synchronously in the effect
  // body — but the rule cannot see through the await, so the load is deferred
  // explicitly to make that ordering obvious.
  useEffect(() => {
    let alive = true;
    const id = setTimeout(async () => {
      const { listDocuments } = await import("@/lib/rag");
      const list = await listDocuments();
      if (alive) setDocs(list);
    }, 0);
    return () => {
      alive = false;
      clearTimeout(id);
    };
  }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setStatus(null);
    try {
      const { addDocument } = await import("@/lib/rag");
      let total = 0;
      for (const f of Array.from(files)) {
        // Binary formats would need a parser; read text only.
        if (f.size > 2_000_000) {
          setStatus(`${f.name} is too large (2 MB limit)`);
          continue;
        }
        const text = await f.text();
        if (!text.trim()) continue;
        total += await addDocument(f.name, text);
      }
      if (total) setStatus(`Indexed ${total} passages`);
      await refresh();
    } catch {
      setStatus("Could not read that file");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clear = async () => {
    const { clearDocuments } = await import("@/lib/rag");
    await clearDocuments();
    setStatus("Cleared");
    await refresh();
  };

  return (
    <Panel
      title="DOCUMENTS"
      badge={docs.length ? `${docs.length} INDEXED` : "ON-DEVICE"}
      bodyClassName="flex flex-col gap-2 min-h-0"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".txt,.md,.json,.csv,.log,text/*"
        onChange={(e) => void onFiles(e.target.files)}
        className="hidden"
      />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-sm border border-hud-300/40 bg-hud-500/5 py-1.5 font-display text-[9px] tracking-[0.18em] text-hud-200 transition hover:bg-hud-400/15 disabled:opacity-40"
      >
        <Upload size={12} /> {busy ? "INDEXING…" : "UPLOAD NOTES"}
      </button>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {docs.length === 0 && (
          <p className="py-3 text-center font-display text-[8px] leading-relaxed tracking-[0.16em] text-hud-500/45">
            NO DOCUMENTS
            <br />
            UPLOAD .TXT OR .MD TO TEACH ME
          </p>
        )}
        {docs.map((d) => (
          <div
            key={d.name}
            className="flex items-center gap-1.5 border-l border-hud-400/25 pl-2 text-[10px]"
          >
            <FileText size={10} className="shrink-0 text-hud-400/60" />
            <span className="min-w-0 flex-1 truncate text-hud-200/85">{d.name}</span>
            <span className="shrink-0 tabular-nums text-hud-400/60">{d.chunks}</span>
          </div>
        ))}
      </div>

      {status && (
        <p className="shrink-0 font-display text-[8px] tracking-[0.14em] text-ok-hud/80">
          {status}
        </p>
      )}

      {docs.length > 0 && (
        <button
          onClick={clear}
          className="flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-sm border border-danger-hud/30 py-1 font-display text-[8px] tracking-[0.16em] text-danger-hud/80 transition hover:bg-danger-hud/10"
        >
          <Trash2 size={10} /> CLEAR ALL
        </button>
      )}

      <p className="shrink-0 font-display text-[7.5px] leading-relaxed tracking-[0.12em] text-hud-500/45">
        STORED ON THIS DEVICE ONLY · ASK “SEARCH MY NOTES FOR …”
      </p>
    </Panel>
  );
}
