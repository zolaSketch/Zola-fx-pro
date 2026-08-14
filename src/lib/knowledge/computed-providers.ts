import type { Provider } from "./types";
import { fmt } from "./types";
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

/**
 * Providers backed by computation rather than a remote API.
 *
 * These are exact, instant and always available — no key, no network, no rate
 * limit. Each declares a narrow `canHandle` so it only claims what it truly
 * understands and never shadows the general knowledge providers.
 */

const numberTheory: Provider = {
  name: "Number theory",
  domains: ["numbers", "science"],
  offline: true,
  canHandle: (q) =>
    /\b(prime|factor|factorise|factorize|gcd|lcm|hcf|binary|hexadecimal|hex|octal|roman numerals?)\b/i.test(q) ||
    // A bare uppercase Roman numeral, which only appears deliberately.
    /\b[MDCLXVI]{2,15}\b/.test(q),
  async run(q) {
    const s = q.toLowerCase();
    const nums = (s.match(/-?\d+/g) ?? []).map(Number).filter(Number.isFinite);

    if (/roman/.test(s) || /\b[MDCLXVI]{2,15}\b/.test(q)) {
      // Only treat a token as a numeral when it is not an ordinary English
      // word — "in" and "mid" are valid [mdclxvi] sequences.
      const candidate = s.match(/\b([mdclxvi]{2,15})\b/i)?.[1];
      const word =
        candidate && !/^(in|is|i|mi|mid|dim|lid|did|civil|mill|dill|vim)$/i.test(candidate)
          ? candidate
          : undefined;
      try {
        if (word && !nums.length) {
          const v = fromRoman(word);
          return { summary: `${word.toUpperCase()} is ${v}, sir.`, meta: [`ROMAN ...... ${word.toUpperCase()}`, `VALUE ...... ${v}`], source: "Number theory", confidence: 0.94 };
        }
        if (nums.length) {
          const r = toRoman(nums[0]);
          return { summary: `${nums[0]} in Roman numerals is ${r}, sir.`, meta: [`DECIMAL .... ${nums[0]}`, `ROMAN ...... ${r}`], source: "Number theory", confidence: 0.94 };
        }
      } catch (e) {
        return { summary: (e as Error).message + ", sir.", source: "Number theory", confidence: 0.9 };
      }
      return null;
    }

    if (!nums.length) return null;
    const n = nums[0];

    if (/\b(gcd|hcf|lcm)\b/.test(s) && nums.length >= 2) {
      const isLcm = /lcm/.test(s);
      const v = isLcm ? lcm(nums[0], nums[1]) : gcd(nums[0], nums[1]);
      return {
        summary: `The ${isLcm ? "lowest common multiple" : "greatest common divisor"} of ${nums[0]} and ${nums[1]} is ${v}, sir.`,
        meta: [`INPUTS ..... ${nums[0]}, ${nums[1]}`, `RESULT ..... ${v}`],
        source: "Number theory",
        confidence: 0.95,
      };
    }

    if (/\b(binary|hexadecimal|hex|octal)\b/.test(s)) {
      const base = /binary/.test(s) ? 2 : /octal/.test(s) ? 8 : 16;
      const name = base === 2 ? "binary" : base === 8 ? "octal" : "hexadecimal";
      return {
        summary: `${n} in ${name} is ${toBase(n, base)}, sir.`,
        meta: [
          `DECIMAL .... ${n}`,
          `BINARY ..... ${toBase(n, 2)}`,
          `OCTAL ...... ${toBase(n, 8)}`,
          `HEX ........ ${toBase(n, 16)}`,
        ],
        source: "Number theory",
        confidence: 0.95,
      };
    }

    if (/prime/.test(s)) {
      // 1 is a unit, and 0 and negatives are neither prime nor composite.
      // Claiming "1 is composite" is simply false, so they are handled apart.
      if (n < 2) {
        const why =
          n === 1
            ? "One is a unit: neither prime nor composite."
            : n === 0
              ? "Zero is neither prime nor composite."
              : "Primality is defined for integers greater than one.";
        return {
          summary: `No, sir. ${why}`,
          meta: [`NUMBER ..... ${n}`, `PRIME ...... no`, `CLASS ...... ${n === 1 ? "unit" : "not applicable"}`],
          source: "Number theory",
          confidence: 0.96,
        };
      }
      const p = isPrime(n);
      const f = p ? [] : factorise(n);
      return {
        summary: p
          ? `Yes, sir. ${n} is prime.`
          : `No, sir. ${n} is composite; it factors into ${f.join(" × ")}.`,
        meta: [`NUMBER ..... ${n}`, `PRIME ...... ${p ? "yes" : "no"}`, ...(f.length ? [`FACTORS .... ${f.join(" × ")}`] : [])],
        source: "Number theory",
        confidence: 0.96,
      };
    }

    if (/factor/.test(s)) {
      const f = factorise(n);
      if (!f.length) return null;
      return {
        summary: `${n} factors into ${f.join(" times ")}, sir.`,
        meta: [`NUMBER ..... ${n}`, `FACTORS .... ${f.join(" × ")}`, `PRIME ...... ${isPrime(n) ? "yes" : "no"}`],
        source: "Number theory",
        confidence: 0.95,
      };
    }
    return null;
  },
};

