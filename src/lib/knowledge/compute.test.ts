import { describe, expect, it } from "vitest";
import {
  analyseText,
  bearing,
  compassPoint,
  factorise,
  fromBase64,
  fromRoman,
  gcd,
  generatePassword,
  hash,
  haversine,
  isPrime,
  lcm,
  moonPhase,
  parseColour,
  passwordEntropy,
  rollDice,
  sunTimes,
  toBase,
  toBase64,
  toRoman,
} from "./compute";

describe("roman numerals", () => {
  it.each([
    [1, "I"], [4, "IV"], [9, "IX"], [14, "XIV"], [40, "XL"], [90, "XC"],
    [400, "CD"], [1987, "MCMLXXXVII"], [2026, "MMXXVI"], [3999, "MMMCMXCIX"],
  ])("%s <-> %s", (n, r) => {
    expect(toRoman(n)).toBe(r);
    expect(fromRoman(r)).toBe(n);
  });

  it("round-trips the whole supported range", () => {
    for (let n = 1; n <= 3999; n += 7) expect(fromRoman(toRoman(n))).toBe(n);
  });

  it("rejects out-of-range and malformed input", () => {
    expect(() => toRoman(0)).toThrow();
    expect(() => toRoman(4000)).toThrow();
    expect(() => toRoman(1.5)).toThrow();
    expect(() => fromRoman("IIII")).toThrow(); // not canonical
    expect(() => fromRoman("ABC")).toThrow();
  });
});

describe("number theory", () => {
  it("identifies primes", () => {
    expect([2, 3, 5, 7, 97, 7919].every(isPrime)).toBe(true);
    expect([0, 1, 4, 9, 100, 7917].some(isPrime)).toBe(false);
  });

  it("factorises correctly", () => {
    expect(factorise(360)).toEqual([2, 2, 2, 3, 3, 5]);
    expect(factorise(97)).toEqual([97]);
    // The product of factors must always reconstruct the input.
    for (const n of [12, 100, 999, 1024, 65_537]) {
      expect(factorise(n).reduce((a, b) => a * b, 1)).toBe(n);
    }
  });

  it("computes gcd and lcm", () => {
    expect(gcd(48, 18)).toBe(6);
    expect(lcm(4, 6)).toBe(12);
    // gcd(a,b) * lcm(a,b) === a*b
    expect(gcd(21, 6) * lcm(21, 6)).toBe(21 * 6);
  });

  it("converts bases", () => {
    expect(toBase(255, 16)).toBe("FF");
    expect(toBase(5, 2)).toBe("101");
    expect(() => toBase(5, 99)).toThrow();
  });
});

describe("colour", () => {
  it("parses hex and computes derived values", () => {
    const c = parseColour("#ff0000")!;
    expect(c.rgb).toEqual([255, 0, 0]);
    expect(c.hsl[0]).toBe(0);
    // Pure red has luminance 0.2126, above the WCAG 0.179 pivot, so black
    // text scores 5.25:1 against white's 4.0:1.
    expect(c.readableOn).toBe("black");
  });

  it("expands shorthand hex", () => {
    expect(parseColour("#fff")!.rgb).toEqual([255, 255, 255]);
  });

  it("picks a legible foreground", () => {
    expect(parseColour("#ffffff")!.readableOn).toBe("black");
    expect(parseColour("#000000")!.readableOn).toBe("white");
  });

  it("parses rgb() and rejects nonsense", () => {
    expect(parseColour("rgb(0, 128, 255)")!.hex).toBe("#0080ff");
    expect(parseColour("not a colour")).toBeNull();
    expect(parseColour("rgb(300,0,0)")).toBeNull();
  });
});

describe("astronomy", () => {
  it("computes plausible sunrise and sunset", () => {
    // Addis Ababa in August — near-equatorial, roughly 12h days.
    const t = sunTimes(new Date("2026-08-14T12:00:00Z"), 9.03, 38.74);
    expect(t.sunrise).not.toBeNull();
    expect(t.dayLengthHours).toBeGreaterThan(11);
    expect(t.dayLengthHours).toBeLessThan(13);
    expect(t.sunrise!.getTime()).toBeLessThan(t.sunset!.getTime());
  });

  it("detects the midnight sun", () => {
    const t = sunTimes(new Date("2026-06-21T12:00:00Z"), 78, 15); // Svalbard
    expect(t.polar).toBe("day");
  });

  it("detects polar night", () => {
    const t = sunTimes(new Date("2026-12-21T12:00:00Z"), 78, 15);
    expect(t.polar).toBe("night");
  });

  it("computes moon phase within range", () => {
    const m = moonPhase(new Date());
    expect(m.phase).toBeGreaterThanOrEqual(0);
    expect(m.phase).toBeLessThanOrEqual(1);
    expect(m.illumination).toBeGreaterThanOrEqual(0);
    expect(m.illumination).toBeLessThanOrEqual(1);
    expect(m.name.length).toBeGreaterThan(0);
  });

  it("returns a full moon near a known full moon date", () => {
    // 2026-01-03 was a full moon.
    const m = moonPhase(new Date("2026-01-03T12:00:00Z"));
    expect(m.illumination).toBeGreaterThan(0.9);
  });
});

