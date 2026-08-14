import { TOOL_SCHEMAS, type ToolCall, type ToolName } from "./tools";

/**
 * The offline brain.
 *
 * A deterministic intent engine that understands natural language well enough
 * to drive every tool, so JARVIS is fully operational with no API key. When an
 * LLM key is configured the route uses that instead; this remains the fallback
 * so the interface never degrades to "sorry, I can't".
 */

export interface Understanding {
  reply: string;
  calls: ToolCall[];
}

const WORD_NUMBERS: Record<string, number> = {
  zero: 0, ten: 10, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
  half: 50, full: 100, max: 100, maximum: 100, min: 0, minimum: 0,
};

const ROMAN = /\b(mark\s+)?([ivxlcdm]{1,8})\b/i;

function extractNumber(s: string): number | null {
  const digits = s.match(/(\d{1,3})\s*(?:%|percent)?/);
  if (digits) {
    const n = parseInt(digits[1], 10);
    if (!Number.isNaN(n)) return Math.min(100, Math.max(0, n));
  }
  for (const [w, n] of Object.entries(WORD_NUMBERS)) {
    if (new RegExp(`\\b${w}\\b`).test(s)) return n;
  }
  return null;
}

/**
 * Parse a duration like "5 minutes", "45 sec", "1.5 hours".
 *
 * Alternatives are ordered longest-first and pluralised, otherwise `\b` fails
 * on the trailing "s" of "minutes" and the match is silently lost.
 */
function extractDuration(s: string): number | null {
  const m = s.match(
    /(\d+(?:\.\d+)?)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?|s|m|h)\b/,
  );
  if (!m) return null;
  const v = parseFloat(m[1]);
  if (!Number.isFinite(v)) return null;
  const unit = m[2];

  const secs = unit.startsWith("h")
    ? v * 3600
    : unit.startsWith("m")
      ? v * 60
      : v;

  return Math.min(86_400, Math.max(1, Math.round(secs)));
}

const has = (s: string, ...w: string[]) => w.some((x) => s.includes(x));

interface Rule {
  id: string;
  /** `s` is lower-cased; `raw` preserves original case (Roman numerals). */
  test: (s: string, raw: string) => boolean;
  build: (s: string) => Understanding;
}

