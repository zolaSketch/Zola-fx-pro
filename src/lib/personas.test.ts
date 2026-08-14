import { describe, expect, it } from "vitest";
import { DEFAULT_PERSONA, PERSONAS, detectPersonaSwitch, getPersona } from "./personas";
import { deriveTitle } from "./conversations";
import type { LogEntry } from "./types";
import { understand } from "./brain";

describe("personas", () => {
  it("every mode is complete", () => {
    for (const p of PERSONAS) {
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.prompt.length).toBeGreaterThan(20);
      expect(p.greeting.length).toBeGreaterThan(0);
    }
  });

  it("has a valid default and unique ids", () => {
    expect(getPersona(DEFAULT_PERSONA).id).toBe(DEFAULT_PERSONA);
    expect(new Set(PERSONAS.map((p) => p.id)).size).toBe(PERSONAS.length);
  });

  it("falls back rather than throwing on an unknown id", () => {
    expect(getPersona("nonsense" as "butler").id).toBe("butler");
  });

  it.each([
    ["switch to engineer mode", "engineer"],
    ["engineering mode please", "engineer"],
    ["act as an analyst", "analyst"],
    ["tactical mode", "tactical"],
    ["be my tutor", "tutor"],
    ["back to default mode", "butler"],
  ])("detects %s", (input, want) => {
    expect(detectPersonaSwitch(input)).toBe(want);
  });

  it("does not fire on ordinary sentences", () => {
    // These mention mode-ish words but are not switch requests.
    for (const s of [
      "what is the speed of light",
      "is 7919 prime",
      "tell me about the engineer who built it",
      "suit up",
    ]) {
      expect(detectPersonaSwitch(s)).toBeNull();
    }
  });

  it("routes a switch through the brain as a tool call", () => {
    const { calls } = understand("switch to tactical mode");
    expect(calls[0].name).toBe("set_persona");
    expect((calls[0].args as { persona: string }).persona).toBe("tactical");
  });
});

describe("conversation titles", () => {
  const msg = (speaker: LogEntry["speaker"], text: string): LogEntry => ({
    id: Math.random().toString(36),
    speaker,
    text,
    at: Date.now(),
  });

  it("uses the first user message", () => {
    expect(
      deriveTitle([msg("system", "boot"), msg("user", "is 7919 prime"), msg("jarvis", "Yes")]),
    ).toBe("is 7919 prime");
  });

  it("truncates on a word boundary", () => {
    const long = "tell me everything you know about the periodic table of elements please";
    const t = deriveTitle([msg("user", long)]);
    expect(t.length).toBeLessThanOrEqual(50);
    expect(t.endsWith("…")).toBe(true);
    // Must not cut mid-word.
    expect(t.slice(0, -1).trim()).toBe(t.slice(0, -1).trimEnd());
  });

  it("falls back when there is no user turn", () => {
    expect(deriveTitle([msg("system", "boot")])).toMatch(/^Session /);
    expect(deriveTitle([])).toMatch(/^Session /);
  });

  it("collapses whitespace", () => {
    expect(deriveTitle([msg("user", "  hello   there  ")])).toBe("hello there");
  });
});
