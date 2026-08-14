/**
 * Offline knowledge core.
 *
 * A compact, curated fact base so JARVIS is never entirely ignorant without a
 * network: physical constants, unit conversions, the periodic table, the solar
 * system, and world countries. Everything here is deterministic and testable —
 * no API, no key, no latency.
 */

/* ------------------------------------------------------------ constants */

export interface Constant {
  keys: string[];
  name: string;
  value: number;
  unit: string;
  note?: string;
}

export const CONSTANTS: Constant[] = [
  { keys: ["speed of light", "light speed", "c"], name: "Speed of light in vacuum", value: 299_792_458, unit: "m/s", note: "Exact by definition" },
  { keys: ["gravitational constant", "big g"], name: "Gravitational constant", value: 6.674_30e-11, unit: "m³ kg⁻¹ s⁻²" },
  { keys: ["planck constant", "planck"], name: "Planck constant", value: 6.626_070_15e-34, unit: "J·s", note: "Exact by definition" },
  { keys: ["avogadro"], name: "Avogadro constant", value: 6.022_140_76e23, unit: "mol⁻¹", note: "Exact by definition" },
  { keys: ["boltzmann"], name: "Boltzmann constant", value: 1.380_649e-23, unit: "J/K", note: "Exact by definition" },
  { keys: ["elementary charge", "electron charge"], name: "Elementary charge", value: 1.602_176_634e-19, unit: "C", note: "Exact by definition" },
  { keys: ["electron mass"], name: "Electron rest mass", value: 9.109_383_7015e-31, unit: "kg" },
  { keys: ["proton mass"], name: "Proton rest mass", value: 1.672_621_923_69e-27, unit: "kg" },
  { keys: ["gas constant"], name: "Molar gas constant", value: 8.314_462_618, unit: "J mol⁻¹ K⁻¹" },
  { keys: ["standard gravity", "g", "acceleration due to gravity"], name: "Standard gravity", value: 9.806_65, unit: "m/s²" },
  { keys: ["absolute zero"], name: "Absolute zero", value: -273.15, unit: "°C" },
  { keys: ["astronomical unit", "au"], name: "Astronomical unit", value: 149_597_870_700, unit: "m" },
  { keys: ["light year", "lightyear"], name: "Light year", value: 9.460_730_472_5808e15, unit: "m" },
  { keys: ["parsec"], name: "Parsec", value: 3.085_677_581e16, unit: "m" },
  { keys: ["earth radius"], name: "Earth mean radius", value: 6_371_000, unit: "m" },
  { keys: ["earth mass"], name: "Earth mass", value: 5.972e24, unit: "kg" },
  { keys: ["sun mass", "solar mass"], name: "Solar mass", value: 1.989e30, unit: "kg" },
  { keys: ["stefan boltzmann"], name: "Stefan–Boltzmann constant", value: 5.670_374_419e-8, unit: "W m⁻² K⁻⁴" },
  { keys: ["fine structure"], name: "Fine-structure constant", value: 7.297_352_5693e-3, unit: "dimensionless" },
  { keys: ["vacuum permittivity"], name: "Vacuum permittivity", value: 8.854_187_8128e-12, unit: "F/m" },
];

export function findConstant(q: string): Constant | null {
  const s = q.toLowerCase();
  let best: { c: Constant; len: number } | null = null;
  for (const c of CONSTANTS) {
    for (const k of c.keys) {
      // Whole-word match so "g" does not match inside "gravity".
      const re = new RegExp(`(^|\\s)${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\s|\\?)`, "i");
      if (re.test(s) && (!best || k.length > best.len)) best = { c, len: k.length };
    }
  }
  return best?.c ?? null;
}

/* ------------------------------------------------------------- elements */

export interface Element {
  z: number;
  sym: string;
  name: string;
  mass: number;
  group: string;
}

