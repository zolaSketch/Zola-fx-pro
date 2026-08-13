export type Climate = {
  tmin: number;
  tmax: number;
  rhDawn: number;
  rhAfternoon: number;
  qnhMean: number;
};

export type FieldKind = "hub" | "domestic" | "joint" | "remote" | "short";

export type Airfield = {
  icao: string;
  iata: string;
  name: string;
  nameAm: string;
  city: string;
  cityAm: string;
  region: string;
  lat: number;
  lon: number;
  elevM: number;
  rwyM: number;
  rwyId: string;
  kind: FieldKind;
  climate: Climate;
};

const highland: Climate = { tmin: 7, tmax: 23, rhDawn: 62, rhAfternoon: 32, qnhMean: 1014 };
const highNorth: Climate = { tmin: 8, tmax: 25, rhDawn: 48, rhAfternoon: 22, qnhMean: 1013 };
const midGreen: Climate = { tmin: 11, tmax: 27, rhDawn: 72, rhAfternoon: 42, qnhMean: 1013 };
const rift: Climate = { tmin: 12, tmax: 28, rhDawn: 58, rhAfternoon: 34, qnhMean: 1012 };
const eastHot: Climate = { tmin: 19, tmax: 36, rhDawn: 42, rhAfternoon: 18, qnhMean: 1011 };
const lowWest: Climate = { tmin: 20, tmax: 35, rhDawn: 78, rhAfternoon: 48, qnhMean: 1010 };
const lowEast: Climate = { tmin: 22, tmax: 38, rhDawn: 40, rhAfternoon: 16, qnhMean: 1010 };
const danakil: Climate = { tmin: 24, tmax: 40, rhDawn: 38, rhAfternoon: 14, qnhMean: 1009 };

