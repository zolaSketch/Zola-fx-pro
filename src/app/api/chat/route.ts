import { NextRequest } from "next/server";
import { understand } from "@/lib/brain";
import { runServerTool } from "@/lib/capabilities";
import {
  SYSTEM_PROMPT,
  TOOL_DESCRIPTIONS,
  TOOL_SCHEMAS,
  isServerTool,
  type ToolName,
} from "@/lib/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

/**
 * Streams JARVIS responses as newline-delimited JSON events:
 *   {"type":"text","value":"..."}          incremental spoken text
 *   {"type":"tool","name":..,"args":{}}    a HUD action for the client
 *   {"type":"result","name":..,"meta":[]}  output of a real server tool
 *   {"type":"done","engine":"llm"|"local"}
 *
 * Server tools (weather, lookup, calculate, time) execute here and their
 * results are fed back to the model so it can answer with real data. HUD tools
 * are forwarded to the browser, which owns that state.
 */
export async function POST(req: NextRequest) {
  let messages: Msg[] = [];
  let memories: string[] = [];
  let persona = "butler";
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
    memories = Array.isArray(body?.memories) ? body.memories.slice(0, 8) : [];
    if (typeof body?.persona === "string") persona = body.persona;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const encoder = new TextEncoder();
  const hasKey = Boolean(process.env.OPENAI_API_KEY);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (obj: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        if (hasKey) {
          try {
            await streamFromLLM(messages, memories, persona, send, req.signal);
          } catch (err) {
            console.error("[jarvis] LLM path failed, falling back:", err);
            send({
              type: "notice",
              value: "Uplink unavailable — running on local cognition.",
            });
            await streamFromLocal(last, send);
          }
        } else {
          await streamFromLocal(last, send);
        }
      } catch (err) {
        console.error("[jarvis] generation failed:", err);
        send({ type: "text", value: "My apologies, sir. I am having trouble responding." });
        send({ type: "done", engine: "local" });
      } finally {
        closed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

type Send = (obj: unknown) => void;

/** Real LLM path: streaming text, real server tools, forwarded HUD tools. */
async function streamFromLLM(
  messages: Msg[],
  memories: string[],
  persona: string,
  send: Send,
  signal?: AbortSignal,
) {
  const { streamText, tool, stepCountIs } = await import("ai");
  const { createOpenAI } = await import("@ai-sdk/openai");

  // baseURL lets the same code target OpenAI, a corporate proxy, OpenRouter,
  // or a local model server (Ollama, LM Studio) without any change.
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {}),
  });

  // Each schema has a distinct shape, so building this record via a mapped
  // Object.fromEntries collapses them into a union that no longer satisfies
  // tool()'s generic signature. Building entries individually keeps runtime
  // behaviour identical with sound typing.
  const tools: Record<string, ReturnType<typeof tool>> = {};
  for (const name of Object.keys(TOOL_SCHEMAS) as ToolName[]) {
    const def: Record<string, unknown> = {
      description: TOOL_DESCRIPTIONS[name],
      inputSchema: TOOL_SCHEMAS[name],
    };

    // Server tools do real work here; the model sees their output and can
    // reason about it. HUD tools have no execute, so the SDK surfaces them as
    // tool-calls which we forward to the browser.
    if (isServerTool(name)) {
      def.execute = async (args: Record<string, unknown>) => {
        const res = await runServerTool(name, args, signal);
        send({ type: "result", name, ok: res.ok, meta: res.meta ?? [] });
        return { ok: res.ok, summary: res.summary, data: res.data ?? null };
      };
    }
    tools[name] = tool(def as Parameters<typeof tool>[0]);
  }

  const memoryBlock = memories.length
    ? `\n\nRELEVANT MEMORIES (things this user told you previously):\n${memories.map((m) => `- ${m}`).join("\n")}`
    : "";

  // Use the Chat Completions endpoint rather than the newer Responses API:
  // it is what proxies, OpenRouter and local servers (Ollama, LM Studio,
  // vLLM) implement, so the same code works against all of them.
  const { getPersona } = await import("@/lib/personas");
  const personaBlock = `\n\nCURRENT MODE\n${getPersona(persona as "butler").prompt}`;

  const result = streamText({
    model: openai.chat(process.env.JARVIS_MODEL ?? "gpt-4o-mini"),
    system: SYSTEM_PROMPT + personaBlock + memoryBlock,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    tools,
    stopWhen: stepCountIs(6),
    temperature: 0.7,
    abortSignal: signal,
    // Fail over to local cognition quickly rather than making the user wait
    // through a long retry ladder when the uplink is unreachable.
    maxRetries: Number(process.env.JARVIS_MAX_RETRIES ?? 1),
  });

  for await (const part of result.fullStream) {
    if (part.type === "text-delta") {
      const value = (part as { text?: string }).text ?? "";
      if (value) send({ type: "text", value });
    } else if (part.type === "tool-call") {
      const p = part as { toolName: string; input?: unknown };
      // Server tools already ran via execute(); only forward HUD tools.
      if (!isServerTool(p.toolName)) {
        send({ type: "tool", name: p.toolName, args: p.input ?? {} });
      }
    } else if (part.type === "error") {
      throw (part as { error?: unknown }).error ?? new Error("stream error");
    }
  }

  send({ type: "done", engine: "llm" });
}

/** Offline path: intent engine plus real capabilities, streamed word by word. */
async function streamFromLocal(input: string, send: Send) {
  const u = understand(input);

  // Run any real capability the intent engine asked for, so offline mode still
  // returns genuine weather, facts and arithmetic — not invented values.
  let reply = u.reply;
  const forward = [];
  for (const c of u.calls) {
    if (isServerTool(c.name)) {
      const res = await runServerTool(c.name, c.args as Record<string, unknown>);
      reply = res.summary;
      send({ type: "result", name: c.name, ok: res.ok, meta: res.meta ?? [] });
    } else {
      forward.push(c);
    }
  }

  for (const w of reply.split(/(\s+)/)) {
    send({ type: "text", value: w });
    if (w.trim()) await sleep(12 + Math.random() * 22);
  }
  for (const c of forward) send({ type: "tool", name: c.name, args: c.args });

  send({ type: "done", engine: "local" });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
