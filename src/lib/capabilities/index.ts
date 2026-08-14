import { calculate } from "./calc";
import { getWeather } from "./weather";
import { lookup } from "./search";
import { fail, ok, type CapabilityResult } from "./types";
import type { ServerTool } from "../tools";

export { calculate, evaluate } from "./calc";
export { getWeather } from "./weather";
export { lookup } from "./search";
export * from "./types";

function getTime(timezone: string): CapabilityResult {
  const tz = timezone && timezone !== "local" ? timezone : undefined;
  try {
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = now.toLocaleDateString("en-GB", {
      timeZone: tz,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const where = tz ? ` in ${tz.replace(/_/g, " ")}` : "";
    return ok(`It is ${time}${where} on ${date}, sir.`, [
      `TIME ....... ${time}`,
      `DATE ....... ${date}`,
      `ZONE ....... ${tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    ]);
  } catch {
    return fail(`I do not recognise the timezone ${timezone}, sir.`);
  }
}

/**
 * Execute a server-side tool. Centralised so the LLM route and any future
 * caller share identical behaviour and error handling.
 */
export async function runServerTool(
  name: ServerTool,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<CapabilityResult> {
  switch (name) {
    case "calculate":
      return calculate(String(args.expression ?? ""));
    case "get_time":
      return getTime(String(args.timezone ?? "local"));
    case "get_weather":
      return getWeather(String(args.location ?? "current"), { signal });
    case "web_lookup":
      return lookup(String(args.query ?? ""), signal);
    default:
      return fail("Unknown capability, sir.");
  }
}
