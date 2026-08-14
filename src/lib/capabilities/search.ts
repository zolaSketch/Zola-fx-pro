import { ask } from "../knowledge";
import { fail, ok, type CapabilityResult } from "./types";

/**
 * Knowledge lookup, federated across many providers.
 *
 * Delegates to the knowledge router, which classifies the question and queries
 * the right specialists: offline cores (constants, elements, planets, unit
 * conversion) answer instantly, while network sources (Wikipedia, dictionary,
 * countries, exchange rates, crypto, books, DuckDuckGo) race in parallel.
 */
export async function lookup(
  query: string,
  signal?: AbortSignal,
): Promise<CapabilityResult> {
  const q = query.trim();
  if (!q) return fail("What would you like me to look up, sir?");

  try {
    const a = await ask(q, signal);
    if (!a) return fail(`I found nothing reliable on ${q}, sir.`);

    const meta = [...(a.meta ?? [])];
    if (a.url) meta.push(a.url);
    if (a.alternates?.length) {
      meta.push(
        `CORROBORATION · ${a.alternates.map((x) => x.source).join(", ")}`,
      );
    }

    return ok(a.summary, meta, a.data);
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    return fail("My uplink to the knowledge bases failed, sir.", [String(e)]);
  }
}
