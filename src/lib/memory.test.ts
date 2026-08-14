import { describe, expect, it } from "vitest";
import { rank, tokenize, type Memory } from "./memory";

const mem = (text: string, ageDays = 0): Memory => ({
  id: Math.random().toString(36),
  text,
  kind: "fact",
  at: Date.now() - ageDays * 86_400_000,
  hits: 0,
});

describe("tokenize", () => {
  it("drops stop words and punctuation", () => {
    expect(tokenize("The coffee is on the table!")).toEqual(["coffee", "table"]);
  });

  it("ignores the assistant's own name", () => {
    expect(tokenize("jarvis sir please")).toEqual([]);
  });
});

describe("semantic recall", () => {
  const corpus = [
    mem("I take my coffee black with no sugar"),
    mem("My workshop door code is 4815"),
    mem("I am allergic to shellfish"),
    mem("My sister's birthday is in March"),
    mem("The Mark VII suit needs a new thruster"),
  ];

  it("finds the topically relevant memory", () => {
    const hits = rank("how do I like my coffee", corpus);
    expect(hits[0].text).toMatch(/coffee/);
  });

  it("matches on a distinctive term", () => {
    expect(rank("shellfish", corpus)[0].text).toMatch(/allergic/);
  });

  it("matches the suit note", () => {
    expect(rank("what is wrong with the thruster", corpus)[0].text).toMatch(/Mark VII/);
  });

  it("returns nothing for unrelated queries", () => {
    expect(rank("quantum chromodynamics", corpus)).toHaveLength(0);
  });

  it("respects the limit", () => {
    expect(rank("my", corpus, 2).length).toBeLessThanOrEqual(2);
  });

  it("handles an empty corpus and empty query", () => {
    expect(rank("coffee", [])).toEqual([]);
    expect(rank("", corpus)).toEqual([]);
  });

  it("prefers a recent memory when relevance ties", () => {
    const tie = [mem("door code is 1111", 400), mem("door code is 2222", 0)];
    expect(rank("door code", tie)[0].text).toContain("2222");
  });

  it("ranks a rare term above a common one", () => {
    const c = [
      mem("the suit is red"),
      mem("the suit is gold"),
      mem("the suit uses vibranium"),
    ];
    expect(rank("vibranium", c)[0].text).toMatch(/vibranium/);
  });
});
