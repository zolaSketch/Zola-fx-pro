/**
 * Dega moist-air atmosphere.
 *
 * Foreign dispatch tools still ship the FAA rule of thumb
 *   DA = PA + 120 × (OAT − ISA)
 * which is linear and dry. At Ethiopian plateau extremes the
 * error is hundreds of feet — enough to flip a go / reduce call.
 *
 * Dega computes station pressure from QNH, mixes dry air and
 * water vapour, then inverts the ISA density profile.
 * Planning use only — not a certified AFM substitute.
 */

export const T0 = 288.15;
export const P0 = 101325;
export const RHO0 = 1.225;
export const L_ISA = 0.0065;
export const G0 = 9.80665;
export const RD = 287.058;
export const RV = 461.495;
export const FT = 3.280839895;
export const M_PER_FT = 0.3048;

export type AtmosphereInput = {
  elevM: number;
  oatC: number;
  qnhHpa: number;
  rhPct: number;
};

export type Atmosphere = {
  elevM: number;
  elevFt: number;
  oatC: number;
  qnhHpa: number;
  rhPct: number;
  isaC: number;
  isaDevC: number;
  stationHpa: number;
  vaporHpa: number;
  rho: number;
  sigma: number;
  pressureAltFt: number;
  densityAltFt: number;
  densityAltM: number;
  ruleOfThumbFt: number;
  ruleErrorFt: number;
  tasFactor: number;
};

export function isaTempC(elevM: number): number {
  return 15 - L_ISA * elevM;
}

/** QNH reduced with the ISA troposphere. Good enough for planning. */
export function stationPressureHpa(qnhHpa: number, elevM: number): number {
  const t = T0 - L_ISA * Math.max(0, elevM);
  const exp = G0 / (RD * L_ISA);
  return qnhHpa * Math.pow(t / T0, exp);
}

/** Bolton / WMO saturation vapour pressure, hPa. */
export function satVaporHpa(oatC: number): number {
  return 6.112 * Math.exp((17.67 * oatC) / (oatC + 243.5));
}

export function moistDensity(pHpa: number, oatC: number, rhPct: number): number {
  const tk = oatC + 273.15;
  const e = Math.min(satVaporHpa(oatC) * Math.max(0, Math.min(100, rhPct)) / 100, pHpa * 0.95);
  const pd = pHpa - e;
  return (pd * 100) / (RD * tk) + (e * 100) / (RV * tk);
}

/** Invert ISA tropospheric density → geometric height (m). */
export function heightFromSigma(sigma: number): number {
  const s = Math.max(0.05, Math.min(1.4, sigma));
  const exp = G0 / (RD * L_ISA) - 1; // ≈ 4.256
  return (T0 / L_ISA) * (1 - Math.pow(s, 1 / exp));
}

export function pressureAltitudeFt(elevM: number, qnhHpa: number): number {
  const ratio = Math.max(0.5, Math.min(1.2, qnhHpa / 1013.25));
  const delta = 145442.16 * (1 - Math.pow(ratio, 0.190284));
  return elevM * FT + delta;
}

export function ruleOfThumbDaFt(paFt: number, oatC: number): number {
  const isa = 15 - 1.9812 * (paFt / 1000);
  return paFt + 120 * (oatC - isa);
}

export function computeAtmosphere(input: AtmosphereInput): Atmosphere {
  const { elevM, oatC, qnhHpa, rhPct } = input;
  const isaC = isaTempC(elevM);
  const stationHpa = stationPressureHpa(qnhHpa, elevM);
  const vaporHpa = satVaporHpa(oatC) * Math.max(0, Math.min(100, rhPct)) / 100;
  const rho = moistDensity(stationHpa, oatC, rhPct);
  const sigma = rho / RHO0;
  const densityAltM = heightFromSigma(sigma);
  const densityAltFt = densityAltM * FT;
  const pressureAltFt = pressureAltitudeFt(elevM, qnhHpa);
  const ruleOfThumbFt = ruleOfThumbDaFt(pressureAltFt, oatC);

  return {
    elevM,
    elevFt: elevM * FT,
    oatC,
    qnhHpa,
    rhPct,
    isaC,
    isaDevC: oatC - isaC,
    stationHpa,
    vaporHpa,
    rho,
    sigma,
    pressureAltFt,
    densityAltFt,
    densityAltM,
    ruleOfThumbFt,
    ruleErrorFt: densityAltFt - ruleOfThumbFt,
    tasFactor: 1 / Math.sqrt(Math.max(0.35, sigma)),
  };
}

/**
 * Highland diurnal climate.
 * Tmin just after dawn, Tmax mid-afternoon.
 * RH and QNH breathe the opposite way.
 */
export function oatAtHour(hour: number, tmin: number, tmax: number): number {
  const tminH = 6.2;
  const tmaxH = 14.8;
  const wrap = (h: number) => ((h % 24) + 24) % 24;
  const h = wrap(hour);
  if (h >= tminH && h <= tmaxH) {
    const u = (h - tminH) / (tmaxH - tminH);
    return tmin + (tmax - tmin) * (1 - Math.cos(Math.PI * u)) / 2;
  }
  const span = 24 - (tmaxH - tminH);
  const h2 = h >= tmaxH ? h : h + 24;
  const u = (h2 - tmaxH) / span;
  return tmax + (tmin - tmax) * (1 - Math.cos(Math.PI * u)) / 2;
}

export function rhAtHour(hour: number, rhDawn: number, rhAfternoon: number): number {
  const t = oatAtHour(hour, 0, 1);
  return rhDawn + (rhAfternoon - rhDawn) * t;
}

export function qnhAtHour(hour: number, mean = 1013): number {
  const h = ((hour % 24) + 24) % 24;
  return mean + 3.4 * Math.cos(((h - 8.5) / 12) * Math.PI);
}

export function atmosphereAtHour(
  elevM: number,
  hour: number,
  climate: { tmin: number; tmax: number; rhDawn: number; rhAfternoon: number; qnhMean: number },
): Atmosphere {
  return computeAtmosphere({
    elevM,
    oatC: oatAtHour(hour, climate.tmin, climate.tmax),
    rhPct: rhAtHour(hour, climate.rhDawn, climate.rhAfternoon),
    qnhHpa: qnhAtHour(hour, climate.qnhMean),
  });
}
