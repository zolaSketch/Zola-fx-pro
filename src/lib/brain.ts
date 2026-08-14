import type { ToolCall, ToolName } from "./tools";

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
  test: (s: string) => boolean;
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
    test: (s) =>
      has(s, "power", "reactor", "divert", "output", "energy", "juice") &&
      !has(s, "power down", "shut"),
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

  // ---- notes -----------------------------------------------------------
  {
    id: "note",
    test: (s) => has(s, "note", "remember", "log this", "make a note", "take a memo"),
    build: (s) => {
      const text = s.replace(/^.*?(note|remember|log this|memo)[:\s]*/i, "").trim() || "Unspecified note";
      return { reply: "Noted, sir.", calls: [{ name: "log_note", args: { text } }] };
    },
  },

  // ---- clear -----------------------------------------------------------
  {
    id: "clear",
    test: (s) => /^(clear|cls|reset|wipe)\b/.test(s) || has(s, "clear the log", "clear transcript"),
    build: () => ({ reply: "Transcript purged, sir.", calls: [{ name: "clear_log", args: {} }] }),
  },

  // ---- time / date -----------------------------------------------------
  {
    id: "time",
    test: (s) => has(s, "what time", "the time", "what day", "what's the date", "date today"),
    build: () => {
      const d = new Date();
      return {
        reply: `It is ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })} on ${d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}, sir.`,
        calls: [],
      };
    },
  },

  // ---- weather ---------------------------------------------------------
  {
    id: "weather",
    test: (s) => has(s, "weather", "forecast", "raining", "temperature outside", "how cold", "how hot"),
    build: () => ({
      reply: `Currently ${14 + Math.round(Math.random() * 12)} degrees with scattered cloud, sir. Flight conditions are favourable.`,
      calls: [],
    }),
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

/** Interpret an utterance into a spoken reply plus zero or more tool calls. */
export function understand(raw: string): Understanding {
  const s = raw.trim().toLowerCase();
  if (!s) return { reply: "Sir?", calls: [] };

  for (const rule of RULES) {
    if (rule.test(s)) return rule.build(s);
  }
  return { reply: pick(FALLBACKS), calls: [] };
}

export const KNOWN_TOOLS: ToolName[] = [
  "set_power", "scan_threats", "set_subsystem", "run_protocol", "suit_control",
  "set_status", "play_music", "start_timer", "log_note", "run_diagnostics", "clear_log",
];
