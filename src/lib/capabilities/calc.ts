import { fail, ok, type CapabilityResult } from "./types";

/**
 * A safe arithmetic evaluator.
 *
 * Implemented as a recursive-descent parser rather than eval/Function so that
 * arbitrary input — including anything an LLM or a stranger's voice produces —
 * can never execute code. Only numbers, operators and a fixed function table
 * are reachable.
 */

const FUNCS: Record<string, (...a: number[]) => number> = {
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  log: Math.log10, ln: Math.log, log2: Math.log2, exp: Math.exp,
  floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign,
  min: Math.min, max: Math.max, pow: Math.pow, hypot: Math.hypot,
};

const CONSTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
};

type Tok =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: string };

function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  // Whitespace is skipped as a separator rather than stripped up front —
  // stripping would silently fuse "1 2" into the number 12.
  const s = src;

  while (i < s.length) {
    const c = s[i];

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9._]/.test(s[j])) j++;
      // Scientific notation.
      if (s[j] === "e" || s[j] === "E") {
        const k = j + 1;
        const sign = s[k] === "+" || s[k] === "-" ? 1 : 0;
        if (/[0-9]/.test(s[k + sign] ?? "")) {
          j = k + sign;
          while (j < s.length && /[0-9]/.test(s[j])) j++;
        }
      }
      const raw = s.slice(i, j).replace(/_/g, "");
      const v = Number(raw);
      if (!Number.isFinite(v)) throw new Error(`Bad number: ${raw}`);
      toks.push({ t: "num", v });
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z0-9]/.test(s[j])) j++;
      toks.push({ t: "id", v: s.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }

    if ("+-*/%^(),".includes(c)) {
      // '**' as an alias for '^'
      if (c === "*" && s[i + 1] === "*") {
        toks.push({ t: "op", v: "^" });
        i += 2;
        continue;
      }
      toks.push({ t: "op", v: c });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${c}`);
  }
  return toks;
}

function parse(toks: Tok[]): number {
  let p = 0;
  const peek = () => toks[p];
  const eat = (v: string) => {
    const t = toks[p];
    if (t?.t === "op" && t.v === v) {
      p++;
      return true;
    }
    return false;
  };

  // expr := term (('+'|'-') term)*
  function expr(): number {
    let x = term();
    for (;;) {
      if (eat("+")) x += term();
      else if (eat("-")) x -= term();
      else return x;
    }
  }

  // term := unary (('*'|'/'|'%') unary)*
  function term(): number {
    let x = unary();
    for (;;) {
      if (eat("*")) x *= unary();
      else if (eat("/")) {
        const d = unary();
        if (d === 0) throw new Error("Division by zero");
        x /= d;
      } else if (eat("%")) {
        const d = unary();
        if (d === 0) throw new Error("Division by zero");
        x %= d;
      } else return x;
    }
  }

  // unary := ('-'|'+') unary | power
  function unary(): number {
    if (eat("-")) return -unary();
    if (eat("+")) return unary();
    return power();
  }

  // power := atom ('^' unary)?   [right-associative]
  function power(): number {
    const base = atom();
    if (eat("^")) return Math.pow(base, unary());
    return base;
  }

  function atom(): number {
    const t = peek();
    if (!t) throw new Error("Unexpected end of expression");

    if (t.t === "num") {
      p++;
      return t.v;
    }

    if (t.t === "id") {
      p++;
      const name = t.v;
      if (eat("(")) {
        const args: number[] = [];
        if (!eat(")")) {
          do {
            args.push(expr());
          } while (eat(","));
          if (!eat(")")) throw new Error("Missing closing parenthesis");
        }
        const fn = FUNCS[name];
        if (!fn) throw new Error(`Unknown function: ${name}`);
        return fn(...args);
      }
      if (name in CONSTS) return CONSTS[name];
      throw new Error(`Unknown identifier: ${name}`);
    }

    if (t.t === "op" && t.v === "(") {
      p++;
      const v = expr();
      if (!eat(")")) throw new Error("Missing closing parenthesis");
      return v;
    }

    throw new Error(`Unexpected token: ${t.v}`);
  }

  const result = expr();
  if (p < toks.length) throw new Error(`Unexpected trailing input`);
  return result;
}

/** Evaluate an arithmetic expression. Throws on anything unsafe or malformed. */
export function evaluate(expression: string): number {
  if (expression.length > 500) throw new Error("Expression too long");
  const v = parse(lex(expression));
  if (!Number.isFinite(v)) throw new Error("Result is not a finite number");
  return v;
}

function pretty(n: number): string {
  // Integers beyond 2^53 lose precision in toPrecision/String, printing
  // 18446744073700000000 for 2^64. Format the exact double instead.
  if (Number.isInteger(n)) {
    return Math.abs(n) < 1e21
      ? BigInt(n).toLocaleString()
      : n.toExponential(6);
  }
  const r = Number(n.toPrecision(12));
  return r.toLocaleString(undefined, { maximumSignificantDigits: 12 });
}

export function calculate(expression: string): CapabilityResult {
  try {
    const v = evaluate(expression);
    return ok(`${expression.trim()} is ${pretty(v)}, sir.`, [
      `EXPRESSION . ${expression.trim()}`,
      `RESULT ..... ${pretty(v)}`,
    ], v);
  } catch (e) {
    return fail(`I could not evaluate that, sir. ${(e as Error).message}.`);
  }
}
