"use client";

import { rank, tokenize, type Memory } from "./memory";

/**
 * Personal document retrieval.
 *
 * The roadmap calls for a vector database (Chroma/Pinecone) plus an embedding
 * API. That needs a server, a key and a network round-trip per query. Since
 * JARVIS must stay installable and work offline, this implements the same
 * capability on-device: documents are chunked, indexed in IndexedDB, and
 * retrieved by TF-IDF cosine similarity — the identical ranking already proven
 * by the memory tests.
 *
 * The trade-off is honest: lexical retrieval matches wording rather than
 * meaning, so it will not connect "car" to "automobile" the way embeddings do.
 * In exchange it is instant, free, private and works on a plane.
 */

export interface DocChunk {
  id: string;
  docId: string;
  docName: string;
  text: string;
  /** Position of this chunk within its document. */
  index: number;
  at: number;
}

const DB = "jarvis-docs";
const STORE = "chunks";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("docId", "docId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(
  mode: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

/**
 * Split text into overlapping chunks on sentence boundaries.
 *
 * Overlap matters: a fact that straddles a chunk edge would otherwise be
 * unfindable from either side.
 */
export function chunk(text: string, target = 700, overlap = 120): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (clean.length <= target) return clean ? [clean] : [];

  const sentences = clean.split(/(?<=[.!?])\s+|\n{2,}/).filter(Boolean);
  const out: string[] = [];
  let buf = "";

  for (const s of sentences) {
    if (buf.length + s.length + 1 > target && buf) {
      out.push(buf.trim());
      buf = buf.slice(Math.max(0, buf.length - overlap));
    }
    buf += (buf ? " " : "") + s;
  }
  if (buf.trim()) out.push(buf.trim());

  // A single sentence longer than the target still needs splitting.
  return out.flatMap((c) =>
    c.length <= target * 2
      ? [c]
      : (c.match(new RegExp(`.{1,${target}}`, "g")) ?? [c]),
  );
}

export async function addDocument(name: string, text: string): Promise<number> {
  const parts = chunk(text);
  const docId = `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const at = Date.now();

  for (let i = 0; i < parts.length; i++) {
    const c: DocChunk = {
      id: `${docId}-${i}`,
      docId,
      docName: name,
      text: parts[i],
      index: i,
      at,
    };
    await tx("readwrite", (s) => s.put(c));
  }
  return parts.length;
}

export async function allChunks(): Promise<DocChunk[]> {
  try {
    return await tx<DocChunk[]>("readonly", (s) => s.getAll() as IDBRequest<DocChunk[]>);
  } catch {
    return [];
  }
}

export interface DocHit {
  docName: string;
  text: string;
  index: number;
}

/** Retrieve the passages most relevant to a question. */
export async function search(query: string, limit = 4): Promise<DocHit[]> {
  const chunks = await allChunks();
  if (!chunks.length) return [];

  // Reuse the memory ranker by presenting chunks in its shape.
  const asMemories: Memory[] = chunks.map((c) => ({
    id: c.id,
    text: c.text,
    kind: "note",
    at: c.at,
    hits: 0,
  }));

  const ranked = rank(query, asMemories, limit);
  const byId = new Map(chunks.map((c) => [c.id, c]));

  return ranked.flatMap((m) => {
    const c = byId.get(m.id);
    return c ? [{ docName: c.docName, text: c.text, index: c.index }] : [];
  });
}

export async function listDocuments(): Promise<{ name: string; chunks: number }[]> {
  const all = await allChunks();
  const counts = new Map<string, number>();
  for (const c of all) counts.set(c.docName, (counts.get(c.docName) ?? 0) + 1);
  return [...counts.entries()].map(([name, chunks]) => ({ name, chunks }));
}

export async function clearDocuments() {
  await tx("readwrite", (s) => s.clear());
}

export { tokenize };
