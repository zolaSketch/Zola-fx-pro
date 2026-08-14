/**
 * Computed knowledge — real answers derived from algorithms rather than
 * fetched from an API. Everything here is exact, instant, offline and
 * deterministic, which makes it both testable and always available.
 */

/* ------------------------------------------------------------ astronomy */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Days since the J2000.0 epoch. */
function toDays(date: Date): number {
  return date.getTime() / 86_400_000 - 10_957.5;
}

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date;
  dayLengthHours: number;
  /** True when the sun never rises (polar night) or never sets (midnight sun). */
  polar: "night" | "day" | null;
}

/**
 * Sunrise and sunset from the NOAA solar position algorithm.
 * Accurate to well under a minute for ordinary latitudes.
 */
export function sunTimes(date: Date, lat: number, lon: number): SunTimes {
  const d = toDays(date);
  const n = Math.round(d - 0.0009 + lon / 360);
  const ds = 0.0009 - lon / 360 + n;

  // Solar mean anomaly, equation of centre, ecliptic longitude.
  const M = (357.5291 + 0.98560028 * ds) * RAD;
  const C = (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)) * RAD;
  const L = M + C + 102.9372 * RAD + Math.PI;
  const transit = 2451545.0 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);

  const decl = Math.asin(Math.sin(L) * Math.sin(23.44 * RAD));
  const cosH =
    (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * Math.sin(decl)) /
    (Math.cos(lat * RAD) * Math.cos(decl));

  const jdToDate = (jd: number) => new Date((jd - 2440587.5) * 86_400_000);
  const solarNoon = jdToDate(transit);

  if (cosH > 1) {
    return { sunrise: null, sunset: null, solarNoon, dayLengthHours: 0, polar: "night" };
  }
  if (cosH < -1) {
    return { sunrise: null, sunset: null, solarNoon, dayLengthHours: 24, polar: "day" };
  }

  const H = Math.acos(cosH) * DEG;
  const sunset = jdToDate(transit + H / 360);
  const sunrise = jdToDate(transit - H / 360);

  return {
    sunrise,
    sunset,
    solarNoon,
    dayLengthHours: (sunset.getTime() - sunrise.getTime()) / 3_600_000,
    polar: null,
  };
}

export interface MoonInfo {
  /** 0 = new, 0.5 = full, 1 = new again. */
  phase: number;
  illumination: number;
  name: string;
  ageDays: number;
}

const PHASE_NAMES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
];

/** Moon phase from the mean synodic cycle. */
export function moonPhase(date: Date): MoonInfo {
  const synodic = 29.530_588_853;
  // Reference new moon: 2000-01-06 18:14 UTC.
  const ref = Date.UTC(2000, 0, 6, 18, 14) / 86_400_000;
  const days = date.getTime() / 86_400_000 - ref;
  const phase = ((days % synodic) + synodic) % synodic / synodic;
  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const idx = Math.round(phase * 8) % 8;

  return {
    phase,
    illumination,
    name: PHASE_NAMES[idx],
    ageDays: phase * synodic,
  };
}

/* ------------------------------------------------------------- geometry */

/** Great-circle distance in kilometres (haversine). */
export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371.0088;
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lon2 - lon1) * RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Initial great-circle bearing in degrees. */
export function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * RAD;
  const y = Math.sin(dLon) * Math.cos(lat2 * RAD);
  const x =
    Math.cos(lat1 * RAD) * Math.sin(lat2 * RAD) -
    Math.sin(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.cos(dLon);
  return (Math.atan2(y, x) * DEG + 360) % 360;
}

export const compassPoint = (deg: number): string =>
  ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"][
    Math.round(((deg % 360) + 360) % 360 / 22.5) % 16
  ];

/* -------------------------------------------------------------- numbers */

const ROMAN_MAP: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
  [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new Error("Roman numerals cover 1 to 3999");
  }
  let out = "";
  let v = n;
  for (const [val, sym] of ROMAN_MAP) {
    while (v >= val) {
      out += sym;
      v -= val;
    }
  }
  return out;
}

export function fromRoman(s: string): number {
  const roman = s.toUpperCase().trim();
  if (!/^[MDCLXVI]+$/.test(roman)) throw new Error("Not a Roman numeral");
  const vals: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const cur = vals[roman[i]];
    const next = vals[roman[i + 1]] ?? 0;
    total += cur < next ? -cur : cur;
  }
  if (toRoman(total) !== roman) throw new Error("Malformed Roman numeral");
  return total;
}

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function factorise(n: number): number[] {
  if (!Number.isInteger(n) || n < 2) return [];
  const out: number[] = [];
  let v = n;
  for (let d = 2; d * d <= v; d++) {
    while (v % d === 0) {
      out.push(d);
      v /= d;
    }
  }
  if (v > 1) out.push(v);
  return out;
}

