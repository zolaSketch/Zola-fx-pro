import { describe, expect, it, vi, afterEach } from "vitest";
import { ask, classify } from "./index";
import {
  BODIES,
  CONSTANTS,
  ELEMENTS,
  convert,
  findBody,
  findConstant,
  findElement,
} from "./core";

afterEach(() => vi.unstubAllGlobals());

/** Nothing in the offline core may touch the network. */
const forbidNetwork = () =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("offline provider attempted a network call");
    }),
  );

describe("domain classification", () => {
  it.each([
    ["convert 100 km to miles", "units"],
    ["250 f to celsius", "units"],
    ["define serendipity", "definition"],
    ["what does ubiquitous mean", "definition"],
    ["capital of Japan", "country"],
    ["what is the atomic number of gold", "chemistry"],
    ["how big is Jupiter", "space"],
    ["what is the speed of light", "science"],
    ["bitcoin price", "crypto"],
    ["who wrote Dune", "books"],
    ["who is Nikola Tesla", "people"],
    ["the history of jazz", "general"],
  ])("%s -> %s", (q, want) => {
    expect(classify(q)).toBe(want);
  });
});

describe("periodic table", () => {
  it("contains all 118 elements with sane data", () => {
    expect(ELEMENTS).toHaveLength(118);
    for (const e of ELEMENTS) {
      expect(e.sym).toMatch(/^[A-Z][a-z]{0,2}$/);
      expect(e.name.length).toBeGreaterThan(1);
      expect(e.mass).toBeGreaterThan(0);
      expect(e.group.length).toBeGreaterThan(0);
    }
  });

  it("numbers elements sequentially", () => {
    ELEMENTS.forEach((e, i) => expect(e.z).toBe(i + 1));
  });

  it("has no duplicate symbols", () => {
    expect(new Set(ELEMENTS.map((e) => e.sym)).size).toBe(118);
  });

  it("knows landmark elements", () => {
    expect(findElement("gold")!.sym).toBe("Au");
    expect(findElement("what is uranium")!.z).toBe(92);
    expect(findElement("element 6")!.name).toBe("Carbon");
  });

  it("does not match stray words as symbols", () => {
    // "in" is Indium and "at" is Astatine — must not fire on ordinary prose.
    expect(findElement("what is in the box")).toBeNull();
    expect(findElement("look at this")).toBeNull();
  });
});

describe("physical constants", () => {
  it("resolves by name", () => {
    expect(findConstant("what is the speed of light")!.value).toBe(299_792_458);
    expect(findConstant("avogadro constant")!.value).toBeCloseTo(6.02214076e23);
  });

  it("matches whole words only", () => {
    // "c" and "g" are constants; they must not match inside other words.
    expect(findConstant("tell me about cats")).toBeNull();
    expect(findConstant("the great gatsby")).toBeNull();
  });

  it("has valid entries throughout", () => {
    for (const c of CONSTANTS) {
      expect(Number.isFinite(c.value)).toBe(true);
      expect(c.keys.length).toBeGreaterThan(0);
      expect(c.unit.length).toBeGreaterThan(0);
    }
  });
});

describe("astronomy", () => {
  it("knows the planets", () => {
    expect(findBody("how big is jupiter")!.radiusKm).toBe(69_911);
    expect(findBody("mars")!.moons).toBe(2);
  });

  it("has coherent data", () => {
    for (const b of BODIES) {
      expect(b.radiusKm).toBeGreaterThan(0);
      expect(b.massKg).toBeGreaterThan(0);
      expect(b.dayHours).toBeGreaterThan(0);
    }
  });

  it("orders planets outward from the Sun", () => {
    const planets = BODIES.filter((b) => b.distanceAu).map((b) => b.distanceAu!);
    const sorted = [...planets].sort((a, b) => a - b);
    expect(planets).toEqual(sorted);
  });
});

describe("unit conversion", () => {
  it.each([
    ["convert 100 km to miles", 62.137, 0.01],
    ["1 mile in metres", 1609.344, 0.01],
    ["5 kg to pounds", 11.0231, 0.001],
    ["1 gb to mb", 1024, 0.1],
    ["2 hours in minutes", 120, 0.001],
  ])("%s", (q, want, tol) => {
    const c = convert(q);
    expect(c, `no conversion for "${q}"`).not.toBeNull();
    expect(c!.result).toBeCloseTo(want, -Math.log10(tol));
  });

  it("handles temperature offsets", () => {
    expect(convert("100 c to f")!.result).toBeCloseTo(212, 6);
    expect(convert("32 f to c")!.result).toBeCloseTo(0, 6);
    expect(convert("0 c to kelvin")!.result).toBeCloseTo(273.15, 6);
  });

  it("refuses to mix dimensions", () => {
    expect(convert("5 kg to metres")).toBeNull();
    expect(convert("10 seconds to litres")).toBeNull();
  });

  it("ignores non-conversions", () => {
    expect(convert("what is the weather")).toBeNull();
  });
});

describe("router", () => {
  it("answers offline for constants, elements, planets and units", async () => {
    forbidNetwork();
    for (const q of [
      "what is the speed of light",
      "tell me about the element gold",
      "how big is jupiter",
      "convert 10 miles to km",
    ]) {
      const a = await ask(q);
      expect(a, `no answer for "${q}"`).not.toBeNull();
      expect(a!.confidence).toBeGreaterThanOrEqual(0.85);
    }
  });

  it("returns null rather than inventing an answer", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false, status: 500 } as Response)));
    expect(await ask("zzzz nonsense query zzzz")).toBeNull();
  });

  it("survives a provider that throws", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("boom"))));
    // Must not reject — offline core still answers.
    await expect(ask("speed of light")).resolves.not.toBeNull();
    await expect(ask("some random thing")).resolves.toBeNull();
  });

  it("caches repeated questions", async () => {
    forbidNetwork();
    const a = await ask("what is the speed of light");
    const b = await ask("What Is The Speed Of Light");
    expect(b).toBe(a); // same cached object
  });

  it("picks the highest-confidence network answer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("rest_v1")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ title: "Jazz", extract: "Jazz is a music genre." }),
          } as Response);
        }
        return Promise.resolve({ ok: false, status: 404 } as Response);
      }),
    );
    const a = await ask("the history of jazz");
    expect(a!.source).toBe("Wikipedia");
  });
});
