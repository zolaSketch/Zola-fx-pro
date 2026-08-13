import type { Atmosphere } from "./atmosphere";

export type Propulsion = "turbofan" | "turboprop" | "piston" | "rotor" | "electric";

export type AircraftModel = {
  id: string;
  name: string;
  nameAm: string;
  classLabel: string;
  classLabelAm: string;
  role: string;
  roleAm: string;
  buyers: Array<"airline" | "charter" | "school" | "sovereign" | "cargo" | "ngo">;
  propulsion: Propulsion;
  slTakeoffM: number;
  slLandingM: number;
  slClimbFpm: number;
  mtowKg: number;
  oewKg: number;
  maxPayloadKg: number;
  maxFuelKg: number;
  serviceCeilingFt: number;
  vlofKts: number;
  /** Density ratio below which OGE hover is lost at MTOW (rotors). */
  ogeSigmaMtow?: number;
};

export type Release = "GO" | "REDUCE" | "HOLD" | "NO-GO";

export type Performance = {
  weightKg: number;
  payloadKg: number;
  fuelKg: number;
  weightRatio: number;
  thrustRatio: number;
  takeoffM: number;
  landingM: number;
  climbFpm: number;
  runwayUsedPct: number;
  climbGradientPct: number;
  tasLofKts: number;
  cycleDebt: number;
  brakeEnergy: number;
  hoverOge: boolean | null;
  payloadCapKg: number;
  release: Release;
  reasons: string[];
  reasonsAm: string[];
  nextCoolerHint: boolean;
};

export type Mission = {
  id: string;
  label: string;
  labelAm: string;
  /** Extra reserve on runway (fraction of available). */
  pad: number;
  /** Minimum climb fpm considered acceptable. */
  minClimb: number;
};

export const MISSIONS: Mission[] = [
  { id: "line", label: "Line transport", labelAm: "መስመር ትራንስፖርት", pad: 0.2, minClimb: 400 },
  { id: "train", label: "Training", labelAm: "ስልጠና", pad: 0.25, minClimb: 500 },
  { id: "cargo", label: "Cargo", labelAm: "ጭነት", pad: 0.18, minClimb: 350 },
  { id: "medevac", label: "Medevac", labelAm: "የሕክምና ቅኝት", pad: 0.22, minClimb: 400 },
  { id: "sar", label: "Search & rescue", labelAm: "ፍለጋ እና ታዳጊ", pad: 0.22, minClimb: 450 },
  { id: "relief", label: "Humanitarian / disaster", labelAm: "ሰብአዊ / አደጋ", pad: 0.15, minClimb: 300 },
  { id: "survey", label: "Survey / mapping", labelAm: "ቅኝት / ካርታ", pad: 0.2, minClimb: 300 },
  { id: "vip", label: "VIP transport", labelAm: "ልዩ ትራንስፖርት", pad: 0.28, minClimb: 500 },
];

function thrustRatio(p: Propulsion, sigma: number, isaDevC: number): number {
  const s = Math.max(0.25, sigma);
  const hot = Math.max(0, isaDevC);
  switch (p) {
    case "turbofan":
      return Math.pow(s, 0.72) * (1 - hot * 0.0024);
    case "turboprop":
      return Math.pow(s, 0.88) * (1 - hot * 0.002);
    case "piston":
      return s * (1 - hot * 0.0015);
    case "electric":
      return Math.pow(s, 0.35);
    case "rotor":
      return Math.pow(s, 0.9) * (1 - hot * 0.0022);
  }
}

function takeoffExponent(p: Propulsion): number {
  switch (p) {
    case "turbofan":
      return 1.72;
    case "turboprop":
      return 1.95;
    case "piston":
      return 2.05;
    case "electric":
      return 1.55;
    case "rotor":
      return 1.2;
  }
}

export function highlandCycleDebt(daFt: number): number {
  return 1 + Math.max(0, daFt - 3000) / 8000 * 0.7;
}

type RawPerf = Omit<Performance, "payloadCapKg" | "release" | "reasons" | "reasonsAm" | "nextCoolerHint">;