export function toBase(n: number, base: number): string {
  if (base < 2 || base > 36) throw new Error("Base must be 2-36");
  if (!Number.isInteger(n)) throw new Error("Whole numbers only");
  return n.toString(base).toUpperCase();
}

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b);

/* ---------------------------------------------------------------- colour */

export interface ColourInfo {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  luminance: number;
  /** Best foreground for legibility on this colour. */
  readableOn: "black" | "white";
}

export function parseColour(input: string): ColourInfo | null {
  const s = input.trim().toLowerCase();
  let r: number, g: number, b: number;

  const hex = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  const rgbMatch = s.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);

  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split("").map((c) => c + c).join("") : hex[1];
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  } else if (rgbMatch) {
    [r, g, b] = [+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]];
    if (r > 255 || g > 255 || b > 255) return null;
  } else {
    return null;
  }

  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = (h * 60 + 360) % 360;
  }

  // WCAG relative luminance.
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * lin(rn) + 0.7152 * lin(gn) + 0.0722 * lin(bn);

  return {
    hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
    rgb: [r, g, b],
    hsl: [Math.round(h), Math.round(sat * 100), Math.round(l * 100)],
    luminance,
    readableOn: luminance > 0.179 ? "black" : "white",
  };
}

/* ------------------------------------------------------------------ text */

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingMinutes: number;
  /** Flesch reading ease, 0-100; higher is easier. */
  readability: number;
  topWords: [string, number][];
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  return Math.max(1, (cleaned.match(/[aeiouy]{1,2}/g) ?? []).length);
}

export function analyseText(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const wordList = text.trim().split(/\s+/).filter(Boolean);
  const words = wordList.length;
  const sentences = Math.max(1, (text.match(/[.!?]+(?:\s|$)/g) ?? []).length);
  const paragraphs = Math.max(1, text.trim().split(/\n{2,}/).filter(Boolean).length);
  const syllables = wordList.reduce((a, w) => a + countSyllables(w), 0);

  const readability =
    words === 0
      ? 0
      : Math.max(
          0,
          Math.min(100, 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)),
        );

  const STOP = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "is", "it", "that", "for", "on", "with", "as", "was", "at", "by", "be", "this", "are", "from"]);
  const freq = new Map<string, number>();
  for (const w of wordList) {
    const k = w.toLowerCase().replace(/[^a-z']/g, "");
    if (k.length > 2 && !STOP.has(k)) freq.set(k, (freq.get(k) ?? 0) + 1);
  }

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    readingMinutes: words / 220,
    readability,
    topWords: [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}

/* ------------------------------------------------------------- encoding */

export function toBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function fromBase64(s: string): string {
  const bin = atob(s.trim());
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** SHA hashing via Web Crypto — available in browsers and Node 18+. */
export async function hash(
  text: string,
  algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256",
): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Cryptographically secure password. */
export function generatePassword(length = 20, symbols = true): string {
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const syms = "!@#$%^&*()-_=+[]{};:,.?";
  const pool = lower + upper + digits + (symbols ? syms : "");
  const len = Math.max(8, Math.min(128, length));

  const out: string[] = [];
  const pick = (set: string) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return set[buf[0] % set.length];
  };
  // Guarantee at least one of each class.
  out.push(pick(lower), pick(upper), pick(digits));
  if (symbols) out.push(pick(syms));
  while (out.length < len) out.push(pick(pool));

  // Fisher-Yates with secure randomness.
  for (let i = out.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}

/** Shannon entropy of a password, in bits. */
export function passwordEntropy(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  return pw.length * Math.log2(pool || 1);
}

/* --------------------------------------------------------------- random */

export function rollDice(spec: string): { rolls: number[]; total: number; notation: string } | null {
  const m = spec.toLowerCase().match(/(\d{0,3})\s*d\s*(\d{1,4})\s*([+-]\s*\d{1,4})?/);
  if (!m) return null;
  const count = Math.min(100, Math.max(1, parseInt(m[1] || "1", 10)));
  const sides = Math.min(1000, Math.max(2, parseInt(m[2], 10)));
  const mod = m[3] ? parseInt(m[3].replace(/\s/g, ""), 10) : 0;

  const buf = new Uint32Array(count);
  crypto.getRandomValues(buf);
  const rolls = [...buf].map((v) => (v % sides) + 1);

  return {
    rolls,
    total: rolls.reduce((a, b) => a + b, 0) + mod,
    notation: `${count}d${sides}${mod ? (mod > 0 ? `+${mod}` : mod) : ""}`,
  };
}
