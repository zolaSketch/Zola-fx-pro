import { describe, expect, it } from "vitest";
import { calculate, evaluate } from "./calc";

describe("arithmetic", () => {
  it.each([
    ["1+1", 2],
    ["2*3+4", 10],
    ["2+3*4", 14],
    ["(2+3)*4", 20],
    ["10/4", 2.5],
    ["10%3", 1],
    ["2^10", 1024],
    ["2**8", 256],
    ["-5+3", -2],
    ["--5", 5],
    ["1e3", 1000],
    ["1.5e-2", 0.015],
  ])("%s = %s", (expr, want) => {
    expect(evaluate(expr)).toBeCloseTo(want, 10);
  });

  it("is right-associative for exponentiation", () => {
    // 2^(3^2) = 512, not (2^3)^2 = 64
    expect(evaluate("2^3^2")).toBe(512);
  });

  it("respects unary minus precedence", () => {
    expect(evaluate("-2^2")).toBe(-4);
  });
});

describe("functions and constants", () => {
  it.each([
    ["sqrt(16)", 4],
    ["abs(-7)", 7],
    ["max(3,9,2)", 9],
    ["min(3,9,2)", 2],
    ["hypot(3,4)", 5],
    ["round(2.6)", 3],
    ["log(1000)", 3],
    ["ln(1)", 0],
  ])("%s = %s", (expr, want) => {
    expect(evaluate(expr)).toBeCloseTo(want, 10);
  });

  it("knows pi and e", () => {
    expect(evaluate("pi")).toBeCloseTo(Math.PI, 10);
    expect(evaluate("e")).toBeCloseTo(Math.E, 10);
  });

  it("nests calls", () => {
    expect(evaluate("sqrt(abs(-144))")).toBe(12);
  });
});

/**
 * The evaluator receives untrusted input (voice, LLM output), so it must be
 * impossible to reach the host environment through it.
 */
describe("security", () => {
  const attacks = [
    "process.exit(1)",
    "require('fs')",
    "globalThis",
    "constructor",
    "this",
    "[].constructor",
    "1;process",
    "alert(1)",
    "__proto__",
    "eval('1')",
    "fetch('http://x')",
    "(()=>1)()",
    "window.location",
    "0x41414141.toString",
  ];

  it.each(attacks)("rejects %s", (src) => {
    expect(() => evaluate(src)).toThrow();
  });

  it("rejects unknown identifiers", () => {
    expect(() => evaluate("foo")).toThrow(/Unknown identifier/);
    expect(() => evaluate("foo(1)")).toThrow(/Unknown function/);
  });

  it("rejects malformed input", () => {
    for (const s of ["", "1+", "(1", "1)", "1 2", "*/"]) {
      expect(() => evaluate(s)).toThrow();
    }
  });

  it("rejects division by zero rather than returning Infinity", () => {
    expect(() => evaluate("1/0")).toThrow(/zero/i);
    expect(() => evaluate("1%0")).toThrow(/zero/i);
  });

  it("rejects overlong input", () => {
    expect(() => evaluate("1+".repeat(400) + "1")).toThrow(/too long/i);
  });

  it("never returns a non-finite number", () => {
    expect(() => evaluate("1e400")).toThrow();
  });
});

describe("formatting", () => {
  it("prints large integers exactly rather than rounding to zeros", () => {
    // 2^64 previously rendered as 18446744073700000000.
    expect(calculate("2^64").summary).toContain("18,446,744,073,709,551,616");
  });

  it("groups thousands", () => {
    expect(calculate("1234567").summary).toContain("1,234,567");
  });

  it("keeps fractional precision readable", () => {
    expect(calculate("10/3").summary).toMatch(/3\.33/);
  });
});