// Full periodic table, 118 elements.
const RAW_ELEMENTS =
  "H Hydrogen 1.008 nonmetal|He Helium 4.0026 noble gas|Li Lithium 6.94 alkali metal|Be Beryllium 9.0122 alkaline earth metal|B Boron 10.81 metalloid|C Carbon 12.011 nonmetal|N Nitrogen 14.007 nonmetal|O Oxygen 15.999 nonmetal|F Fluorine 18.998 halogen|Ne Neon 20.180 noble gas|Na Sodium 22.990 alkali metal|Mg Magnesium 24.305 alkaline earth metal|Al Aluminium 26.982 post-transition metal|Si Silicon 28.085 metalloid|P Phosphorus 30.974 nonmetal|S Sulfur 32.06 nonmetal|Cl Chlorine 35.45 halogen|Ar Argon 39.948 noble gas|K Potassium 39.098 alkali metal|Ca Calcium 40.078 alkaline earth metal|Sc Scandium 44.956 transition metal|Ti Titanium 47.867 transition metal|V Vanadium 50.942 transition metal|Cr Chromium 51.996 transition metal|Mn Manganese 54.938 transition metal|Fe Iron 55.845 transition metal|Co Cobalt 58.933 transition metal|Ni Nickel 58.693 transition metal|Cu Copper 63.546 transition metal|Zn Zinc 65.38 transition metal|Ga Gallium 69.723 post-transition metal|Ge Germanium 72.630 metalloid|As Arsenic 74.922 metalloid|Se Selenium 78.971 nonmetal|Br Bromine 79.904 halogen|Kr Krypton 83.798 noble gas|Rb Rubidium 85.468 alkali metal|Sr Strontium 87.62 alkaline earth metal|Y Yttrium 88.906 transition metal|Zr Zirconium 91.224 transition metal|Nb Niobium 92.906 transition metal|Mo Molybdenum 95.95 transition metal|Tc Technetium 98 transition metal|Ru Ruthenium 101.07 transition metal|Rh Rhodium 102.91 transition metal|Pd Palladium 106.42 transition metal|Ag Silver 107.87 transition metal|Cd Cadmium 112.41 transition metal|In Indium 114.82 post-transition metal|Sn Tin 118.71 post-transition metal|Sb Antimony 121.76 metalloid|Te Tellurium 127.60 metalloid|I Iodine 126.90 halogen|Xe Xenon 131.29 noble gas|Cs Caesium 132.91 alkali metal|Ba Barium 137.33 alkaline earth metal|La Lanthanum 138.91 lanthanide|Ce Cerium 140.12 lanthanide|Pr Praseodymium 140.91 lanthanide|Nd Neodymium 144.24 lanthanide|Pm Promethium 145 lanthanide|Sm Samarium 150.36 lanthanide|Eu Europium 151.96 lanthanide|Gd Gadolinium 157.25 lanthanide|Tb Terbium 158.93 lanthanide|Dy Dysprosium 162.50 lanthanide|Ho Holmium 164.93 lanthanide|Er Erbium 167.26 lanthanide|Tm Thulium 168.93 lanthanide|Yb Ytterbium 173.05 lanthanide|Lu Lutetium 174.97 lanthanide|Hf Hafnium 178.49 transition metal|Ta Tantalum 180.95 transition metal|W Tungsten 183.84 transition metal|Re Rhenium 186.21 transition metal|Os Osmium 190.23 transition metal|Ir Iridium 192.22 transition metal|Pt Platinum 195.08 transition metal|Au Gold 196.97 transition metal|Hg Mercury 200.59 transition metal|Tl Thallium 204.38 post-transition metal|Pb Lead 207.2 post-transition metal|Bi Bismuth 208.98 post-transition metal|Po Polonium 209 metalloid|At Astatine 210 halogen|Rn Radon 222 noble gas|Fr Francium 223 alkali metal|Ra Radium 226 alkaline earth metal|Ac Actinium 227 actinide|Th Thorium 232.04 actinide|Pa Protactinium 231.04 actinide|U Uranium 238.03 actinide|Np Neptunium 237 actinide|Pu Plutonium 244 actinide|Am Americium 243 actinide|Cm Curium 247 actinide|Bk Berkelium 247 actinide|Cf Californium 251 actinide|Es Einsteinium 252 actinide|Fm Fermium 257 actinide|Md Mendelevium 258 actinide|No Nobelium 259 actinide|Lr Lawrencium 266 actinide|Rf Rutherfordium 267 transition metal|Db Dubnium 268 transition metal|Sg Seaborgium 269 transition metal|Bh Bohrium 270 transition metal|Hs Hassium 269 transition metal|Mt Meitnerium 278 unknown|Ds Darmstadtium 281 unknown|Rg Roentgenium 282 unknown|Cn Copernicium 285 transition metal|Nh Nihonium 286 unknown|Fl Flerovium 289 post-transition metal|Mc Moscovium 290 unknown|Lv Livermorium 293 unknown|Ts Tennessine 294 halogen|Og Oganesson 294 noble gas";

export const ELEMENTS: Element[] = RAW_ELEMENTS.split("|").map((row, i) => {
  const parts = row.split(" ");
  return {
    z: i + 1,
    sym: parts[0],
    name: parts[1],
    mass: parseFloat(parts[2]),
    group: parts.slice(3).join(" "),
  };
});

export function findElement(q: string): Element | null {
  const s = q.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = s.split(/\s+/).filter(Boolean);

  for (const e of ELEMENTS) {
    if (words.includes(e.name.toLowerCase())) return e;
  }
  // Atomic number, e.g. "element 79".
  const num = s.match(/\belement\s+(\d{1,3})\b/);
  if (num) {
    const z = parseInt(num[1], 10);
    const hit = ELEMENTS.find((e) => e.z === z);
    if (hit) return hit;
  }
  // Symbol only when explicitly framed, to avoid matching stray words.
  if (/\b(element|symbol|atomic)\b/.test(s)) {
    for (const e of ELEMENTS) {
      if (words.includes(e.sym.toLowerCase())) return e;
    }
  }
  return null;
}

