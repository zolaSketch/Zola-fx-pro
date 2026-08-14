import { NextRequest } from "next/server";
import { understand } from "@/lib/brain";
import { SYSTEM_PROMPT, TOOL_DESCRIPTIONS, TOOL_SCHEMAS, type ToolName } from "@/lib/tools";

export const runtime = "nodejs";
export const maxDuration = 30;

interface Msg {
  role: "user" | "assistant";
  content: string;
}

/**
 * Streams JARVIS responses as newline-delimited JSON events:
 *   {"type":"text","value":"..."}      incremental spoken text
 *   {"type":"tool","name":..,"args":{}} a HUD action to execute
 *   {"type":"done","engine":"llm"|"local"}
 *
 * Uses a real tool-calling LLM when OPENAI_API_KEY is present, and the local
 * intent engine otherwise, so the assistant is always fully functional.
 */
export async function POST(req: NextRequest) {
  let messages: Msg[] = [];
  try {
    const body = await req.json();
    messages = Array.isArray(body?.messages) ? body.messages : [];
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const encoder = new TextEncoder();
  const hasKey = Boolean(process.env.OPENAI_API_KEY);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      try {
        if (hasKey) {
          await streamFromLLM(messages, send);
        } else {
          await streamFromLocal(last, send);
        }
      } catch (err) {
        // Never leave the HUD hanging — degrade to the local brain.
        console.error("[jarvis] generation failed, using local brain:", err);
        try {
          await streamFromLocal(last, send);
        } catch {
          send({ type: "text", value: "My apologies, sir. I am having trouble responding." });
          send({ type: "done", engine: "local" });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

type Send = (obj: unknown) => void;

/** Real LLM path: streaming text plus native tool calls. */
async function streamFromLLM(messages: Msg[], send: Send) {
  const { streamText, tool, stepCountIs } = await import("ai");
  const { createOpenAI } = await import("@ai-sdk/openai");

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Tools are declared with the shared zod schemas. They have no execute()
  // on the server — the HUD lives in the browser, so we forward the calls to
  // the client, which applies them to the store.
  //
  // Each schema has a distinct shape, so building the record via a mapped
  // Object.fromEntries collapses them into a union that no longer satisfies
  // the generic tool() signature. Constructing entries individually and
  // widening once keeps the runtime behaviour identical with sound typing.
  const tools: Record<string, ReturnType<typeof tool>> = {};
  for (const name of Object.keys(TOOL_SCHEMAS) as ToolName[]) {
    tools[name] = tool({
      description: TOOL_DESCRIPTIONS[name],
      inputSchema: TOOL_SCHEMAS[name],
    } as Parameters<typeof tool>[0]);
  }

  const result = streamText({
    model: openai(process.env.JARVIS_MODEL ?? "gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    tools,
    stopWhen: stepCountIs(3),
    temperature: 0.7,
  });

  for await (const part of result.fullStream) {
    if (part.type === "text-delta") {
      const value = (part as { text?: string }).text ?? "";
      if (value) send({ type: "text", value });
    } else if (part.type === "tool-call") {
      const p = part as { toolName: string; input?: unknown };
      send({ type: "tool", name: p.toolName, args: p.input ?? {} });
    }
  }

  send({ type: "done", engine: "llm" });
}

/** Offline path: deterministic intent engine, streamed word by word. */
async function streamFromLocal(input: string, send: Send) {
  const { reply, calls } = understand(input);

  const words = reply.split(/(\s+)/);
  for (const w of words) {
    send({ type: "text", value: w });
    if (w.trim()) await sleep(14 + Math.random() * 26);
  }
  for (const c of calls) send({ type: "tool", name: c.name, args: c.args });

  send({ type: "done", engine: "local" });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
