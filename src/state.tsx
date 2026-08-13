import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AIRFIELDS, BOLE, type Airfield } from "./data/airfields";
import { AIRCRAFT } from "./data/aircraft";
import type { Lang } from "./data/i18n";
import { atmosphereAtHour } from "./lib/atmosphere";
import {
  evaluatePerformance,
  MISSIONS,
  type Mission,
  type Performance,
} from "./lib/performance";
import { eatHour } from "./lib/time";

export type Seller = {
  company: string;
  companyAm: string;
  person: string;
  tin: string;
  bank: string;
  account: string;
  email: string;
  phone: string;
  city: string;
};

const DEFAULT_SELLER: Seller = {
  company: "Dega Systems",
  companyAm: "ደጋ ሲስተምስ",
  person: "Zola",
  tin: "0000000000",
  bank: "Commercial Bank of Ethiopia",
  account: "1000XXXXXXXX",
  email: "sell@dega.et",
  phone: "+251 9XX XXX XXX",
  city: "Addis Ababa",
};

type Store = {
  lang: Lang;
  setLang: (l: Lang) => void;
  hour: number;
  setHour: (h: number) => void;
  live: boolean;
  setLive: (v: boolean) => void;
  field: Airfield;
  setFieldId: (icao: string) => void;
  aircraftId: string;
  setAircraftId: (id: string) => void;
  missionId: string;
  setMissionId: (id: string) => void;
  payloadKg: number;
  setPayloadKg: (n: number) => void;
  fuelKg: number;
  setFuelKg: (n: number) => void;
  headwind: number;
  setHeadwind: (n: number) => void;
  seller: Seller;
  setSeller: (s: Seller) => void;
  atm: ReturnType<typeof atmosphereAtHour>;
  mission: Mission;
  perf: Performance;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("am");
  const [hour, setHour] = useState(eatHour());
  const [live, setLive] = useState(true);
  const [fieldId, setFieldId] = useState(BOLE.icao);
  const [aircraftId, setAircraftId] = useState("s400");
  const [missionId, setMissionId] = useState("line");
  const [payloadKg, setPayloadKg] = useState(4200);
  const [fuelKg, setFuelKg] = useState(2800);
  const [headwind, setHeadwind] = useState(6);
  const [seller, setSeller] = useState<Seller>(() => {
    try {
      const raw = localStorage.getItem("dega.seller");
      return raw ? { ...DEFAULT_SELLER, ...JSON.parse(raw) } : DEFAULT_SELLER;
    } catch {
      return DEFAULT_SELLER;
    }
  });

  useEffect(() => {
    localStorage.setItem("dega.seller", JSON.stringify(seller));
  }, [seller]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setHour(eatHour()), 15000);
    return () => window.clearInterval(id);
  }, [live]);

  const field = AIRFIELDS.find((f) => f.icao === fieldId) ?? BOLE;
  const aircraft = AIRCRAFT.find((a) => a.id === aircraftId) ?? AIRCRAFT[0];
  const mission = MISSIONS.find((m) => m.id === missionId) ?? MISSIONS[0];

  useEffect(() => {
    setPayloadKg(Math.round(aircraft.maxPayloadKg * 0.48));
    setFuelKg(Math.round(aircraft.maxFuelKg * 0.55));
  }, [aircraft.id, aircraft.maxFuelKg, aircraft.maxPayloadKg]);

  const atm = useMemo(
    () => atmosphereAtHour(field.elevM, hour, field.climate),
    [field, hour],
  );

  const perf = useMemo(
    () => evaluatePerformance(aircraft, atm, field.rwyM, payloadKg, fuelKg, mission, headwind),
    [aircraft, atm, field.rwyM, payloadKg, fuelKg, mission, headwind],
  );

  const value: Store = {
    lang,
    setLang,
    hour,
    setHour,
    live,
    setLive,
    field,
    setFieldId,
    aircraftId,
    setAircraftId,
    missionId,
    setMissionId,
    payloadKg,
    setPayloadKg,
    fuelKg,
    setFuelKg,
    headwind,
    setHeadwind,
    seller,
    setSeller,
    atm,
    mission,
    perf,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("store");
  return s;
}

export function useHash(): string {
  const [h, setH] = useState(() => window.location.hash || "#/");
  useEffect(() => {
    const f = () => setH(window.location.hash || "#/");
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return h;
}

export function go(hash: string) {
  window.location.hash = hash;
}