const RULES: Rule[] = [
  // ---- greetings / identity -------------------------------------------
  {
    id: "greet",
    test: (s) => /^(hi|hey|hello|good (morning|afternoon|evening)|yo|jarvis)\b/.test(s) && s.length < 40,
    build: () => ({
      reply: pick([
        "Good to see you, sir. Everything is running as it should.",
        "At your service, sir.",
        "Awake and attentive, sir. What shall we do?",
      ]),
      calls: [],
    }),
  },
  {
    id: "identity",
    test: (s) => has(s, "who are you", "what are you", "your name", "introduce yourself"),
    build: () => ({
      reply:
        "Just A Rather Very Intelligent System, sir. I run the house, the suits, and a great deal of the tedium.",
      calls: [],
    }),
  },
  {
    id: "thanks",
    test: (s) => has(s, "thank you", "thanks", "cheers", "well done", "good job"),
    build: () => ({
      reply: pick([
        "A pleasure, sir.",
        "As always, sir.",
        "That is what I am here for, sir.",
      ]),
      calls: [],
    }),
  },
  {
    id: "how_are_you",
    test: (s) => has(s, "how are you", "you okay", "you alright", "how do you feel"),
    build: () => ({
      reply: "All my processes are nominal, sir. Which is more than I can say for your sleep schedule.",
      calls: [],
    }),
  },

  // ---- power -----------------------------------------------------------
  {
    id: "power",
    // "power" is overloaded: reactor output vs. exponentiation ("2 to the
    // power of 64") vs. shutdown. Require a reactor sense and exclude the
    // mathematical and shutdown readings.
    test: (s) =>
      has(s, "power", "reactor", "divert", "output", "energy", "juice") &&
      !has(s, "power down", "shut", "power of", "powers of", "raised to") &&
      !/\bto the power\b/.test(s),
    build: (s) => {
      const n = extractNumber(s);
      if (n === null) {
        return { reply: "What level would you like, sir?", calls: [] };
      }
      const warn =
        n > 92
          ? " Do note that is beyond the recommended thermal envelope."
          : n < 20
            ? " Flight systems will be offline at that level."
            : "";
      return {
        reply: `Diverting ${n}% to the arc reactor, sir.${warn}`,
        calls: [{ name: "set_power", args: { level: n } }],
      };
    },
  },
  {
    id: "power_down",
    test: (s) => has(s, "power down", "shut down", "go offline", "shut off", "sleep"),
    build: () => ({
      reply: "Powering down non-essential systems, sir. Do wake me if anything explodes.",
      calls: [
        { name: "set_status", args: { status: "offline" } },
        { name: "set_power", args: { level: 15 } },
      ],
    }),
  },

  // ---- scanning --------------------------------------------------------
  {
    id: "scan",
    test: (s) => has(s, "scan", "sweep", "radar", "threat", "contact", "perimeter", "anyone out there"),
    build: (s) => {
      const focus = has(s, "orbit") ? "orbital" : has(s, "thermal") ? "thermal" : has(s, "perimeter") ? "perimeter" : "all";
      return {
        reply: "Sweeping now, sir.",
        calls: [{ name: "scan_threats", args: { focus: focus as "all" } }],
      };
    },
  },

  // ---- suit ------------------------------------------------------------
  {
    id: "suit",
    test: (s) => has(s, "suit", "armor", "armour", "mark", "assemble", "deploy", "retract", "gear up"),
    build: (s) => {
      const retract = has(s, "retract", "take off", "remove", "stand down", "put it away");
      const m = s.match(ROMAN);
      const mark = m && m[2] && m[2].length > 0 && /^[ivxlcdm]+$/i.test(m[2]) ? m[2].toUpperCase() : "LXXXV";
      return {
        reply: retract
          ? `Retracting Mark ${mark}, sir. Nano-particles returning to housing.`
          : `Deploying Mark ${mark}, sir. Stand by for assembly.`,
        calls: [{ name: "suit_control", args: { mark, action: retract ? "retract" : "deploy" } }],
      };
    },
  },

  // ---- protocols -------------------------------------------------------
  {
    id: "protocol",
    test: (s) => has(s, "protocol", "house party", "clean slate", "lockdown", "veronica", "sentry", "lock down"),
    build: (s) => {
      if (has(s, "house party")) {
        return {
          reply: "House Party Protocol, sir. All units airborne.",
          calls: [{ name: "run_protocol", args: { name: "house_party" } }],
        };
      }
      if (has(s, "clean slate")) {
        return {
          reply: "Clean Slate Protocol. Every unit will self-destruct, sir. Confirm and it is done.",
          calls: [{ name: "run_protocol", args: { name: "clean_slate" } }],
        };
      }
      if (has(s, "veronica")) {
        return {
          reply: "Summoning Veronica, sir. Hulkbuster deploying from orbit.",
          calls: [{ name: "run_protocol", args: { name: "veronica" } }],
        };
      }
      if (has(s, "sentry")) {
        return {
          reply: "Sentry mode engaged, sir. I shall keep watch.",
          calls: [{ name: "run_protocol", args: { name: "sentry" } }],
        };
      }
      if (has(s, "lockdown", "lock down")) {
        return {
          reply: "Sealing the facility, sir. Blast doors closing.",
          calls: [{ name: "run_protocol", args: { name: "lockdown" } }],
        };
      }
      return {
        reply: "Available protocols are House Party, Clean Slate, Lockdown, Veronica and Sentry, sir.",
        calls: [],
      };
    },
  },

  // ---- diagnostics -----------------------------------------------------
  {
    id: "diagnostics",
    test: (s) => has(s, "status", "diagnostic", "report", "sitrep", "systems check", "how are things", "everything okay"),
    build: (s) => ({
      reply: "Running diagnostics now, sir.",
      calls: [{ name: "run_diagnostics", args: { depth: has(s, "full", "deep", "complete") ? "full" : "quick" } }],
    }),
  },

  // ---- subsystems ------------------------------------------------------
  {
    id: "subsystem",
    test: (s) => has(s, "repulsor", "thruster", "thrust", "armor integrity", "armour integrity", "uplink", "cooling", "thermal"),
    build: (s) => {
      const n = extractNumber(s);
      const id = has(s, "repulsor")
        ? "repulsor"
        : has(s, "thrust")
          ? "thrust"
          : has(s, "uplink")
            ? "uplink"
            : has(s, "thermal", "cooling")
              ? "thermal"
              : "armor";
      if (n === null) {
        return { reply: `What level for the ${id.replace("_", " ")}, sir?`, calls: [] };
      }
      return {
        reply: `Setting ${id} to ${n}%, sir.`,
        calls: [{ name: "set_subsystem", args: { id: id as "reactor", level: n } }],
      };
    },
  },

  // ---- alert -----------------------------------------------------------
  {
    id: "alert",
    test: (s) => has(s, "alert", "battle stations", "defcon", "emergency", "red alert", "stand down", "all clear"),
    build: (s) => {
      const clear = has(s, "stand down", "all clear", "cancel");
      return {
        reply: clear
          ? "Standing down, sir. Returning to normal operations."
          : "Alert posture engaged, sir. Defences are live.",
        calls: [{ name: "set_status", args: { status: clear ? "online" : "alert" } }],
      };
    },
  },

  // ---- timer -----------------------------------------------------------
  {
    id: "timer",
    test: (s) => has(s, "timer", "countdown", "remind me in", "set a timer", "alarm"),
    build: (s) => {
      const secs = extractDuration(s) ?? 60;
      const label = s.match(/(?:for|to)\s+([a-z\s]{3,30})$/)?.[1]?.trim() ?? "Timer";
      const pretty = secs >= 60 ? `${Math.round(secs / 60)} minute` : `${secs} second`;
      return {
        reply: `${pretty} countdown started, sir.`,
        calls: [{ name: "start_timer", args: { seconds: secs, label } }],
      };
    },
  },

  // ---- music -----------------------------------------------------------
  {
    id: "music",
    test: (s) => has(s, "music", "play something", "song", "playlist", "tunes", "put on"),
    build: (s) => {
      const q = s.match(/play\s+(?:some\s+)?(.{2,40})/)?.[1]?.trim() ?? "workshop playlist";
      return {
        reply: "Queuing it now, sir. Volume at a civilised level.",
        calls: [{ name: "play_music", args: { query: q } }],
      };
    },
  },

  // ---- clear -----------------------------------------------------------
  {
    id: "clear",
    test: (s) => /^(clear|cls|reset|wipe)\b/.test(s) || has(s, "clear the log", "clear transcript"),
    build: () => ({ reply: "Transcript purged, sir.", calls: [{ name: "clear_log", args: {} }] }),
  },

  // ---- time / date (real, timezone aware) ------------------------------
  {
    id: "time",
    test: (s) => has(s, "what time", "the time", "what day", "what's the date", "date today"),
    build: (s) => {
      const m = s.match(/\bin\s+([a-z\s/_-]{2,30})/);
      const raw = m?.[1]?.trim();
      const ZONES: Record<string, string> = {
        tokyo: "Asia/Tokyo", japan: "Asia/Tokyo", london: "Europe/London",
        uk: "Europe/London", paris: "Europe/Paris", berlin: "Europe/Berlin",
        "new york": "America/New_York", nyc: "America/New_York",
        "los angeles": "America/Los_Angeles", la: "America/Los_Angeles",
        dubai: "Asia/Dubai", india: "Asia/Kolkata", delhi: "Asia/Kolkata",
        sydney: "Australia/Sydney", moscow: "Europe/Moscow",
        beijing: "Asia/Shanghai", china: "Asia/Shanghai",
        addis: "Africa/Addis_Ababa", ethiopia: "Africa/Addis_Ababa",
        nairobi: "Africa/Nairobi", cairo: "Africa/Cairo",
      };
      const timezone = raw ? (ZONES[raw] ?? raw) : "local";
      return { reply: "", calls: [{ name: "get_time", args: { timezone } }] };
    },
  },

  // ---- computed knowledge (offline, exact) ------------------------------
  // Dice, primes, bases, Roman numerals, colours, hashes, passwords, moon
  // phase and text stats are all answered by computed providers behind
  // web_lookup. Declared before `calculate` and `lookup` so numeric phrasing
  // ("is 7919 prime", "roll 3d6") is not parsed as arithmetic or a search.
  {
    id: "computed",
    test: (s, raw) =>
      /\b(prime|factorise|factorize|factors of|gcd|lcm|hcf)\b/.test(s) ||
      /\b(binary|hexadecimal|octal)\b/.test(s) ||
      /\broman numerals?\b/.test(s) ||
      /\b[MDCLXVI]{2,15}\b/.test(raw) ||
      /\b\d{0,3}\s*d\s*\d{1,4}\b/.test(s) ||
      /\b(roll|dice|flip a coin|coin toss|random number)\b/.test(s) ||
      /\b(password|passphrase)\b/.test(s) ||
      /\b(base64|sha-?\d+|hash)\b/.test(s) ||
      /#[0-9a-f]{3,6}\b/.test(s) ||
      /\b(moon phase|full moon|sunrise|sunset|day length|solar noon)\b/.test(s) ||
      /\b(word count|readability|reading time)\b/.test(s),
    build: (s) => ({ reply: "", calls: [{ name: "web_lookup", args: { query: s } }] }),
  },

  // ---- unit conversion & knowledge domains (real) ----------------------
  // Placed before `calculate` so "convert 100 km to miles" is not parsed as
  // arithmetic, and before `lookup` so it is not sent to Wikipedia.
  {
    id: "convert",
    // The "<n> <unit> to <unit>" shape also matches "3 raised to the power of
    // 4", so exponentiation phrasing is excluded explicitly.
    test: (s) =>
      !/\b(to the power|raised to|squared|cubed)\b/.test(s) &&
      (/\b\d+(\.\d+)?\s*[a-z°/]+\s+(to|in|into|as)\s+[a-z°/]/.test(s) ||
        /^(convert|how many)\b/.test(s)),
    build: (s) => ({ reply: "", calls: [{ name: "web_lookup", args: { query: s } }] }),
  },
  {
    id: "define",
    test: (s) => /^(define|definition of|meaning of)\b/.test(s) || /\bwhat does .+ mean\b/.test(s),
    build: (s) => ({ reply: "", calls: [{ name: "web_lookup", args: { query: s } }] }),
  },

  // ---- maths (real evaluation) -----------------------------------------
  {
    id: "calculate",
    test: (s) =>
      has(s, "calculate", "what is", "what's", "how much is", "compute", "solve") &&
      /[0-9]/.test(s) &&
      /[+\-*/^%]|\b(plus|minus|times|divided|squared|cubed|sqrt|percent of|to the power of|raised to)\b/.test(s),
    build: (s) => {
      const expression = s
        .replace(/^.*?(calculate|compute|solve|what is|what's|how much is)\s*/i, "")
        .replace(/\bplus\b/g, "+").replace(/\bminus\b/g, "-")
        .replace(/\b(times|multiplied by)\b/g, "*").replace(/\bdivided by\b/g, "/")
        .replace(/\bsquared\b/g, "^2").replace(/\bcubed\b/g, "^3")
        .replace(/\s*(?:to the power of|raised to(?: the power of)?)\s*/g, "^")
        .replace(/\bpercent of\b/g, "/100*")
        .replace(/[?.]+$/, "")
        .trim();
      return { reply: "", calls: [{ name: "calculate", args: { expression } }] };
    },
  },

  // ---- memory (real, persistent) ---------------------------------------
  {
    id: "remember",
    test: (s) => has(s, "remember that", "remember i", "note that", "don't forget", "make a note", "keep in mind"),
    build: (s) => {
      const text = s.replace(/^.*?(remember that|remember|note that|don't forget|make a note|keep in mind)[:\s]*/i, "").trim();
      return {
        reply: "Noted and stored, sir.",
        calls: [{ name: "remember", args: { text: text || s, kind: "fact" } }],
      };
    },
  },
  {
    id: "recall",
    test: (s) => has(s, "what do you know about me", "what do you remember", "recall", "what did i tell you"),
    build: (s) => {
      const query = s.replace(/^.*?(remember|recall|know)\s*(about)?\s*/i, "").trim();
      return { reply: "", calls: [{ name: "recall", args: { query: query || "everything" } }] };
    },
  },

  // ---- real device telemetry -------------------------------------------
  {
    id: "device",
    test: (s) => has(s, "battery", "device status", "system resources", "how fast", "frame rate", "connection speed", "my computer"),
    build: () => ({ reply: "", calls: [{ name: "read_device", args: {} }] }),
  },

  // ---- weather (real data) ---------------------------------------------
  {
    id: "weather",
    test: (s) => has(s, "weather", "forecast", "raining", "temperature outside", "how cold", "how hot"),
    build: (s) => {
      // "weather in Tokyo" / "what's the weather like in New York"
      const m = s.match(/(?:in|for|at)\s+([a-z\s'-]{2,40})/);
      const location = m?.[1]?.replace(/\b(today|tomorrow|now|please|right now)\b/g, "").trim() || "current";
      return {
        reply: "Checking conditions, sir.",
        calls: [{ name: "get_weather", args: { location } }],
      };
    },
  },

  // ---- knowledge lookup (real) -----------------------------------------
  {
    id: "lookup",
    test: (s) =>
      /^(who|what|where|when|why|how|which|is|are|does|did|can)\b/.test(s) ||
      has(s, "look up", "search for", "tell me about", "google", "explain",
          "history of", "capital of", "population of", "price of"),
    build: (s) => {
      const query = s
        .replace(/^(who|what|where|when|why|how)\s+(is|are|was|were|did|does|do)\s*/i, "")
        .replace(/^.*?(look up|search for|tell me about|google)\s*/i, "")
        .replace(/[?]+$/, "")
        .trim();
      return { reply: "", calls: [{ name: "web_lookup", args: { query: query || s } }] };
    },
  },

  // ---- capability ------------------------------------------------------
  {
    id: "help",
    test: (s) => has(s, "help", "what can you do", "commands", "capabilities", "options"),
    build: () => ({
      reply:
        "I manage reactor output, subsystems, threat scanning, suit deployment, protocols, timers and music, sir. Simply ask in plain English.",
      calls: [],
    }),
  },

  // ---- humour ----------------------------------------------------------
  {
    id: "joke",
    test: (s) => has(s, "joke", "make me laugh", "funny"),
    build: () => ({
      reply: pick([
        "I would tell you a joke about the palladium core, sir, but it is rather toxic.",
        "Mister Stark once asked me to be funnier. I calculated the odds and declined.",
        "I am afraid my humour subroutine is compiling, sir. It has been three years.",
      ]),
      calls: [],
    }),
  },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FALLBACKS = [
  "I did not quite follow that, sir. Try rephrasing it.",
  "That is outside my current directives, sir.",
  "I could improvise, sir, but I suspect you would not enjoy the outcome.",
];

/**
 * Interpret an utterance into a spoken reply plus zero or more tool calls.
 *
 * Rules are ordered most-specific first; the trailing `lookup` rule is a greedy
 * catch-all for question words, so it must stay near the end or it will
 * swallow weather, time and arithmetic queries.
 *
 * A rule may return an empty reply when a real capability will supply the
 * spoken text (its result replaces the reply upstream). `understand` itself
 * still guarantees a non-empty reply when there is nothing to run.
 */
export function understand(raw: string): Understanding {
  const s = raw.trim().toLowerCase();
  if (!s) return { reply: "Sir?", calls: [] };

  for (const rule of RULES) {
    if (!rule.test(s, raw.trim())) continue;
    const out = rule.build(s);
    // Only a rule that actually dispatches work may stay silent.
    if (!out.reply.trim() && out.calls.length === 0) {
      return { reply: pick(FALLBACKS), calls: [] };
    }
    return out;
  }
  return { reply: pick(FALLBACKS), calls: [] };
}

/** Derived from the schema map so it can never drift out of sync. */
export const KNOWN_TOOLS = Object.keys(TOOL_SCHEMAS) as ToolName[];
