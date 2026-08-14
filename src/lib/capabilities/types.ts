/** Shared shape for every real capability result. */
export interface CapabilityResult {
  ok: boolean;
  /** One short line JARVIS can speak aloud. */
  summary: string;
  /** Structured rows rendered under the message in the HUD. */
  meta?: string[];
  /** Raw payload, fed back to the LLM for follow-up reasoning. */
  data?: unknown;
}

export const fail = (summary: string, meta?: string[]): CapabilityResult => ({
  ok: false,
  summary,
  meta,
});

export const ok = (
  summary: string,
  meta?: string[],
  data?: unknown,
): CapabilityResult => ({ ok: true, summary, meta, data });