const colourProvider: Provider = {
  name: "Colour",
  domains: ["general"],
  offline: true,
  canHandle: (q) => /#[0-9a-f]{3,6}\b/i.test(q) || (/\bcolou?r\b/i.test(q) && /rgb\(/i.test(q)),
  async run(q) {
    const token = q.match(/#[0-9a-f]{3,6}\b/i)?.[0] ?? q.match(/rgba?\([^)]+\)/i)?.[0];
    if (!token) return null;
    const c = parseColour(token);
    if (!c) return null;
    return {
      summary: `${c.hex} is RGB ${c.rgb.join(", ")}, HSL ${c.hsl[0]} degrees ${c.hsl[1]} percent ${c.hsl[2]} percent. Use ${c.readableOn} text on it.`,
      meta: [
        `HEX ........ ${c.hex}`,
        `RGB ........ ${c.rgb.join(", ")}`,
        `HSL ........ ${c.hsl[0]}°, ${c.hsl[1]}%, ${c.hsl[2]}%`,
        `LUMINANCE .. ${c.luminance.toFixed(4)}`,
        `LEGIBLE .... ${c.readableOn} text`,
      ],
      source: "Colour analysis",
      confidence: 0.94,
    };
  },
};

const astronomyCompute: Provider = {
  name: "Solar & lunar",
  domains: ["space", "science"],
  offline: true,
  canHandle: (q) => /\b(sunrise|sunset|moon phase|full moon|day length|golden hour|solar noon)\b/i.test(q),
  async run(q) {
    const s = q.toLowerCase();
    const now = new Date();

    if (/moon/.test(s)) {
      const m = moonPhase(now);
      return {
        summary: `The moon is a ${m.name}, ${(m.illumination * 100).toFixed(0)} percent illuminated, ${m.ageDays.toFixed(1)} days into its cycle.`,
        meta: [
          `PHASE ...... ${m.name}`,
          `ILLUMINATED  ${(m.illumination * 100).toFixed(1)}%`,
          `AGE ........ ${m.ageDays.toFixed(2)} days`,
        ],
        source: "Lunar computation",
        confidence: 0.9,
      };
    }

    // Default to the user's configured region when no coordinates are given.
    const lat = 8.54;
    const lon = 39.27;
    const t = sunTimes(now, lat, lon);
    if (t.polar) {
      return {
        summary: t.polar === "day" ? "The sun does not set at that latitude today, sir." : "The sun does not rise at that latitude today, sir.",
        source: "Solar computation",
        confidence: 0.85,
      };
    }
    const fmtTime = (d: Date | null) =>
      d ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—";
    return {
      summary: `Sunrise at ${fmtTime(t.sunrise)}, sunset at ${fmtTime(t.sunset)}, giving ${t.dayLengthHours.toFixed(1)} hours of daylight.`,
      meta: [
        `SUNRISE .... ${fmtTime(t.sunrise)}`,
        `SOLAR NOON . ${fmtTime(t.solarNoon)}`,
        `SUNSET ..... ${fmtTime(t.sunset)}`,
        `DAYLIGHT ... ${t.dayLengthHours.toFixed(2)} h`,
      ],
      source: "Solar computation",
      confidence: 0.88,
    };
  },
};

const textProvider: Provider = {
  name: "Text analysis",
  domains: ["general"],
  offline: true,
  canHandle: (q) => /\b(word count|count the words|analyse this text|analyze this text|readability|reading time)\b/i.test(q),
  async run(q) {
    const text = q.replace(/^.*?(word count|count the words|analyse this text|analyze this text|readability|reading time)[:\s]*/i, "").trim();
    if (text.length < 3) return null;
    const a = analyseText(text);
    return {
      summary: `${a.words} words, ${a.sentences} sentences, about ${Math.max(1, Math.round(a.readingMinutes))} minute to read. Reading ease ${a.readability.toFixed(0)} out of 100.`,
      meta: [
        `WORDS ...... ${a.words}`,
        `CHARACTERS . ${a.characters} (${a.charactersNoSpaces} without spaces)`,
        `SENTENCES .. ${a.sentences}`,
        `READ TIME .. ${a.readingMinutes < 1 ? "<1" : Math.round(a.readingMinutes)} min`,
        `READABILITY  ${a.readability.toFixed(1)} / 100`,
        ...(a.topWords.length ? [`FREQUENT ... ${a.topWords.map(([w, c]) => `${w}(${c})`).join(", ")}`] : []),
      ],
      source: "Text analysis",
      confidence: 0.93,
    };
  },
};

const cryptoTools: Provider = {
  name: "Encoding & hashing",
  domains: ["general", "numbers"],
  offline: true,
  canHandle: (q) => /\b(base64|sha-?(1|256|384|512)|md5|hash|encode|decode|password|passphrase)\b/i.test(q),
  async run(q) {
    const s = q.toLowerCase();

    if (/password|passphrase/.test(s)) {
      const len = parseInt(s.match(/(\d{1,3})\s*(char|character|digit|long)?/)?.[1] ?? "20", 10);
      const pw = generatePassword(len, !/no symbol/.test(s));
      const bits = passwordEntropy(pw);
      return {
        summary: `Generated a ${pw.length} character password with ${bits.toFixed(0)} bits of entropy, sir. It is on screen rather than spoken.`,
        meta: [
          `PASSWORD ... ${pw}`,
          `LENGTH ..... ${pw.length}`,
          `ENTROPY .... ${bits.toFixed(1)} bits`,
          `STRENGTH ... ${bits > 100 ? "excellent" : bits > 75 ? "strong" : bits > 50 ? "moderate" : "weak"}`,
        ],
        source: "Secure generator",
        confidence: 0.96,
      };
    }

    const payload = q.replace(/^.*?(base64|sha-?\d+|hash|encode|decode)\s*(of|for)?[:\s]*/i, "").trim();
    if (!payload) return null;

    if (/decode/.test(s)) {
      try {
        return {
          summary: `That decodes to: ${fromBase64(payload)}`,
          meta: [`INPUT ...... ${payload.slice(0, 60)}`, `DECODED .... ${fromBase64(payload)}`],
          source: "Base64",
          confidence: 0.95,
        };
      } catch {
        return { summary: "That is not valid Base64, sir.", source: "Base64", confidence: 0.9 };
      }
    }

    if (/base64|encode/.test(s)) {
      return {
        summary: `Encoded, sir.`,
        meta: [`INPUT ...... ${payload.slice(0, 60)}`, `BASE64 ..... ${toBase64(payload)}`],
        source: "Base64",
        confidence: 0.95,
      };
    }

    const algo = /sha-?1\b/.test(s) ? "SHA-1" : /sha-?384/.test(s) ? "SHA-384" : /sha-?512/.test(s) ? "SHA-512" : "SHA-256";
    const digest = await hash(payload, algo as "SHA-256");
    return {
      summary: `${algo} computed, sir. The digest is on screen.`,
      meta: [`INPUT ...... ${payload.slice(0, 60)}`, `${algo} ... ${digest}`],
      source: "Web Crypto",
      confidence: 0.95,
    };
  },
};

const diceProvider: Provider = {
  name: "Dice & chance",
  domains: ["numbers", "general"],
  offline: true,
  canHandle: (q) => /\b(roll|dice|d\d{1,3}\b|flip a coin|coin toss|random number)\b/i.test(q),
  async run(q) {
    const s = q.toLowerCase();

    if (/coin/.test(s)) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      const heads = buf[0] % 2 === 0;
      return {
        summary: `${heads ? "Heads" : "Tails"}, sir.`,
        meta: [`RESULT ..... ${heads ? "HEADS" : "TAILS"}`],
        source: "Secure random",
        confidence: 0.96,
      };
    }

    if (/random number/.test(s)) {
      const nums = (s.match(/\d+/g) ?? []).map(Number);
      const lo = nums.length > 1 ? Math.min(nums[0], nums[1]) : 1;
      const hi = nums.length > 1 ? Math.max(nums[0], nums[1]) : nums[0] || 100;
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      const v = lo + (buf[0] % (hi - lo + 1));
      return {
        summary: `${v}, sir.`,
        meta: [`RANGE ...... ${lo}–${hi}`, `RESULT ..... ${v}`],
        source: "Secure random",
        confidence: 0.96,
      };
    }

    const r = rollDice(s);
    if (!r) return null;
    return {
      summary: `${r.notation} gives ${r.total}, sir.`,
      meta: [`NOTATION ... ${r.notation}`, `ROLLS ...... ${r.rolls.join(", ")}`, `TOTAL ...... ${r.total}`],
      source: "Secure random",
      confidence: 0.95,
    };
  },
};