describe("geodesy", () => {
  it("measures known distances", () => {
    // London to Paris, ~344 km.
    expect(haversine(51.5074, -0.1278, 48.8566, 2.3522)).toBeCloseTo(344, -1);
  });

  it("is zero for identical points and symmetric", () => {
    expect(haversine(9, 38, 9, 38)).toBeCloseTo(0, 6);
    expect(haversine(9, 38, 51, 0)).toBeCloseTo(haversine(51, 0, 9, 38), 6);
  });

  it("computes bearings and compass points", () => {
    expect(bearing(0, 0, 10, 0)).toBeCloseTo(0, 1); // due north
    expect(compassPoint(0)).toBe("N");
    expect(compassPoint(90)).toBe("E");
    expect(compassPoint(180)).toBe("S");
    expect(compassPoint(270)).toBe("W");
  });
});

describe("text analysis", () => {
  it("counts accurately", () => {
    const a = analyseText("The cat sat. The dog ran! Did they play?");
    expect(a.words).toBe(9);
    expect(a.sentences).toBe(3);
  });

  it("produces a readability score in range", () => {
    const a = analyseText("This is a simple sentence for testing purposes.");
    expect(a.readability).toBeGreaterThanOrEqual(0);
    expect(a.readability).toBeLessThanOrEqual(100);
  });

  it("finds frequent words, ignoring stop words", () => {
    const a = analyseText("reactor reactor reactor the the the palladium");
    expect(a.topWords[0][0]).toBe("reactor");
    expect(a.topWords.map((w) => w[0])).not.toContain("the");
  });
});

describe("encoding", () => {
  it("round-trips base64 including unicode", () => {
    for (const s of ["hello", "JARVIS online", "ሰላም ዓለም", "日本語 123 !@#"]) {
      expect(fromBase64(toBase64(s))).toBe(s);
    }
  });

  it("hashes deterministically", async () => {
    const a = await hash("abc", "SHA-256");
    expect(a).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(await hash("abc", "SHA-256")).toBe(a);
  });
});

describe("secure generation", () => {
  it("respects length and includes each character class", () => {
    const pw = generatePassword(24, true);
    expect(pw).toHaveLength(24);
    expect(/[a-z]/.test(pw)).toBe(true);
    expect(/[A-Z]/.test(pw)).toBe(true);
    expect(/[0-9]/.test(pw)).toBe(true);
    expect(/[^a-zA-Z0-9]/.test(pw)).toBe(true);
  });

  it("clamps absurd lengths", () => {
    expect(generatePassword(2).length).toBeGreaterThanOrEqual(8);
    expect(generatePassword(9999).length).toBeLessThanOrEqual(128);
  });

  it("does not repeat", () => {
    const set = new Set(Array.from({ length: 50 }, () => generatePassword(16)));
    expect(set.size).toBe(50);
  });

  it("scores entropy sensibly", () => {
    expect(passwordEntropy("aaaa")).toBeLessThan(passwordEntropy("aA1!aA1!"));
  });
});

describe("dice", () => {
  it("parses notation and stays in range", () => {
    const r = rollDice("3d6+2")!;
    expect(r.rolls).toHaveLength(3);
    expect(r.notation).toBe("3d6+2");
    for (const v of r.rolls) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
    expect(r.total).toBe(r.rolls.reduce((a, b) => a + b, 0) + 2);
  });

  it("defaults the count to one", () => {
    expect(rollDice("d20")!.rolls).toHaveLength(1);
  });

  it("rejects non-dice input", () => {
    expect(rollDice("hello")).toBeNull();
  });
});

describe("edge cases found by live auditing", () => {
  it("does not call 1, 0 or negatives composite", () => {
    // isPrime is correct; the provider previously reported "1 is composite".
    expect(isPrime(1)).toBe(false);
    expect(isPrime(0)).toBe(false);
    expect(isPrime(-7)).toBe(false);
    // A unit has no prime factorisation.
    expect(factorise(1)).toEqual([]);
    expect(factorise(0)).toEqual([]);
  });

  it("honours a one-sided die instead of promoting it to d2", () => {
    const r = rollDice("100d1")!;
    expect(r.notation).toBe("100d1");
    expect(r.rolls.every((v) => v === 1)).toBe(true);
    expect(r.total).toBe(100);
  });

  it("still clamps absurd dice", () => {
    expect(rollDice("9999d6")!.rolls.length).toBeLessThanOrEqual(100);
    expect(rollDice("1d99999")).not.toBeNull();
  });
});
