import { describe, expect, it } from "vitest";
import { understand } from "./brain";
import { TOOL_SCHEMAS, isServerTool, type ToolName } from "./tools";

/**
 * The `lookup` rule matches any question word, so it is a greedy catch-all.
 * These tests pin the rule ordering: a regression that moves it earlier would
 * silently send "what's the weather" to Wikipedia instead of the weather API.
 */
describe("intent routing precedence", () => {
  const expectTool = (input: string, tool: ToolName) => {
    const { calls } = understand(input);
    expect(calls.length, `no tool for "${input}"`).toBeGreaterThan(0);
    expect(calls[0].name, `wrong tool for "${input}"`).toBe(tool);
  };

  it("routes weather questions to the weather API", () => {
    expectTool("what's the weather", "get_weather");
    expectTool("what is the weather in Tokyo", "get_weather");
    expectTool("how cold is it", "get_weather");
  });

  it("routes time questions to the clock", () => {
    expectTool("what time is it", "get_time");
    expectTool("what time is it in Tokyo", "get_time");
  });

  it("routes arithmetic to the calculator", () => {
    expectTool("what is 15 * 24", "calculate");
    expectTool("calculate 2^10", "calculate");
  });

  it("routes device questions to telemetry", () => {
    expectTool("what's my battery", "read_device");
  });

  it("still routes HUD commands correctly", () => {
    expectTool("what is the reactor at, set power to 70", "set_power");
    expectTool("scan the perimeter", "scan_threats");
  });

  it("routes unit conversions to knowledge, not the calculator", () => {
    // Regression guard: "convert 100 km to miles" contains digits and could
    // be swallowed by the arithmetic rule.
    expectTool("convert 100 km to miles", "web_lookup");
    expectTool("250 f to celsius", "web_lookup");
    expectTool("how many feet in a mile", "web_lookup");
  });

  it('disambiguates "power": reactor vs exponentiation vs shutdown', () => {
    // Regression: "what is 2 to the power of 64" set the reactor to 2%.
    expectTool("what is 2 to the power of 64", "calculate");
    expectTool("what is 3 raised to the power of 4", "calculate");
    expectTool("divert power to the reactor at 60", "set_power");
    expectTool("set power to 40", "set_power");
  });

  it("evaluates exponentiation phrasing correctly", () => {
    const { calls } = understand("what is 2 to the power of 10");
    expect((calls[0].args as { expression: string }).expression).toBe("2^10");
  });

  it("routes computed-knowledge intents to the knowledge layer", () => {
    // These are numeric or command-like and could be mistaken for arithmetic,
    // reactor commands or a web search.
    for (const q of [
      "is 7919 prime",
      "roll 3d6",
      "flip a coin",
      "45 in roman numerals",
      "what is 255 in hexadecimal",
      "gcd of 48 and 18",
      "generate a password",
      "sha256 of hello",
      "what is the moon phase",
      "word count of this sentence",
    ]) {
      expectTool(q, "web_lookup");
    }
  });

  it("does not let computed intents hijack reactor commands", () => {
    expectTool("set power to 40", "set_power");
    expectTool("divert 80% to the reactor", "set_power");
  });

  it("handles percentage-of phrasing as arithmetic", () => {
    // "15% of 240" previously reached the calculator as a literal "of".
    const { calls } = understand("how much is 15% of 240");
    expect(calls[0].name).toBe("calculate");
    expect((calls[0].args as { expression: string }).expression).not.toMatch(/\bof\b/);
  });

  it("routes coordinate distance queries to knowledge", () => {
    expectTool("distance between 51.5 -0.12 and 48.85 2.35", "web_lookup");
  });

  it("routes live aircraft questions to the ADS-B radar", () => {
    // Must not be captured by the simulated `scan` rule.
    expectTool("what aircraft are near me", "air_traffic");
    expectTool("any planes flying over", "air_traffic");
    expectTool("show air traffic within 50 km", "air_traffic");
  });

  it("keeps the simulated sweep for threat phrasing", () => {
    expectTool("scan the perimeter", "scan_threats");
    expectTool("sweep for threats", "scan_threats");
  });

  it("routes personal document questions to on-device retrieval", () => {
    expectTool("search my notes for the door code", "search_documents");
    expectTool("what did i write about the reactor", "search_documents");
  });

  it("routes definitions to knowledge", () => {
    expectTool("define serendipity", "web_lookup");
    expectTool("what does ubiquitous mean", "web_lookup");
  });

  it("falls through to lookup for genuine knowledge questions", () => {
    expectTool("who is Nikola Tesla", "web_lookup");
    expectTool("what is a black hole", "web_lookup");
    expectTool("tell me about vibranium", "web_lookup");
  });
});

describe("extraction", () => {
  it("pulls the location out of a weather question", () => {
    const { calls } = understand("what's the weather in New York today");
    expect((calls[0].args as { location: string }).location).toBe("new york");
  });

  it("maps a city to an IANA timezone", () => {
    const { calls } = understand("what time is it in tokyo");
    expect((calls[0].args as { timezone: string }).timezone).toBe("Asia/Tokyo");
  });

  it("normalises spoken arithmetic", () => {
    const { calls } = understand("what is 12 plus 5 times 3");
    const expr = (calls[0].args as { expression: string }).expression;
    expect(expr).toBe("12 + 5 * 3");
  });

  it("captures the fact to remember", () => {
    const { calls } = understand("remember that I take my coffee black");
    expect(calls[0].name).toBe("remember");
    expect((calls[0].args as { text: string }).text).toContain("coffee black");
  });
});

describe("tool contract", () => {
  it("every emitted call validates against its schema", () => {
    const corpus = [
      "what's the weather in Paris", "what time is it in london",
      "calculate sqrt(144)", "who is Tony Stark", "remember that I hate mondays",
      "what do you remember about me", "what's my battery level",
      "set power to 60", "suit up", "scan", "lockdown", "timer for 3 minutes",
      "status report", "clear", "play music", "red alert",
    ];
    for (const input of corpus) {
      for (const c of understand(input).calls) {
        const schema = TOOL_SCHEMAS[c.name as ToolName];
        expect(schema, `unknown tool ${c.name}`).toBeDefined();
        expect(
          schema.safeParse(c.args).success,
          `invalid args for ${c.name}: ${JSON.stringify(c.args)}`,
        ).toBe(true);
      }
    }
  });

  it("classifies server tools correctly", () => {
    expect(isServerTool("get_weather")).toBe(true);
    expect(isServerTool("web_lookup")).toBe(true);
    expect(isServerTool("set_power")).toBe(false);
    expect(isServerTool("suit_control")).toBe(false);
  });

  it("never produces a silent turn with no work to do", () => {
    for (const s of ["hello", "thanks", "asdfgh qwerty", "?"]) {
      const u = understand(s);
      expect(u.reply.trim().length > 0 || u.calls.length > 0).toBe(true);
    }
  });
});