export const AIRFIELDS: Airfield[] = [
  {
    icao: "HAAB", iata: "ADD", name: "Bole International", nameAm: "ቦሌ ዓለም አቀፍ",
    city: "Addis Ababa", cityAm: "አዲስ አበባ", region: "Addis Ababa",
    lat: 8.9778, lon: 38.7993, elevM: 2326, rwyM: 3800, rwyId: "07R/25L",
    kind: "hub", climate: highland,
  },
  {
    icao: "HAAL", iata: "—", name: "Lideta", nameAm: "ልደታ",
    city: "Addis Ababa", cityAm: "አዲስ አበባ", region: "Addis Ababa",
    lat: 9.0037, lon: 38.726, elevM: 2362, rwyM: 1170, rwyId: "12/30",
    kind: "short", climate: highland,
  },
  {
    icao: "HAHM", iata: "QHR", name: "Harar Meda", nameAm: "ሐረር ሜዳ",
    city: "Bishoftu", cityAm: "ቢሾፍቱ", region: "Oromia",
    lat: 8.7163, lon: 39.0059, elevM: 1890, rwyM: 3000, rwyId: "16/34",
    kind: "joint", climate: highland,
  },
  {
    icao: "HADT", iata: "DBT", name: "Debre Tabor", nameAm: "ደብረ ታቦር",
    city: "Debre Tabor", cityAm: "ደብረ ታቦር", region: "Amhara",
    lat: 11.894, lon: 38.009, elevM: 2588, rwyM: 1400, rwyId: "14/32",
    kind: "short", climate: highland,
  },
  {
    icao: "HAMA", iata: "MKS", name: "Mekane Selam", nameAm: "መካነ ሰላም",
    city: "Mekane Selam", cityAm: "መካነ ሰላም", region: "Amhara",
    lat: 10.726, lon: 38.742, elevM: 2562, rwyM: 1600, rwyId: "10/28",
    kind: "remote", climate: highland,
  },
  {
    icao: "HADM", iata: "DBM", name: "Debre Markos", nameAm: "ደብረ ማርቆስ",
    city: "Debre Markos", cityAm: "ደብረ ማርቆስ", region: "Amhara",
    lat: 10.323, lon: 37.743, elevM: 2480, rwyM: 1800, rwyId: "04/22",
    kind: "remote", climate: highland,
  },
  {
    icao: "HAMK", iata: "MQX", name: "Alula Aba Nega", nameAm: "አሉላ አባ ነጋ",
    city: "Mekelle", cityAm: "መቀሌ", region: "Tigray",
    lat: 13.4674, lon: 39.5336, elevM: 2254, rwyM: 3000, rwyId: "11/29",
    kind: "domestic", climate: highNorth,
  },
  {
    icao: "HAAX", iata: "AXU", name: "Axum", nameAm: "አክሱም",
    city: "Axum", cityAm: "አክሱም", region: "Tigray",
    lat: 14.1468, lon: 38.7728, elevM: 2112, rwyM: 2200, rwyId: "16/34",
    kind: "domestic", climate: highNorth,
  },
  {
    icao: "HALL", iata: "LLI", name: "Lalibela", nameAm: "ላሊበላ",
    city: "Lalibela", cityAm: "ላሊበላ", region: "Amhara",
    lat: 11.975, lon: 38.98, elevM: 1983, rwyM: 1140, rwyId: "10/28",
    kind: "short", climate: highland,
  },
  {
    icao: "HAGN", iata: "GDQ", name: "Gondar", nameAm: "ጎንደር",
    city: "Gondar", cityAm: "ጎንደር", region: "Amhara",
    lat: 12.5199, lon: 37.434, elevM: 1966, rwyM: 2700, rwyId: "17/35",
    kind: "domestic", climate: highland,
  },
  {
    icao: "HABD", iata: "BJR", name: "Bahir Dar", nameAm: "ባሕር ዳር",
    city: "Bahir Dar", cityAm: "ባሕር ዳር", region: "Amhara",
    lat: 11.6081, lon: 37.3216, elevM: 1822, rwyM: 3000, rwyId: "04/22",
    kind: "domestic", climate: rift,
  },
  {
    icao: "HADC", iata: "DSE", name: "Combolcha", nameAm: "ኮምቦልቻ",
    city: "Dessie", cityAm: "ደሴ", region: "Amhara",
    lat: 11.0825, lon: 39.7114, elevM: 1864, rwyM: 2500, rwyId: "17/35",
    kind: "domestic", climate: highland,
  },
  {
    icao: "HALA", iata: "AWA", name: "Hawassa", nameAm: "ሐዋሳ",
    city: "Hawassa", cityAm: "ሐዋሳ", region: "Sidama",
    lat: 7.067, lon: 38.488, elevM: 1738, rwyM: 2000, rwyId: "18/36",
    kind: "domestic", climate: rift,
  },
  {
    icao: "HAJM", iata: "JIM", name: "Aba Segud", nameAm: "አባ ሰጉድ",
    city: "Jimma", cityAm: "ጅማ", region: "Oromia",
    lat: 7.6661, lon: 36.8166, elevM: 1703, rwyM: 2000, rwyId: "13/31",
    kind: "domestic", climate: midGreen,
  },
  {
    icao: "HAJJ", iata: "JIJ", name: "Wilwal", nameAm: "ዊልዋል",
    city: "Jijiga", cityAm: "ጅጅጋ", region: "Somali",
    lat: 9.3325, lon: 42.9121, elevM: 1647, rwyM: 2400, rwyId: "03/21",
    kind: "domestic", climate: eastHot,
  },
  {
    icao: "HASO", iata: "ASO", name: "Asosa", nameAm: "አሶሳ",
    city: "Asosa", cityAm: "አሶሳ", region: "Benishangul-Gumuz",
    lat: 10.0185, lon: 34.5863, elevM: 1554, rwyM: 2000, rwyId: "11/29",
    kind: "domestic", climate: midGreen,
  },
  {
    icao: "HAAM", iata: "AMH", name: "Arba Minch", nameAm: "አርባ ምንጭ",
    city: "Arba Minch", cityAm: "አርባ ምንጭ", region: "South",
    lat: 6.0394, lon: 37.5905, elevM: 1189, rwyM: 3000, rwyId: "03/21",
    kind: "domestic", climate: rift,
  },
  {
    icao: "HADR", iata: "DIR", name: "Aba Tenna Yilma", nameAm: "አባ ተና ይልማ",
    city: "Dire Dawa", cityAm: "ድሬዳዋ", region: "Dire Dawa",
    lat: 9.6247, lon: 41.8542, elevM: 1166, rwyM: 2700, rwyId: "15/33",
    kind: "hub", climate: eastHot,
  },
  {
    icao: "HAGM", iata: "GMB", name: "Gambela", nameAm: "ጋምቤላ",
    city: "Gambela", cityAm: "ጋምቤላ", region: "Gambela",
    lat: 8.1288, lon: 34.5631, elevM: 492, rwyM: 2500, rwyId: "18/36",
    kind: "domestic", climate: lowWest,
  },
  {
    icao: "HASM", iata: "SZE", name: "Semera", nameAm: "ሰመራ",
    city: "Semera", cityAm: "ሰመራ", region: "Afar",
    lat: 11.7875, lon: 40.9915, elevM: 430, rwyM: 2300, rwyId: "13/31",
    kind: "domestic", climate: danakil,
  },
  {
    icao: "HAGO", iata: "GDE", name: "Gode", nameAm: "ጎዴ",
    city: "Gode", cityAm: "ጎዴ", region: "Somali",
    lat: 5.9351, lon: 43.5786, elevM: 254, rwyM: 2300, rwyId: "04/22",
    kind: "remote", climate: lowEast,
  },
  {
    icao: "HAKD", iata: "ABK", name: "Kebri Dehar", nameAm: "ቀብሪደሃር",
    city: "Kebri Dehar", cityAm: "ቀብሪደሃር", region: "Somali",
    lat: 6.734, lon: 44.253, elevM: 550, rwyM: 2200, rwyId: "07/25",
    kind: "remote", climate: lowEast,
  },
  {
    icao: "HAHU", iata: "HUE", name: "Humera", nameAm: "ሑመራ",
    city: "Humera", cityAm: "ሑመራ", region: "Tigray",
    lat: 14.25, lon: 36.583, elevM: 786, rwyM: 1600, rwyId: "13/31",
    kind: "remote", climate: eastHot,
  },
  {
    icao: "HAJN", iata: "BCO", name: "Jinka", nameAm: "ጂንካ",
    city: "Jinka", cityAm: "ጂንካ", region: "South",
    lat: 5.782, lon: 36.552, elevM: 457, rwyM: 1500, rwyId: "12/30",
    kind: "remote", climate: lowWest,
  },
];