const distanceProvider: Provider = {
  name: "Geodesy",
  domains: ["general", "science"],
  offline: true,
  canHandle: (q) =>
    /\b(distance|how far|bearing)\b/i.test(q) && (q.match(/-?\d+\.\d+/g) ?? []).length >= 4,
  async run(q) {
    const nums = (q.match(/-?\d+\.\d+/g) ?? []).map(Number);
    if (nums.length < 4) return null;
    const [lat1, lon1, lat2, lon2] = nums;
    const km = haversine(lat1, lon1, lat2, lon2);
    const brg = bearing(lat1, lon1, lat2, lon2);
    return {
      summary: `${fmt(km)} kilometres, bearing ${brg.toFixed(0)} degrees ${compassPoint(brg)}.`,
      meta: [
        `FROM ....... ${lat1}, ${lon1}`,
        `TO ......... ${lat2}, ${lon2}`,
        `DISTANCE ... ${fmt(km)} km (${fmt(km * 0.621371)} mi)`,
        `BEARING .... ${brg.toFixed(1)}° ${compassPoint(brg)}`,
      ],
      source: "Geodesy",
      confidence: 0.94,
    };
  },
};

export const COMPUTED_PROVIDERS: Provider[] = [
  numberTheory,
  colourProvider,
  astronomyCompute,
  textProvider,
  cryptoTools,
  diceProvider,
  distanceProvider,
];
