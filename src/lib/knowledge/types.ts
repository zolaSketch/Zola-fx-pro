/**
 * Knowledge federation layer.
 *
 * "All the world's knowledge" cannot live in a repository — Wikipedia alone is
 * ~100 GB. What is achievable, and what this implements, is federated access to
 * a large slice of it: many specialised providers behind one router, plus an
 * offline core so JARVIS is never entirely ignorant without a network.
 */

export type Domain =
  | "definition"
  | "entity"
  | "country"
  | "science"
  | "chemistry"
  | "space"
  | "geology"
  | "money"
  | "crypto"
  | "units"
  | "numbers"
  | "books"
  | "film"
  | "people"
  | "general";

export interface Answer {
  /** One or two sentences suitable for speaking aloud. */
  summary: string;
  /** Structured rows shown in the HUD. */
  meta?: string[];
  /** Where it came from, e.g. "Wikipedia". */
  source: string;
  url?: string;
  /** 0-1 confidence, used to pick between competing providers. */
  confidence: number;
  data?: unknown;
}

export interface Provider {
  name: string;
  /** Domains this provider is good at. */
  domains: Domain[];
  /** Cheap pre-check so we do not fire pointless requests. */
  canHandle?: (query: string, domain: Domain) => boolean;
  /** Providers that need no network run first and work offline. */
  offline?: boolean;
  run: (query: string, signal?: AbortSignal) => Promise<Answer | null>;
}

/** Strip HTML and collapse whitespace from API prose. */
export function clean(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (m) =>
      ({ "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" })[m] ?? m,
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Take the first `n` sentences — what gets spoken aloud. */
export function firstSentences(text: string, n = 2): string {
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts.slice(0, n).join(" ").trim();
}

export async function fetchJson<T>(
  url: string,
  signal?: AbortSignal,
  timeoutMs = 6000,
): Promise<T | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  const onAbort = () => ac.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { accept: "application/json", "user-agent": "JARVIS/1.0" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

export const fmt = (n: number, digits = 2): string =>
  Math.abs(n) >= 1000
    ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : Number(n.toPrecision(digits + 2)).toLocaleString();