function rawPerformance(
  ac: AircraftModel,
  atm: Atmosphere,
  runwayM: number,
  payloadKg: number,
  fuelKg: number,
  headwindKts = 0,
): RawPerf {
  const payload = Math.max(0, Math.min(ac.maxPayloadKg, payloadKg));
  const fuel = Math.max(0, Math.min(ac.maxFuelKg, fuelKg));
  const weightKg = Math.min(ac.mtowKg, ac.oewKg + payload + fuel);
  const weightRatio = weightKg / ac.mtowKg;
  const sigma = atm.sigma;
  const tr = thrustRatio(ac.propulsion, sigma, atm.isaDevC);
  const exp = takeoffExponent(ac.propulsion);

  const hw = Math.max(-12, Math.min(25, headwindKts));
  const windFactor = Math.pow(Math.max(0.55, 1 - hw / Math.max(55, ac.vlofKts * 1.3)), 1.85);

  const takeoffM =
    ac.propulsion === "rotor"
      ? ac.slTakeoffM * Math.pow(weightRatio, 1.4) / Math.pow(sigma, 1.15)
      : ac.slTakeoffM *
        Math.pow(weightRatio, 2.25) /
        Math.pow(Math.max(0.32, sigma), exp) /
        Math.pow(Math.max(0.35, tr), 0.55) *
        windFactor;

  const landingM =
    ac.slLandingM *
    Math.pow(weightRatio, 1.35) /
    Math.pow(Math.max(0.4, sigma), 0.9) *
    Math.pow(Math.max(0.6, 1 - hw / 40), 1.2);

  const excess = tr / Math.max(0.45, weightRatio) - 0.42;
  const climbFpm = Math.max(0, ac.slClimbFpm * (excess / 0.58) * Math.pow(sigma, 0.25));
  const tasLofKts = ac.vlofKts * atm.tasFactor;
  const climbGradientPct = tasLofKts > 5 ? (climbFpm / (tasLofKts * 101.27)) * 100 : 0;

  let hoverOge: boolean | null = null;
  if (ac.propulsion === "rotor" && ac.ogeSigmaMtow) {
    const need = ac.ogeSigmaMtow * weightRatio;
    hoverOge = sigma >= need * 0.98;
  }

  const runwayUsedPct = (takeoffM / Math.max(1, runwayM)) * 100;
  const cycleDebt = highlandCycleDebt(atm.densityAltFt);
  const brakeEnergy = Math.pow(tasLofKts / ac.vlofKts, 2) * weightRatio;

  return {
    weightKg,
    payloadKg: payload,
    fuelKg: fuel,
    weightRatio,
    thrustRatio: tr,
    takeoffM,
    landingM,
    climbFpm,
    runwayUsedPct,
    climbGradientPct,
    tasLofKts,
    cycleDebt,
    brakeEnergy,
    hoverOge,
  };
}

export function solvePayloadForRunway(
  ac: AircraftModel,
  atm: Atmosphere,
  runwayM: number,
  fuelKg: number,
  mission: Mission,
  headwindKts = 0,
): number {
  const usable = runwayM * (1 - mission.pad);
  let lo = 0;
  let hi = ac.maxPayloadKg;
  let best = 0;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    const perf = rawPerformance(ac, atm, runwayM, mid, fuelKg, headwindKts);
    if (perf.takeoffM <= usable && perf.climbFpm >= mission.minClimb && perf.hoverOge !== false) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return Math.floor(best);
}