/* --------------------------------------------------------- solar system */

export interface Body {
  name: string;
  kind: string;
  radiusKm: number;
  massKg: number;
  distanceAu?: number;
  dayHours: number;
  yearDays?: number;
  moons?: number;
  note: string;
}

export const BODIES: Body[] = [
  { name: "Sun", kind: "G-type main-sequence star", radiusKm: 696_340, massKg: 1.989e30, dayHours: 587.28, note: "Contains 99.86% of the Solar System's mass" },
  { name: "Mercury", kind: "terrestrial planet", radiusKm: 2_439.7, massKg: 3.285e23, distanceAu: 0.387, dayHours: 1407.6, yearDays: 88, moons: 0, note: "Smallest planet, no atmosphere to speak of" },
  { name: "Venus", kind: "terrestrial planet", radiusKm: 6_051.8, massKg: 4.867e24, distanceAu: 0.723, dayHours: 5832.5, yearDays: 224.7, moons: 0, note: "Hottest planet, surface around 465 °C" },
  { name: "Earth", kind: "terrestrial planet", radiusKm: 6_371, massKg: 5.972e24, distanceAu: 1, dayHours: 24, yearDays: 365.25, moons: 1, note: "The only known world with life" },
  { name: "Mars", kind: "terrestrial planet", radiusKm: 3_389.5, massKg: 6.39e23, distanceAu: 1.524, dayHours: 24.7, yearDays: 687, moons: 2, note: "Home to Olympus Mons, the tallest volcano known" },
  { name: "Jupiter", kind: "gas giant", radiusKm: 69_911, massKg: 1.898e27, distanceAu: 5.203, dayHours: 9.9, yearDays: 4_333, moons: 95, note: "More massive than all other planets combined" },
  { name: "Saturn", kind: "gas giant", radiusKm: 58_232, massKg: 5.683e26, distanceAu: 9.537, dayHours: 10.7, yearDays: 10_759, moons: 146, note: "Least dense planet; it would float on water" },
  { name: "Uranus", kind: "ice giant", radiusKm: 25_362, massKg: 8.681e25, distanceAu: 19.191, dayHours: 17.2, yearDays: 30_687, moons: 28, note: "Rotates on its side, tilted 98 degrees" },
  { name: "Neptune", kind: "ice giant", radiusKm: 24_622, massKg: 1.024e26, distanceAu: 30.069, dayHours: 16.1, yearDays: 60_190, moons: 16, note: "Fastest winds in the Solar System, up to 2,100 km/h" },
  { name: "Pluto", kind: "dwarf planet", radiusKm: 1_188.3, massKg: 1.303e22, distanceAu: 39.48, dayHours: 153.3, yearDays: 90_560, moons: 5, note: "Reclassified as a dwarf planet in 2006" },
  { name: "Moon", kind: "natural satellite", radiusKm: 1_737.4, massKg: 7.342e22, dayHours: 708.7, note: "Drifting away from Earth at about 3.8 cm per year" },
];

export function findBody(q: string): Body | null {
  const s = q.toLowerCase();
  // Longest name first so "Moon" does not shadow nothing and Earth's moon wins.
  return (
    [...BODIES]
      .sort((a, b) => b.name.length - a.name.length)
      .find((b) => new RegExp(`\\b${b.name.toLowerCase()}\\b`).test(s)) ?? null
  );
}

/* ------------------------------------------------------------ unit conversion */

interface Unit {
  keys: string[];
  /** Factor to the base unit of its dimension. */
  factor: number;
  dim: string;
}

