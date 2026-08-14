export type Speaker = "user" | "jarvis" | "system";

export interface LogEntry {
  id: string;
  speaker: Speaker;
  text: string;
  at: number;
  /** Optional structured payload rendered under the message. */
  meta?: string[];
  tone?: "neutral" | "ok" | "warn" | "danger";
}

export type SystemStatus = "offline" | "booting" | "online" | "alert";

export interface Subsystem {
  id: string;
  label: string;
  value: number;
  unit: string;
  target: number;
  drift: number;
  tone: "hud" | "amber" | "danger" | "ok";
}

export interface Threat {
  id: string;
  label: string;
  bearing: number;
  distance: number;
  level: "low" | "medium" | "high";
}

export interface CommandContext {
  say: (text: string, opts?: Partial<Omit<LogEntry, "id" | "at" | "text">>) => void;
  setPower: (v: number) => void;
  setStatus: (s: SystemStatus) => void;
  power: number;
  status: SystemStatus;
}

export interface CommandSpec {
  name: string;
  aliases?: string[];
  usage: string;
  summary: string;
  match: (input: string) => boolean;
  run: (input: string, ctx: CommandContext) => void | Promise<void>;
}
