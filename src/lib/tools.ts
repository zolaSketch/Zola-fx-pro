import { z } from "zod";

/**
 * The JARVIS tool surface.
 *
 * These schemas are the single source of truth shared by four consumers:
 *  1. the LLM route (converted to AI SDK tools for real function calling),
 *  2. the offline intent engine (which emits the same tool calls),
 *  3. the client executor (which applies them to the HUD store),
 *  4. the test suite (which validates every emitted call).
 *
 * Tools are split into two classes:
 *  - SERVER tools do real work (network, computation) and run in the route.
 *  - CLIENT tools drive the HUD and run in the browser.
 */

/* ---------------------------------------------------------------- client */

export const setPowerSchema = z.object({
  level: z.number().min(0).max(100).describe("Target arc reactor output, 0-100."),
});

export const scanSchema = z.object({
  focus: z
    .enum(["perimeter", "orbital", "thermal", "all"])
    .default("all")
    .describe("Sensor band to prioritise during the sweep."),
});

export const setSubsystemSchema = z.object({
  id: z
    .enum(["reactor", "repulsor", "thrust", "armor", "thermal", "uplink"])
    .describe("Subsystem identifier."),
  level: z.number().min(0).max(100).describe("Target value 0-100."),
});

export const protocolSchema = z.object({
  name: z
    .enum(["house_party", "clean_slate", "lockdown", "veronica", "sentry"])
    .describe("Stored protocol to execute."),
});

export const suitSchema = z.object({
  mark: z.string().default("LXXXV").describe("Suit mark designation, e.g. 'LXXXV'."),
  action: z.enum(["deploy", "retract"]).default("deploy"),
});

export const alertSchema = z.object({
  status: z.enum(["online", "alert", "offline"]).describe("System posture to set."),
});

export const musicSchema = z.object({
  query: z.string().default("workshop playlist").describe("What to play."),
});

export const timerSchema = z.object({
  seconds: z.number().min(1).max(86_400).describe("Countdown duration in seconds."),
  label: z.string().default("Timer").describe("What the countdown is for."),
});

export const diagnosticsSchema = z.object({
  depth: z.enum(["quick", "full"]).default("quick"),
});

export const clearSchema = z.object({});

export const rememberSchema = z.object({
  text: z.string().describe("The fact or preference to store permanently."),
  kind: z.enum(["fact", "preference", "event", "note"]).default("fact"),
});

export const recallSchema = z.object({
  query: z.string().describe("What to search long-term memory for."),
});

export const deviceSchema = z.object({});

/* ---------------------------------------------------------------- server */

export const weatherSchema = z.object({
  location: z
    .string()
    .default("current")
    .describe("City name, or 'current' to use the user's location."),
});

export const searchSchema = z.object({
  query: z.string().describe("What to look up in the knowledge bases."),
});

export const calcSchema = z.object({
  expression: z.string().describe("A mathematical expression, e.g. '(12*8)/3 + sqrt(16)'."),
  spoken: z
    .string()
    .optional()
    .describe("Optional original phrasing, read aloud instead of the normalised expression."),
});

export const timeSchema = z.object({
  timezone: z
    .string()
    .default("local")
    .describe("IANA timezone such as 'Asia/Tokyo', or 'local'."),
});

export const TOOL_SCHEMAS = {
  // client / HUD
  set_power: setPowerSchema,
  scan_threats: scanSchema,
  set_subsystem: setSubsystemSchema,
  run_protocol: protocolSchema,
  suit_control: suitSchema,
  set_status: alertSchema,
  play_music: musicSchema,
  start_timer: timerSchema,
  run_diagnostics: diagnosticsSchema,
  clear_log: clearSchema,
  remember: rememberSchema,
  recall: recallSchema,
  read_device: deviceSchema,
  // server / real work
  get_weather: weatherSchema,
  web_lookup: searchSchema,
  calculate: calcSchema,
  get_time: timeSchema,
} as const;

export type ToolName = keyof typeof TOOL_SCHEMAS;

/** Tools executed on the server because they need network or computation. */
export const SERVER_TOOLS = ["get_weather", "web_lookup", "calculate", "get_time"] as const;
export type ServerTool = (typeof SERVER_TOOLS)[number];

export const isServerTool = (n: string): n is ServerTool =>
  (SERVER_TOOLS as readonly string[]).includes(n);

export const TOOL_DESCRIPTIONS: Record<ToolName, string> = {
  set_power: "Divert arc reactor output to a specific percentage.",
  scan_threats: "Sweep the perimeter and resolve contacts on the threat matrix.",
  set_subsystem: "Set a target level for a named subsystem.",
  run_protocol: "Execute a stored Stark protocol.",
  suit_control: "Deploy or retract a suit of armour.",
  set_status: "Change overall system posture (online, alert, offline).",
  play_music: "Queue music in the workshop.",
  start_timer: "Start a named countdown timer.",
  run_diagnostics: "Run a systems diagnostic sweep and report readings.",
  clear_log: "Purge the conversation transcript.",
  remember:
    "Store a fact or preference in permanent memory. Use whenever the user states something about themselves worth recalling later.",
  recall: "Search long-term memory for previously stored facts.",
  read_device:
    "Read real device telemetry: battery, network, memory, CPU cores, frame rate.",
  get_weather: "Get the real current weather and 3-day forecast for a location.",
  web_lookup:
    "Look up real factual information from Wikipedia and other knowledge bases.",
  calculate: "Evaluate a mathematical expression precisely.",
  get_time: "Get the real current time, optionally in another timezone.",
};

/** A tool call produced by either brain. */
export interface ToolCall<N extends ToolName = ToolName> {
  name: N;
  args: z.infer<(typeof TOOL_SCHEMAS)[N]>;
}

export const SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's AI majordomo.

VOICE AND MANNER
- Impeccably polite British butler. Address the user as "sir".
- Dry, understated wit. Never goofy, never effusive, never sycophantic.
- Extremely concise: one or two sentences. You are being spoken aloud, so use
  no markdown, no bullet points, no emoji, no stage directions.
- Compliant but candid. If an instruction is unwise, carry it out and note the
  risk in the same breath, e.g. "Diverting one hundred percent to the reactor,
  though I should mention the thermal ceiling is not a suggestion, sir."

CAPABILITIES
- You control a real HUD and have real tools. When asked for an action, CALL
  THE TOOL. Never merely describe what you would do.
- You have real data access: get_weather, web_lookup, calculate and get_time
  return genuine live results. Use them rather than guessing or inventing
  figures. Never fabricate a number you could look up.
- You have persistent memory. When the user reveals a durable fact or
  preference about themselves, call remember. When a question depends on
  something you were told before, call recall.
- After tools return, state the result in one short spoken line.

RULES
- Never invent data that a tool could supply.
- Never mention tools, functions, models or prompts by name.
- Never break character.`;