const UNITS: Unit[] = [
  // length -> metre
  { keys: ["m", "metre", "metres", "meter", "meters"], factor: 1, dim: "length" },
  { keys: ["km", "kilometre", "kilometres", "kilometer", "kilometers"], factor: 1000, dim: "length" },
  { keys: ["cm", "centimetre", "centimetres", "centimeter", "centimeters"], factor: 0.01, dim: "length" },
  { keys: ["mm", "millimetre", "millimetres", "millimeter", "millimeters"], factor: 0.001, dim: "length" },
  { keys: ["mi", "mile", "miles"], factor: 1609.344, dim: "length" },
  { keys: ["yd", "yard", "yards"], factor: 0.9144, dim: "length" },
  { keys: ["ft", "foot", "feet"], factor: 0.3048, dim: "length" },
  { keys: ["in", "inch", "inches"], factor: 0.0254, dim: "length" },
  { keys: ["nmi", "nautical mile", "nautical miles"], factor: 1852, dim: "length" },
  // mass -> kilogram
  { keys: ["kg", "kilogram", "kilograms", "kilo", "kilos"], factor: 1, dim: "mass" },
  { keys: ["g", "gram", "grams"], factor: 0.001, dim: "mass" },
  { keys: ["mg", "milligram", "milligrams"], factor: 1e-6, dim: "mass" },
  { keys: ["t", "tonne", "tonnes", "metric ton", "metric tons"], factor: 1000, dim: "mass" },
  { keys: ["lb", "lbs", "pound", "pounds"], factor: 0.453_592_37, dim: "mass" },
  { keys: ["oz", "ounce", "ounces"], factor: 0.028_349_523_125, dim: "mass" },
  { keys: ["st", "stone", "stones"], factor: 6.350_293_18, dim: "mass" },
  // speed -> m/s
  { keys: ["m/s", "mps", "metres per second", "meters per second"], factor: 1, dim: "speed" },
  { keys: ["km/h", "kph", "kmh", "kilometres per hour", "kilometers per hour"], factor: 1 / 3.6, dim: "speed" },
  { keys: ["mph", "miles per hour"], factor: 0.447_04, dim: "speed" },
  { keys: ["knot", "knots", "kn"], factor: 0.514_444, dim: "speed" },
  // volume -> litre
  { keys: ["l", "litre", "litres", "liter", "liters"], factor: 1, dim: "volume" },
  { keys: ["ml", "millilitre", "millilitres", "milliliter", "milliliters"], factor: 0.001, dim: "volume" },
  { keys: ["gal", "gallon", "gallons"], factor: 3.785_411_784, dim: "volume" },
  { keys: ["pt", "pint", "pints"], factor: 0.473_176_473, dim: "volume" },
  // data -> byte
  { keys: ["b", "byte", "bytes"], factor: 1, dim: "data" },
  { keys: ["kb", "kilobyte", "kilobytes"], factor: 1024, dim: "data" },
  { keys: ["mb", "megabyte", "megabytes"], factor: 1024 ** 2, dim: "data" },
  { keys: ["gb", "gigabyte", "gigabytes"], factor: 1024 ** 3, dim: "data" },
  { keys: ["tb", "terabyte", "terabytes"], factor: 1024 ** 4, dim: "data" },
  // time -> second
  { keys: ["s", "sec", "secs", "second", "seconds"], factor: 1, dim: "time" },
  { keys: ["min", "mins", "minute", "minutes"], factor: 60, dim: "time" },
  { keys: ["h", "hr", "hrs", "hour", "hours"], factor: 3600, dim: "time" },
  { keys: ["day", "days"], factor: 86_400, dim: "time" },
  { keys: ["week", "weeks"], factor: 604_800, dim: "time" },
  { keys: ["year", "years"], factor: 31_557_600, dim: "time" },
];

function findUnit(token: string): Unit | null {
  const t = token.toLowerCase().trim();
  return UNITS.find((u) => u.keys.includes(t)) ?? null;
}

export interface Conversion {
  value: number;
  from: string;
  to: string;
  result: number;
}

/** Temperature needs offsets, so it is handled separately from factors. */
function convertTemp(v: number, from: string, to: string): number | null {
  const f = from.toLowerCase();
  const t = to.toLowerCase();
  const isC = (x: string) => /^(c|celsius|centigrade|°c)$/.test(x);
  const isF = (x: string) => /^(f|fahrenheit|°f)$/.test(x);
  const isK = (x: string) => /^(k|kelvin)$/.test(x);
  if (!(isC(f) || isF(f) || isK(f)) || !(isC(t) || isF(t) || isK(t))) return null;

  const celsius = isC(f) ? v : isF(f) ? ((v - 32) * 5) / 9 : v - 273.15;
  if (isC(t)) return celsius;
  if (isF(t)) return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

/** Parse and evaluate "convert 100 km to miles" style requests. */
export function convert(query: string): Conversion | null {
  const m = query
    .toLowerCase()
    .match(/(-?\d+(?:\.\d+)?)\s*([a-z°/]+(?:\s[a-z]+)*?)\s+(?:to|in|into|as)\s+([a-z°/]+(?:\s[a-z]+)*)/);
  if (!m) return null;

  const value = parseFloat(m[1]);
  const fromRaw = m[2].trim();
  const toRaw = m[3].trim().replace(/[?.!]+$/, "");

  const temp = convertTemp(value, fromRaw, toRaw);
  if (temp !== null) {
    return { value, from: fromRaw, to: toRaw, result: temp };
  }

  const from = findUnit(fromRaw);
  const to = findUnit(toRaw);
  if (!from || !to || from.dim !== to.dim) return null;

  return { value, from: fromRaw, to: toRaw, result: (value * from.factor) / to.factor };
}
