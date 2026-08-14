import {
  clean,
  fetchJson,
  firstSentences,
  fmt,
  type Answer,
  type Provider,
} from "./types";
import { BODIES, CONSTANTS, ELEMENTS, convert, findBody, findConstant, findElement } from "./core";
import { COMPUTED_PROVIDERS } from "./computed-providers";

/* ======================================================= offline providers */

const constantsProvider: Provider = {
  name: "Physical constants",
  domains: ["science", "numbers"],
  offline: true,
  canHandle: (q) => findConstant(q) !== null,
  async run(q) {
    const c = findConstant(q);
    if (!c) return null;
    return {
      summary: `The ${c.name.toLowerCase()} is ${c.value.toExponential(6)} ${c.unit}.`,
      meta: [
        `CONSTANT ... ${c.name}`,
        `VALUE ...... ${c.value.toExponential(9)} ${c.unit}`,
        `DECIMAL .... ${c.value.toLocaleString(undefined, { maximumSignificantDigits: 12 })}`,
        ...(c.note ? [`NOTE ....... ${c.note}`] : []),
      ],
      source: "CODATA",
      confidence: 0.95,
      data: c,
    };
  },
};

const elementProvider: Provider = {
  name: "Periodic table",
  domains: ["chemistry", "science"],
  offline: true,
  canHandle: (q) => findElement(q) !== null,
  async run(q) {
    const e = findElement(q);
    if (!e) return null;
    const k = (v: number | null) =>
      v === null ? "—" : `${v} K (${(v - 273.15).toFixed(1)} °C)`;
    return {
      summary: `${e.name}, symbol ${e.sym}, atomic number ${e.z}. It is a ${e.group} with an atomic mass of ${e.mass}.`,
      meta: [
        `ELEMENT .... ${e.name} (${e.sym})`,
        `ATOMIC No .. ${e.z}`,
        `MASS ....... ${e.mass} u`,
        `CATEGORY ... ${e.group}`,
        `PERIOD ..... ${e.period}`,
        `CONFIG ..... ${e.config}`,
        `MELTING .... ${k(e.melt)}`,
        `BOILING .... ${k(e.boil)}`,
        `ELECTRONEG . ${e.electroneg ?? "—"}`,
      ],
      source: "Periodic table",
      confidence: 0.93,
      data: e,
    };
  },
};

const astroProvider: Provider = {
  name: "Solar system",
  domains: ["space", "science"],
  offline: true,
  canHandle: (q) => findBody(q) !== null,
  async run(q) {
    const b = findBody(q);
    if (!b) return null;
    const parts = [
      `${b.name} is a ${b.kind} with a radius of ${fmt(b.radiusKm)} kilometres.`,
      b.note + ".",
    ];
    return {
      summary: parts.join(" "),
      meta: [
        `BODY ....... ${b.name}`,
        `TYPE ....... ${b.kind}`,
        `RADIUS ..... ${fmt(b.radiusKm)} km`,
        `MASS ....... ${b.massKg.toExponential(3)} kg`,
        ...(b.distanceAu ? [`FROM SUN ... ${b.distanceAu} AU`] : []),
        `DAY ........ ${b.dayHours} hours`,
        ...(b.yearDays ? [`YEAR ....... ${fmt(b.yearDays)} Earth days`] : []),
        ...(b.moons !== undefined ? [`MOONS ...... ${b.moons}`] : []),
      ],
      source: "Astronomical data",
      confidence: 0.92,
      data: b,
    };
  },
};

const conversionProvider: Provider = {
  name: "Unit conversion",
  domains: ["units", "numbers"],
  offline: true,
  canHandle: (q) => convert(q) !== null,
  async run(q) {
    const c = convert(q);
    if (!c) return null;
    return {
      summary: `${fmt(c.value)} ${c.from} is ${fmt(c.result, 4)} ${c.to}, sir.`,
      meta: [`INPUT ...... ${c.value} ${c.from}`, `RESULT ..... ${fmt(c.result, 6)} ${c.to}`],
      source: "Unit conversion",
      confidence: 0.96,
      data: c,
    };
  },
};

/* ======================================================== online providers */

interface WikiSummary {
  title: string;
  extract?: string;
  description?: string;
  type?: string;
  content_urls?: { desktop?: { page?: string } };
  thumbnail?: { source?: string };
}