export const BOLE = AIRFIELDS[0];

/** Simplified Ethiopia mainland ring [lon, lat]. */
export const ETHIOPIA_RING: [number, number][] = [
  [34.95, 14.22],
  [36.5, 14.28],
  [37.55, 14.88],
  [38.25, 14.62],
  [39.15, 14.52],
  [39.95, 14.35],
  [40.05, 14.05],
  [41.05, 12.78],
  [41.85, 12.68],
  [42.15, 12.38],
  [42.82, 12.08],
  [43.15, 11.52],
  [42.98, 10.62],
  [44.15, 10.28],
  [45.35, 10.55],
  [46.05, 10.92],
  [47.08, 11.02],
  [47.88, 10.52],
  [47.68, 9.35],
  [47.25, 8.15],
  [46.35, 6.95],
  [45.48, 5.68],
  [44.65, 4.88],
  [42.75, 4.18],
  [41.85, 3.95],
  [39.95, 3.48],
  [38.45, 3.52],
  [36.75, 4.18],
  [35.78, 4.68],
  [35.15, 5.28],
  [34.15, 6.48],
  [33.52, 7.55],
  [33.02, 8.42],
  [33.18, 9.52],
  [33.88, 10.62],
  [34.08, 12.02],
  [35.28, 13.38],
  [36.02, 14.12],
];

export const LON0 = 32.6;
export const LON1 = 48.4;
export const LAT0 = 3.15;
export const LAT1 = 15.25;

export function project(lon: number, lat: number, w: number, h: number) {
  return {
    x: ((lon - LON0) / (LON1 - LON0)) * w,
    y: ((LAT1 - lat) / (LAT1 - LAT0)) * h,
  };
}

export function ringPath(w: number, h: number): string {
  return ETHIOPIA_RING.map(([lon, lat], i) => {
    const { x, y } = project(lon, lat, w, h);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

export const GLOBAL_HIGHLANDS = [
  { icao: "SKBO", city: "Bogotá", elevM: 2548, market: "Andes" },
  { icao: "SEQU", city: "Quito", elevM: 2400, market: "Andes" },
  { icao: "SLLP", city: "La Paz", elevM: 4061, market: "Andes" },
  { icao: "SPZO", city: "Cusco", elevM: 3310, market: "Andes" },
  { icao: "KDEN", city: "Denver", elevM: 1655, market: "Rockies" },
  { icao: "HKJK", city: "Nairobi", elevM: 1624, market: "East Africa" },
  { icao: "FAOR", city: "Johannesburg", elevM: 1694, market: "Southern Africa" },
  { icao: "VNKT", city: "Kathmandu", elevM: 1338, market: "Himalaya" },
  { icao: "VILH", city: "Leh", elevM: 3256, market: "Himalaya" },
  { icao: "ZULS", city: "Lhasa", elevM: 3570, market: "Tibet" },
];
