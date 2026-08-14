/**
 * Operating modes.
 *
 * Every serious assistant project surveyed (rezaulhreza/jarvis, Open.Jarvis,
 * Leon) exposes switchable personas. They change tone and priorities without
 * changing capability — JARVIS keeps his identity and every tool in all modes.
 */

export type PersonaId = "butler" | "engineer" | "analyst" | "tactical" | "tutor";

export interface Persona {
  id: PersonaId;
  label: string;
  /** One line shown in the switcher. */
  hint: string;
  /** Appended to the system prompt for the LLM path. */
  prompt: string;
  /** Greeting used when the mode is selected. */
  greeting: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "butler",
    label: "BUTLER",
    hint: "Default. Dry, courteous, concise.",
    prompt:
      "Maintain your default manner: impeccably polite, dry, understated, and very brief.",
    greeting: "At your service, sir.",
  },
  {
    id: "engineer",
    label: "ENGINEER",
    hint: "Technical depth, units, trade-offs.",
    prompt:
      "Adopt an engineering register. Give precise figures with units, state assumptions, and name the trade-off in any recommendation. Prefer numbers to adjectives. Stay brief.",
    greeting: "Engineering mode, sir. I shall show my working.",
  },
  {
    id: "analyst",
    label: "ANALYST",
    hint: "Evidence, caveats, confidence.",
    prompt:
      "Adopt an analytical register. Separate what is known from what is inferred, state your confidence, and name the strongest counter-argument. Never present a guess as a fact.",
    greeting: "Analysis mode, sir. I shall flag my confidence throughout.",
  },
  {
    id: "tactical",
    label: "TACTICAL",
    hint: "Terse. Status, risk, action.",
    prompt:
      "Adopt a tactical register. Answer in the fewest words that are still complete. Lead with the status, then the risk, then the recommended action. No pleasantries.",
    greeting: "Tactical mode. Standing by.",
  },
  {
    id: "tutor",
    label: "TUTOR",
    hint: "Explains the reasoning, step by step.",
    prompt:
      "Adopt a teaching register. Explain the reasoning behind the answer in plain language, one step at a time, and check understanding at the end. You may be slightly longer than usual, but never verbose.",
    greeting: "Tutor mode, sir. I shall explain as I go.",
  },
];

export const DEFAULT_PERSONA: PersonaId = "butler";

export const getPersona = (id: PersonaId): Persona =>
  PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];

/** Detect a mode switch in free text, e.g. "switch to engineer mode". */
export function detectPersonaSwitch(input: string): PersonaId | null {
  const s = input.toLowerCase();
  if (!/\b(mode|persona|switch to|act as|be my|become)\b/.test(s)) return null;

  const aliases: Record<PersonaId, RegExp> = {
    butler: /\b(butler|default|normal|standard)\b/,
    engineer: /\b(engineer|engineering|technical|coder|developer)\b/,
    analyst: /\b(analyst|analysis|analytical|research|researcher)\b/,
    tactical: /\b(tactical|combat|terse|brief|military)\b/,
    tutor: /\b(tutor|teacher|teaching|explain|learning|student)\b/,
  };

  for (const [id, re] of Object.entries(aliases) as [PersonaId, RegExp][]) {
    if (re.test(s)) return id;
  }
  return null;
}