const wikipedia: Provider = {
  name: "Wikipedia",
  domains: ["entity", "general", "people", "science", "film", "books"],
  async run(q, signal) {
    const j = await fetchJson<WikiSummary>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/\s+/g, "_"))}`,
      signal,
    );
    if (!j?.extract || j.type === "disambiguation") return null;
    const text = clean(j.extract);
    return {
      summary: firstSentences(text, 2),
      meta: [
        `SOURCE ..... Wikipedia · ${j.title}`,
        ...(j.description ? [`SUBTITLE ... ${clean(j.description)}`] : []),
        text,
      ],
      source: "Wikipedia",
      url: j.content_urls?.desktop?.page,
      confidence: 0.85,
      data: j,
    };
  },
};

const wikiSearch: Provider = {
  name: "Wikipedia search",
  domains: ["general", "entity"],
  async run(q, signal) {
    const j = await fetchJson<{ query?: { search?: { title: string; snippet: string }[] } }>(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=5&format=json&origin=*`,
      signal,
    );
    const hits = j?.query?.search;
    if (!hits?.length) return null;
    return {
      summary: `The closest match I have is ${hits[0].title}: ${clean(hits[0].snippet)}.`,
      meta: [`SOURCE ..... Wikipedia search`, ...hits.map((h) => `${h.title} — ${clean(h.snippet)}`)],
      source: "Wikipedia",
      confidence: 0.55,
      data: hits,
    };
  },
};

const dictionary: Provider = {
  name: "Dictionary",
  domains: ["definition"],
  canHandle: (q, d) => d === "definition" || /^(define|meaning of|what does .* mean)/i.test(q),
  async run(q, signal) {
    const word = q
      .replace(/^(define|definition of|meaning of|what does)\s+/i, "")
      .replace(/\s+mean\??$/i, "")
      .trim()
      .split(/\s+/)[0];
    if (!word) return null;

    const j = await fetchJson<
      { word: string; phonetic?: string; meanings: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }[] }[]
    >(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, signal);
    const entry = j?.[0];
    if (!entry?.meanings?.length) return null;

    const first = entry.meanings[0];
    const def = first.definitions[0];
    return {
      summary: `${entry.word}, ${first.partOfSpeech}: ${def.definition}`,
      meta: [
        `WORD ....... ${entry.word}${entry.phonetic ? ` ${entry.phonetic}` : ""}`,
        ...entry.meanings.slice(0, 3).flatMap((m) =>
          m.definitions.slice(0, 2).map((d) => `(${m.partOfSpeech}) ${d.definition}`),
        ),
        ...(def.example ? [`EXAMPLE .... "${def.example}"`] : []),
      ],
      source: "Dictionary",
      confidence: 0.9,
      data: entry,
    };
  },
};

