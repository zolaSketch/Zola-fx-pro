"use client";

/**
 * Long-term memory with lexical semantic recall.
 *
 * Memories persist in IndexedDB and are retrieved by TF-IDF cosine similarity
 * over character-aware tokens. This runs entirely on-device: no embedding API,
 * no key, no network — so recall works even offline, and nothing the user says
 * ever leaves the machine unless they enable the LLM.
 */

export interface Memory {
  id: string;
  text: string;
  kind: "fact" | "preference" | "event" | "note";
  at: number;
  hits: number;
}

const DB = "jarvis-memory";
const STORE = "memories";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "to", "of", "and", "or",
  "in", "on", "at", "for", "with", "my", "your", "i", "you", "it", "that",
  "this", "sir", "jarvis", "please", "do", "does", "did", "have", "has",
]);

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function termFreq(tokens: string[]) {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

/**
 * Rank memories against a query using TF-IDF weighted cosine similarity.
 * Exported separately from storage so it is directly unit-testable.
 */
export function rank(query: string, memories: Memory[], limit = 5): Memory[] {
  const qTokens = tokenize(query);
  if (!qTokens.length || !memories.length) return [];

  const docs = memories.map((m) => tokenize(m.text));
  const N = docs.length;

  // Document frequency per term.
  const df = new Map<string, number>();
  for (const d of docs) {
    for (const term of new Set(d)) df.set(term, (df.get(term) ?? 0) + 1);
  }
  const idf = (term: string) => Math.log(1 + N / (1 + (df.get(term) ?? 0)));

  const qtf = termFreq(qTokens);
  let qNorm = 0;
  for (const [term, f] of qtf) qNorm += (f * idf(term)) ** 2;
  qNorm = Math.sqrt(qNorm) || 1;

  const scored = memories.map((m, i) => {
    const dtf = termFreq(docs[i]);
    let dot = 0;
    let dNorm = 0;
    for (const [term, f] of dtf) {
      const w = f * idf(term);
      dNorm += w * w;
      const qw = (qtf.get(term) ?? 0) * idf(term);
      if (qw) dot += w * qw;
    }
    dNorm = Math.sqrt(dNorm) || 1;
    const cosine = dot / (qNorm * dNorm);

    // Slight preference for recent and frequently-recalled memories.
    const ageDays = (Date.now() - m.at) / 86_400_000;
    const recency = 1 / (1 + ageDays / 30);
    const score = cosine * 0.82 + recency * 0.12 + Math.min(m.hits, 5) * 0.012;

    return { m, score, cosine };
  });

  return scored
    .filter((s) => s.cosine > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.m);
}

export async function remember(
  text: string,
  kind: Memory["kind"] = "fact",
): Promise<Memory> {
  const mem: Memory = {
    id: `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    text: text.trim(),
    kind,
    at: Date.now(),
    hits: 0,
  };
  await tx("readwrite", (s) => s.put(mem));
  return mem;
}

export async function allMemories(): Promise<Memory[]> {
  try {
    const all = await tx<Memory[]>("readonly", (s) => s.getAll() as IDBRequest<Memory[]>);
    return all.sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

export async function recall(query: string, limit = 5): Promise<Memory[]> {
  const all = await allMemories();
  const hits = rank(query, all, limit);
  // Reinforce what proves useful.
  for (const h of hits) {
    void tx("readwrite", (s) => s.put({ ...h, hits: h.hits + 1 }));
  }
  return hits;
}

export async function forget(id: string) {
  await tx("readwrite", (s) => s.delete(id));
}

export async function forgetAll() {
  await tx("readwrite", (s) => s.clear());
}
