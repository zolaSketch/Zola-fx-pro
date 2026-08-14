"use client";

import type { LogEntry } from "./types";

/**
 * Persistent conversation history.
 *
 * Every mature assistant surveyed keeps a searchable sidebar of past chats
 * with auto-generated titles. Ours previously lost the entire transcript on
 * reload, which made the memory feature feel unreliable even though it worked.
 *
 * Stored in IndexedDB on the device — transcripts never leave the machine.
 */

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: LogEntry[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: number;
  messageCount: number;
}

const DB = "jarvis-conversations";
const STORE = "chats";

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
 * Derive a title from the first thing the user actually asked.
 * Falls back to the timestamp when the opening turn is not descriptive.
 */
export function deriveTitle(messages: LogEntry[]): string {
  const first = messages.find((m) => m.speaker === "user" && m.text.trim());
  if (!first) return `Session ${new Date().toLocaleString()}`;

  const t = first.text.trim().replace(/\s+/g, " ");
  if (t.length <= 48) return t;
  // Cut on a word boundary rather than mid-word.
  const cut = t.slice(0, 48);
  const space = cut.lastIndexOf(" ");
  return `${(space > 24 ? cut.slice(0, space) : cut).trim()}…`;
}

export async function saveConversation(
  id: string,
  messages: LogEntry[],
): Promise<void> {
  // A transcript with no real exchange is not worth keeping.
  const meaningful = messages.filter((m) => m.speaker !== "system" && m.text.trim());
  if (meaningful.length < 2) return;

  const existing = await getConversation(id);
  const record: Conversation = {
    id,
    title: existing?.title ?? deriveTitle(messages),
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    messages: messages.slice(-200),
  };
  await tx("readwrite", (s) => s.put(record));
}

export async function getConversation(id: string): Promise<Conversation | null> {
  try {
    return (await tx<Conversation | undefined>("readonly", (s) => s.get(id))) ?? null;
  } catch {
    return null;
  }
}

export async function listConversations(): Promise<ConversationSummary[]> {
  try {
    const all = await tx<Conversation[]>(
      "readonly",
      (s) => s.getAll() as IDBRequest<Conversation[]>,
    );
    return all
      .map((c) => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt,
        messageCount: c.messages.filter((m) => m.speaker !== "system").length,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

/** Full-text search across every stored transcript. */
export async function searchConversations(
  query: string,
): Promise<ConversationSummary[]> {
  const q = query.trim().toLowerCase();
  if (!q) return listConversations();

  try {
    const all = await tx<Conversation[]>(
      "readonly",
      (s) => s.getAll() as IDBRequest<Conversation[]>,
    );
    return all
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.text.toLowerCase().includes(q)),
      )
      .map((c) => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt,
        messageCount: c.messages.filter((m) => m.speaker !== "system").length,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function renameConversation(id: string, title: string) {
  const c = await getConversation(id);
  if (!c) return;
  await tx("readwrite", (s) => s.put({ ...c, title: title.trim() || c.title }));
}

export async function deleteConversation(id: string) {
  await tx("readwrite", (s) => s.delete(id));
}

export async function clearConversations() {
  await tx("readwrite", (s) => s.clear());
}

export const newConversationId = () =>
  `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