const countries: Provider = {
  name: "Countries",
  domains: ["country"],
  canHandle: (_q, d) => d === "country",
  async run(q, signal) {
    const name = q
      .replace(/\b(capital|population|currency|language|flag|of|the|what is|where is|tell me about)\b/gi, "")
      .trim();
    if (!name) return null;

    const j = await fetchJson<
      {
        name: { common: string; official: string };
        capital?: string[];
        population: number;
        region: string;
        subregion?: string;
        languages?: Record<string, string>;
        currencies?: Record<string, { name: string; symbol?: string }>;
        area: number;
        flag?: string;
      }[]
    >(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,capital,population,region,subregion,languages,currencies,area,flag`,
      signal,
    );
    const c = j?.[0];
    if (!c) return null;

    const langs = Object.values(c.languages ?? {}).join(", ");
    const curr = Object.values(c.currencies ?? {})
      .map((x) => `${x.name}${x.symbol ? ` (${x.symbol})` : ""}`)
      .join(", ");

    return {
      summary: `${c.name.common}: capital ${c.capital?.[0] ?? "none"}, population ${fmt(c.population)}, in ${c.region}.`,
      meta: [
        `COUNTRY .... ${c.name.official} ${c.flag ?? ""}`,
        `CAPITAL .... ${c.capital?.join(", ") ?? "—"}`,
        `POPULATION . ${c.population.toLocaleString()}`,
        `AREA ....... ${c.area.toLocaleString()} km²`,
        `REGION ..... ${c.subregion ?? c.region}`,
        ...(langs ? [`LANGUAGES .. ${langs}`] : []),
        ...(curr ? [`CURRENCY ... ${curr}`] : []),
      ],
      source: "REST Countries",
      confidence: 0.9,
      data: c,
    };
  },
};

const currency: Provider = {
  name: "Exchange rates",
  domains: ["money"],
  canHandle: (_q, d) => d === "money",
  async run(q, signal) {
    const m = q
      .toUpperCase()
      .match(/(\d+(?:\.\d+)?)?\s*([A-Z]{3})\s*(?:TO|IN|INTO)\s*([A-Z]{3})/);
    if (!m) return null;
    const amount = m[1] ? parseFloat(m[1]) : 1;
    const from = m[2];
    const to = m[3];

    const j = await fetchJson<{ rates?: Record<string, number>; date?: string }>(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
      signal,
    );
    const rate = j?.rates?.[to];
    if (!rate) return null;

    return {
      summary: `${fmt(amount)} ${from} is ${fmt(amount * rate, 2)} ${to}.`,
      meta: [
        `AMOUNT ..... ${amount} ${from}`,
        `RATE ....... 1 ${from} = ${rate} ${to}`,
        `RESULT ..... ${fmt(amount * rate, 4)} ${to}`,
        ...(j?.date ? [`AS OF ...... ${j.date}`] : []),
      ],
      source: "Frankfurter (ECB)",
      confidence: 0.92,
      data: j,
    };
  },
};

const crypto: Provider = {
  name: "Crypto prices",
  domains: ["crypto"],
  canHandle: (_q, d) => d === "crypto",
  async run(q, signal) {
    const ids: Record<string, string> = {
      bitcoin: "bitcoin", btc: "bitcoin", ethereum: "ethereum", eth: "ethereum",
      solana: "solana", sol: "solana", cardano: "cardano", ada: "cardano",
      dogecoin: "dogecoin", doge: "dogecoin", ripple: "ripple", xrp: "ripple",
    };
    const s = q.toLowerCase();
    const key = Object.keys(ids).find((k) => new RegExp(`\\b${k}\\b`).test(s));
    if (!key) return null;
    const id = ids[key];

    const j = await fetchJson<Record<string, { usd: number; usd_24h_change?: number }>>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
      signal,
    );
    const d = j?.[id];
    if (!d) return null;

    const ch = d.usd_24h_change ?? 0;
    return {
      summary: `${id.charAt(0).toUpperCase() + id.slice(1)} is trading at ${fmt(d.usd)} US dollars, ${ch >= 0 ? "up" : "down"} ${Math.abs(ch).toFixed(2)} percent today.`,
      meta: [
        `ASSET ...... ${id.toUpperCase()}`,
        `PRICE ...... $${d.usd.toLocaleString()}`,
        `24H ........ ${ch >= 0 ? "+" : ""}${ch.toFixed(2)}%`,
      ],
      source: "CoinGecko",
      confidence: 0.9,
      data: d,
    };
  },
};

const numberFacts: Provider = {
  name: "Number facts",
  domains: ["numbers"],
  canHandle: (q) => /\b\d+\b/.test(q) && /\b(fact|interesting|special|about the number)\b/i.test(q),
  async run(q, signal) {
    const n = q.match(/\b(\d{1,9})\b/)?.[1];
    if (!n) return null;
    const txt = await fetch(`http://numbersapi.com/${n}?json`, { signal })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    if (!txt?.text) return null;
    return {
      summary: txt.text,
      meta: [`NUMBER ..... ${n}`, txt.text],
      source: "Numbers API",
      confidence: 0.7,
    };
  },
};

const books: Provider = {
  name: "Open Library",
  domains: ["books"],
  canHandle: (_q, d) => d === "books",
  async run(q, signal) {
    const title = q.replace(/\b(book|novel|who wrote|author of|about)\b/gi, "").trim();
    if (!title) return null;
    const j = await fetchJson<{
      docs?: { title: string; author_name?: string[]; first_publish_year?: number; subject?: string[] }[];
    }>(`https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=3&fields=title,author_name,first_publish_year,subject`, signal);
    const b = j?.docs?.[0];
    if (!b) return null;
    const author = b.author_name?.[0] ?? "an unknown author";
    return {
      summary: `${b.title} was written by ${author}${b.first_publish_year ? `, first published in ${b.first_publish_year}` : ""}.`,
      meta: [
        `TITLE ...... ${b.title}`,
        `AUTHOR ..... ${b.author_name?.join(", ") ?? "unknown"}`,
        ...(b.first_publish_year ? [`PUBLISHED .. ${b.first_publish_year}`] : []),
        ...(b.subject?.length ? [`SUBJECTS ... ${b.subject.slice(0, 5).join(", ")}`] : []),
      ],
      source: "Open Library",
      confidence: 0.8,
      data: b,
    };
  },
};

const duckduckgo: Provider = {
  name: "DuckDuckGo",
  domains: ["general", "definition", "entity"],
  async run(q, signal) {
    const j = await fetchJson<{ AbstractText?: string; AbstractURL?: string; Heading?: string }>(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`,
      signal,
    );
    if (!j?.AbstractText) return null;
    return {
      summary: firstSentences(clean(j.AbstractText), 2),
      meta: [`SOURCE ..... DuckDuckGo${j.Heading ? ` · ${j.Heading}` : ""}`, clean(j.AbstractText)],
      source: "DuckDuckGo",
      url: j.AbstractURL,
      confidence: 0.7,
      data: j,
    };
  },
};

/** Offline first (instant, always available), then network sources. */
export const PROVIDERS: Provider[] = [
  // Computed providers are exact and key-free; they claim narrowly via
  // canHandle so they never shadow the general knowledge sources.
  ...COMPUTED_PROVIDERS,
  conversionProvider,
  constantsProvider,
  elementProvider,
  astroProvider,
  dictionary,
  countries,
  currency,
  crypto,
  books,
  numberFacts,
  wikipedia,
  duckduckgo,
  wikiSearch,
];

export const OFFLINE_PROVIDERS = PROVIDERS.filter((p) => p.offline);

export { CONSTANTS, ELEMENTS, BODIES };
export type { Answer };
