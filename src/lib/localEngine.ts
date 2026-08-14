"use client";

import { understand } from "./brain";
import { runServerTool } from "./capabilities";
import { isServerTool } from "./tools";

/**
 * In-browser cognition.
 *
 * Mirrors what /api/chat does, but entirely on the device, so JARVIS works
 * with no backend at all. This is what makes a static deployment (GitHub
 * Pages) fully functional: the intent engine, the offline knowledge core,
 * arithmetic, memory and the computed providers are all pure TypeScript with
 * no server dependency.
 *
 * Network-backed capabilities still run — they simply call the public APIs
 * directly from the browser instead of via our server.
 */

export interface LocalEvent {
  type: "text" | "tool" | "result" | "done";
  value?: string;
  name?: string;
  args?: unknown;
  meta?: string[];
  ok?: boolean;
  engine?: "local";
}

/** Yields the same event stream shape the API route produces. */
export async function* runLocally(input: string): AsyncGenerator<LocalEvent> {
  const u = understand(input);

  let reply = u.reply;
  const hudCalls: typeof u.calls = [];

  // Execute real capabilities first so their output becomes the spoken line.
  for (const c of u.calls) {
    if (isServerTool(c.name)) {
      const res = await runServerTool(c.name, c.args as Record<string, unknown>);
      reply = res.summary;
      yield { type: "result", name: c.name, ok: res.ok, meta: res.meta ?? [] };
    } else {
      hudCalls.push(c);
    }
  }

  for (const w of reply.split(/(\s+)/)) {
    if (w) yield { type: "text", value: w };
    if (w.trim()) await sleep(10 + Math.random() * 18);
  }

  for (const c of hudCalls) {
    yield { type: "tool", name: c.name, args: c.args };
  }

  yield { type: "done", engine: "local" };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