export function evaluatePerformance(
  ac: AircraftModel,
  atm: Atmosphere,
  runwayM: number,
  payloadKg: number,
  fuelKg: number,
  mission: Mission,
  headwindKts = 0,
): Performance {
  const core = rawPerformance(ac, atm, runwayM, payloadKg, fuelKg, headwindKts);
  const { takeoffM, climbFpm, hoverOge } = core;
  const payload = Math.max(0, Math.min(ac.maxPayloadKg, payloadKg));
  const fuel = Math.max(0, Math.min(ac.maxFuelKg, fuelKg));
  const hw = Math.max(-12, Math.min(25, headwindKts));
  const usable = runwayM * (1 - mission.pad);
  const reasons: string[] = [];
  const reasonsAm: string[] = [];

  const fieldLimited = takeoffM > usable;
  const climbLimited = climbFpm < mission.minClimb;
  const hoverLimited = hoverOge === false;
  const ceilingLimited = atm.densityAltFt > ac.serviceCeilingFt - 1500;

  if (fieldLimited) {
    reasons.push(`Takeoff ${Math.round(takeoffM)} m exceeds ${(mission.pad * 100).toFixed(0)}% padded runway (${Math.round(usable)} m).`);
    reasonsAm.push(`የመነሻ ርዝመት ${Math.round(takeoffM)} ሜትር ከተፈቀደው ${Math.round(usable)} ሜትር በላይ ነው።`);
  }
  if (climbLimited) {
    reasons.push(`Climb ${Math.round(climbFpm)} fpm below mission floor ${mission.minClimb} fpm.`);
    reasonsAm.push(`የመውጣት ፍጥነት ${Math.round(climbFpm)} fpm ከሚያስፈልገው ${mission.minClimb} በታች ነው።`);
  }
  if (hoverLimited) {
    reasons.push("Out-of-ground-effect hover is not available at this density and weight.");
    reasonsAm.push("በዚህ ጥግግት እና ክብደት ከመሬት ውጪ መንሳፈፍ አይቻልም።");
  }
  if (ceilingLimited) {
    reasons.push("Density altitude is inside 1,500 ft of service ceiling.");
    reasonsAm.push("የጥግግት ከፍታ ወደ የአገልግሎት ጣሪያ በጣም ቀርቧል።");
  }

  const payloadCapKg = solvePayloadForRunway(ac, atm, runwayM, fuel, mission, hw);

  let release: Release;
  const nextCoolerHint = fieldLimited || climbLimited || hoverLimited;

  if (!fieldLimited && !climbLimited && !hoverLimited && !ceilingLimited) {
    release = "GO";
    reasons.push("Margins hold for this mission, weight and hour.");
    reasonsAm.push("ለዚህ ተልእኮ፣ ክብደት እና ሰዓት ህዳጎች ይይዛሉ።");
  } else if (payloadCapKg >= Math.max(80, payload * 0.35) && payloadCapKg < payload) {
    release = "REDUCE";
    reasons.push(`Can release with payload cut to ~${payloadCapKg} kg.`);
    reasonsAm.push(`ጭነቱን ወደ ~${payloadCapKg} ኪ.ግ ቢቀንስ መነሳት ይቻላል።`);
  } else if (nextCoolerHint && payloadCapKg < Math.max(80, payload * 0.35)) {
    // Dawn may still work — caller decides HOLD vs NO-GO using the window.
    release = "HOLD";
    reasons.push("This hour is thin. Wait for cooler density or a longer runway.");
    reasonsAm.push("ይህ ሰዓት ቀጭን ነው። ቀዝቃዛ ጥግግት ወይም ረዘም ያለ ማኮብኮቢያ ይጠብቁ።");
  } else {
    release = "NO-GO";
  }

  if (release === "HOLD" && payloadCapKg < 40 && atm.oatC <= (atm.isaC + 2)) {
    release = "NO-GO";
    reasons.push("Even near ISA this field cannot lift the planned aircraft.");
    reasonsAm.push("በISA አጠገብም ይህ ሜዳ የታቀደውን አውሮፕላን ሊያነሳ አይችልም።");
  }

  return {
    ...core,
    payloadCapKg,
    release,
    reasons,
    reasonsAm,
    nextCoolerHint,
  };
}

export type WindowPoint = {
  hour: number;
  oatC: number;
  daFt: number;
  sigma: number;
  takeoffM: number;
  climbFpm: number;
  payloadCapKg: number;
  release: Release;
};

export function classifyWindow(points: WindowPoint[]): {
  firstGo: number | null;
  lastGo: number | null;
  bestHour: number | null;
  bestPayload: number;
  goHours: number;
} {
  let firstGo: number | null = null;
  let lastGo: number | null = null;
  let bestHour: number | null = null;
  let bestPayload = -1;
  let goHours = 0;
  for (const p of points) {
    const ok = p.release === "GO" || p.release === "REDUCE";
    if (p.release === "GO") {
      goHours += 0.5;
      if (firstGo === null) firstGo = p.hour;
      lastGo = p.hour;
    }
    if (ok && p.payloadCapKg > bestPayload) {
      bestPayload = p.payloadCapKg;
      bestHour = p.hour;
    }
  }
  return { firstGo, lastGo, bestHour, bestPayload: Math.max(0, bestPayload), goHours };
}
