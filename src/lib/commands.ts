import type { CommandContext, CommandSpec } from "./types";

const has = (input: string, ...words: string[]) =>
  words.some((w) => input.includes(w));

export const COMMANDS: CommandSpec[] = [
  {
    name: "status",
    aliases: ["report", "diagnostics", "sitrep"],
    usage: "status",
    summary: "Full systems diagnostic readout.",
    match: (i) => has(i, "status", "diagnostic", "report", "sitrep", "systems check"),
    run: (_i, ctx) => {
      ctx.say("Running full diagnostic sweep, sir.", {
        tone: "ok",
        meta: [
          `ARC REACTOR ...... ${ctx.power.toFixed(0)}% nominal`,
          "REPULSOR BUS ..... charged, safeties engaged",
          "ARMOR INTEGRITY .. 100% — no breaches detected",
          "SAT UPLINK ....... locked, 4 birds in view",
          "THREAT MATRIX .... passive monitoring",
        ],
      });
    },
  },
  {
    name: "power",
    aliases: ["reactor", "divert"],
    usage: "power <0-100>",
    summary: "Divert arc reactor output.",
    match: (i) => has(i, "power", "reactor", "divert", "energy"),
    run: (i, ctx) => {
      const n = i.match(/(\d{1,3})/);
      if (!n) {
        ctx.say(`Arc reactor holding at ${ctx.power.toFixed(0)}%. Specify a target, sir.`, {
          tone: "neutral",
        });
        return;
      }
      const v = Math.min(100, Math.max(0, parseInt(n[1], 10)));
      ctx.setPower(v);
      if (v > 92) {
        ctx.say(`Routing ${v}% to the reactor. That is above the recommended envelope.`, {
          tone: "warn",
          meta: ["Thermal load rising", "Palladium core stress +18%"],
        });
      } else if (v < 20) {
        ctx.say(`Reactor throttled to ${v}%. Flight systems will be unavailable.`, {
          tone: "warn",
        });
      } else {
        ctx.say(`Reactor output set to ${v}%. Distribution stable.`, { tone: "ok" });
      }
    },
  },
  {
    name: "scan",
    aliases: ["sweep", "radar", "threats"],
    usage: "scan",
    summary: "Sweep the perimeter for contacts.",
    match: (i) => has(i, "scan", "sweep", "radar", "threat", "contacts", "perimeter"),
    run: () => {
      /* handled by store in the runner */
    },
  },
  {
    name: "suit",
    aliases: ["armor", "mark", "deploy"],
    usage: "suit up",
    summary: "Initiate suit deployment sequence.",
    match: (i) => has(i, "suit", "armor up", "mark", "deploy", "assemble"),
    run: (_i, ctx) => {
      ctx.say("Initiating deployment sequence for Mark LXXXV.", {
        tone: "ok",
        meta: [
          "Gauntlets ......... locked",
          "Chestplate ........ sealed",
          "Boots ............. pressurised",
          "Helmet ............ HUD synced",
          "Nano-lattice ...... 100% coverage",
        ],
      });
    },
  },
  {
    name: "weather",
    usage: "weather",
    summary: "Local atmospheric conditions.",
    match: (i) => has(i, "weather", "temperature outside", "forecast", "wind"),
    run: (_i, ctx) => {
      const t = 14 + Math.round(Math.random() * 12);
      ctx.say(`Local conditions: ${t}°C, scattered cloud, wind 11 km/h from the north-east.`, {
        tone: "neutral",
        meta: ["Visibility 9 km", "Barometric 1014 hPa", "Flight conditions: favourable"],
      });
    },
  },
  {
    name: "time",
    aliases: ["clock", "date"],
    usage: "time",
    summary: "Current time and date.",
    match: (i) => has(i, "time", "clock", "what day", "date"),
    run: (_i, ctx) => {
      const d = new Date();
      ctx.say(
        `It is ${d.toLocaleTimeString(undefined, { hour12: false })} on ${d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`,
        { tone: "neutral" },
      );
    },
  },
  {
    name: "protocol",
    aliases: ["house party", "clean slate", "lockdown"],
    usage: "protocol <name>",
    summary: "Execute a stored protocol.",
    match: (i) => has(i, "protocol", "house party", "clean slate", "lockdown", "veronica"),
    run: (i, ctx) => {
      if (has(i, "house party")) {
        ctx.say("House Party Protocol engaged. All units airborne.", {
          tone: "warn",
          meta: ["38 suits responding", "Autonomous flight enabled", "Perimeter handover complete"],
        });
      } else if (has(i, "clean slate")) {
        ctx.say("Clean Slate Protocol. Are you certain, sir? All units will self-destruct.", {
          tone: "danger",
        });
      } else if (has(i, "lockdown")) {
        ctx.setStatus("alert");
        ctx.say("Facility lockdown initiated. Blast doors sealing.", {
          tone: "danger",
          meta: ["Perimeter armed", "External comms restricted", "Non-essential power cut"],
        });
      } else {
        ctx.say("Available protocols: House Party, Clean Slate, Lockdown, Veronica.", {
          tone: "neutral",
        });
      }
    },
  },
  {
    name: "music",
    usage: "play music",
    summary: "Queue something appropriate.",
    match: (i) => has(i, "music", "play something", "song", "playlist"),
    run: (_i, ctx) => {
      ctx.say("Queuing your workshop playlist. Volume at a civilised level, sir.", {
        tone: "ok",
        meta: ["Now playing — AC/DC, Shoot to Thrill"],
      });
    },
  },
  {
    name: "clear",
    aliases: ["reset"],
    usage: "clear",
    summary: "Clear the transcript.",
    match: (i) => /^(clear|cls|reset)\b/.test(i),
    run: () => {
      /* handled in runner */
    },
  },
  {
    name: "help",
    aliases: ["commands", "?"],
    usage: "help",
    summary: "List available directives.",
    match: (i) => /^(help|commands|\?)\b/.test(i) || has(i, "what can you do"),
    run: (_i, ctx) => {
      ctx.say("Directive index, sir.", {
        tone: "neutral",
        meta: COMMANDS.filter((c) => c.name !== "help").map(
          (c) => `${c.usage.padEnd(18, " ")} ${c.summary}`,
        ),
      });
    },
  },
];

const FALLBACKS = [
  "I'm afraid I don't have a protocol for that, sir. Try 'help'.",
  "That request falls outside my current directives.",
  "I could improvise, but you would not enjoy the result. Try 'help'.",
  "Unrecognised directive. Shall I run diagnostics instead?",
];

export function resolveCommand(raw: string): CommandSpec | null {
  const input = raw.trim().toLowerCase();
  if (!input) return null;
  return COMMANDS.find((c) => c.match(input)) ?? null;
}

export function fallbackReply(seed = Date.now()) {
  return FALLBACKS[seed % FALLBACKS.length];
}

export type { CommandContext };
