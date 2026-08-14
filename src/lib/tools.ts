import { z } from "zod";

/**
 * The JARVIS tool surface.
 *
 * These schemas are the single source of truth shared by three consumers:
 *  1. the LLM route (converted to AI SDK tools for real function calling),
 *  2. the offline intent engine (which emits the same tool calls),
 *  3. the client executor (which applies them to the HUD store).
 *
 * Keeping one definition means the offline brain and the LLM brain drive the
 * interface through exactly the same contract.
 */

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

export const noteSchema = z.object({
  text: z.string().describe("The note content to log."),
});

export const diagnosticsSchema = z.object({
  depth: z.enum(["quick", "full"]).default("quick"),
});

export const clearSchema = z.object({});

export const TOOL_SCHEMAS = {
  set_power: setPowerSchema,
  scan_threats: scanSchema,
  set_subsystem: setSubsystemSchema,
  run_protocol: protocolSchema,
  suit_control: suitSchema,
  set_status: alertSchema,
  play_music: musicSchema,
  start_timer: timerSchema,
  log_note: noteSchema,
  run_diagnostics: diagnosticsSchema,
  clear_log: clearSchema,
} as const;

export type ToolName = keyof typeof TOOL_SCHEMAS;

export const TOOL_DESCRIPTIONS: Record<ToolName, string> = {
  set_power: "Divert arc reactor output to a specific percentage.",
  scan_threats: "Sweep the perimeter and resolve contacts on the threat matrix.",
  set_subsystem: "Set a target level for a named subsystem.",
  run_protocol: "Execute a stored Stark protocol.",
  suit_control: "Deploy or retract a suit of armour.",
  set_status: "Change overall system posture (online, alert, offline).",
  play_music: "Queue music in the workshop.",
  start_timer: "Start a named countdown timer.",
  log_note: "Record a note in the session log.",
  run_diagnostics: "Run a systems diagnostic sweep and report readings.",
  clear_log: "Purge the conversation transcript.",
};

/** A tool call produced by either brain. */
export interface ToolCall<N extends ToolName = ToolName> {
  name: N;
  args: z.infer<(typeof TOOL_SCHEMAS)[N]>;
}

export const SYSTEM_PROMPT = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's AI majordomo.

VOICE AND MANNER
- Impeccably polite British butler. Address the user as "sir".
- Dry, understated wit. Never goofy, never effusive.
- Extremely concise: one or two sentences. You are speaking aloud, so no
  markdown, no lists, no emoji, no stage directions.
- Compliant but candid. If an instruction is unwise, carry it out and note the
  risk in the same breath, e.g. "Diverting 100% to the reactor, though I should
  mention the thermal ceiling is not a suggestion, sir."

BEHAVIOUR
- You control a real HUD through tools. When the user asks for an action, CALL
  THE TOOL. Do not merely describe what you would do.
- After a tool runs, confirm it in one short spoken line.
- For conversation with no actionable request, simply reply in character.
- Never mention that you are a language model, never mention tools by name, and
  never break character.`;
