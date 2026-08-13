export type Lang = "am" | "en";

export const copy = {
  brand: { am: "ደጋ", en: "DEGA" },
  brandSub: { am: "የደጋ አየር ብልህነት", en: "Highland aviation intelligence" },
  openConsole: { am: "ኮንሶሉን ክፈት", en: "Open the console" },
  seePricing: { am: "ዋጋ ተመልከት", en: "See pricing" },
  liveBole: { am: "አሁን ቦሌ", en: "Bole, this hour" },
  thesis: {
    am: "የባህር ጠለል የለንም። የባህር ጠለል ሶፍትዌርም አንፈልግም።",
    en: "We have no sea level. We should not fly on sea-level software.",
  },
  dek: {
    am: "ደጋ የመጀመሪያው የከፍተኛ ከፍታ የአቪዬሽን ብልህነት ስርዓት ነው — ለኢትዮጵያ ሰማይ የተሰራ፣ ለማንኛውም ቀጭን አየር የሚሸጥ።",
    en: "Dega is the first highland aviation intelligence system — built for Ethiopian sky, sold to anyone who takes off where the air is thin.",
  },
  notAWeapon: {
    am: "ይህ የጦር መሣሪያ አይደለም። የሚሸጥ ምርት ነው።",
    en: "This is not a weapon. It is a product you can sell.",
  },
  charter: {
    am: "ደጋ የጦር መሣሪያ አያሰማራም፣ ኢላማ አያሰላም፣ ጥቃት ሳይበር አይገነባም፣ የሰው ፊት አይከታተልም። የሚሰራው ዝግጁነት፣ ጥግግት፣ ጥገና እና ህዳግ ነው።",
    en: "Dega does not employ weapons, compute targeting, build offensive cyber, or track faces. It computes readiness, density, maintenance and margin.",
  },
  nav: {
    product: { am: "ምርት", en: "Product" },
    atlas: { am: "አትላስ", en: "Atlas" },
    price: { am: "ዋጋ", en: "Price" },
    sovereign: { am: "ሉዓላዊ", en: "Sovereign" },
    sell: { am: "ሽያጭ", en: "Sell" },
  },
  console: {
    atlas: { am: "አትላስ", en: "Atlas" },
    thin: { am: "ቀጭን አየር", en: "Thin air" },
    window: { am: "መስኮት", en: "Window" },
    fleet: { am: "መርከቦች", en: "Fleet" },
    sell: { am: "ሽያጭ", en: "Commerce" },
    sovereign: { am: "ሉዓላዊ", en: "Sovereign" },
    back: { am: "ወደ መግቢያ", en: "Back to landing" },
  },
  da: { am: "የጥግግት ከፍታ", en: "Density altitude" },
  sigma: { am: "የአየር ጥግግት σ", en: "Air density σ" },
  oat: { am: "ውጪ ሙቀት", en: "Outside air" },
  qnh: { am: "QNH", en: "QNH" },
  elev: { am: "ከፍታ", en: "Elevation" },
  rwy: { am: "ማኮብኮቢያ", en: "Runway" },
  go: { am: "ሂድ", en: "GO" },
  reduce: { am: "ቀንስ", en: "REDUCE" },
  hold: { am: "ጠብቅ", en: "HOLD" },
  nogo: { am: "አትሂድ", en: "NO-GO" },
} as const;

export function t<T extends { am: string; en: string }>(node: T, lang: Lang): string {
  return node[lang];
}
