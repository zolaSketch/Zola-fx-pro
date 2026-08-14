import { bearing, compassPoint, haversine } from "../knowledge/compute";

/**
 * Live aircraft radar.
 *
 * Pulls real ADS-B traffic from the OpenSky Network, which is free and needs
 * no API key, then converts each contact into the polar coordinates the HUD
 * radar draws with. Runs entirely in the browser, so it works on a static
 * deployment with no backend.
 */

export interface Aircraft {
  id: string;
  callsign: string;
  country: string;
  lat: number;
  lon: number;
  /** Metres. */
  altitude: number;
  /** Metres per second. */
  velocity: number;
  /** Degrees clockwise from north. */
  heading: number;
  verticalRate: number;
  onGround: boolean;
  /** Kilometres from the observer. */
  distanceKm: number;
  /** Degrees from the observer. */
  bearingDeg: number;
}

/** OpenSky returns positional rows as a heterogeneous tuple. */
type StateVector = [
  string, // 0 icao24
  string | null, // 1 callsign
  string, // 2 origin_country
  number | null, // 3 time_position
  number, // 4 last_contact
  number | null, // 5 longitude
  number | null, // 6 latitude
  number | null, // 7 baro_altitude
  boolean, // 8 on_ground
  number | null, // 9 velocity
  number | null, // 10 true_track
  number | null, // 11 vertical_rate
  number[] | null, // 12 sensors
  number | null, // 13 geo_altitude
  string | null, // 14 squawk
  boolean, // 15 spi
  number, // 16 position_source
];

const OPENSKY = "https://opensky-network.org/api/states/all";

/** Degrees of latitude per kilometre; longitude is scaled by cos(lat). */
const KM_PER_DEG_LAT = 1 / 110.574;

export interface FlightQuery {
  lat: number;
  lon: number;
  /** Search radius in kilometres. */
  radiusKm?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Fetch aircraft within `radiusKm` of a point, nearest first.
 *
 * OpenSky takes a bounding box, so we over-fetch a square and filter to a
 * true circle afterwards using great-circle distance.
 */
export async function getAircraftNearby({
  lat,
  lon,
  radiusKm = 150,
  signal,
  timeoutMs = 12_000,
}: FlightQuery): Promise<Aircraft[]> {
  const dLat = radiusKm * KM_PER_DEG_LAT;
  // Guard against division by zero at the poles.
  const cos = Math.max(0.01, Math.cos((lat * Math.PI) / 180));
  const dLon = dLat / cos;

  const url =
    `${OPENSKY}?lamin=${(lat - dLat).toFixed(4)}&lamax=${(lat + dLat).toFixed(4)}` +
    `&lomin=${(lon - dLon).toFixed(4)}&lomax=${(lon + dLon).toFixed(4)}`;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  const onAbort = () => ac.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const res = await fetch(url, { signal: ac.signal });
    if (!res.ok) throw new Error(`OpenSky responded ${res.status}`);

    const json = (await res.json()) as { states: StateVector[] | null };
    const states = json.states ?? [];

    const out: Aircraft[] = [];
    for (const s of states) {
      const lonS = s[5];
      const latS = s[6];
      if (lonS === null || latS === null) continue;

      const distanceKm = haversine(lat, lon, latS, lonS);
      if (distanceKm > radiusKm) continue;

      out.push({
        id: s[0],
        callsign: (s[1] ?? "").trim() || "UNKNOWN",
        country: s[2] ?? "—",
        lat: latS,
        lon: lonS,
        altitude: s[13] ?? s[7] ?? 0,
        velocity: s[9] ?? 0,
        heading: s[10] ?? 0,
        verticalRate: s[11] ?? 0,
        onGround: s[8],
        distanceKm,
        bearingDeg: bearing(lat, lon, latS, lonS),
      });
    }

    return out.sort((a, b) => a.distanceKm - b.distanceKm);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** Threat level by proximity, matching the HUD's existing colour bands. */
export function proximityLevel(distanceKm: number): "low" | "medium" | "high" {
  if (distanceKm < 25) return "high";
  if (distanceKm < 75) return "medium";
  return "low";
}

/** A spoken, HUD-ready summary of the closest contacts. */
export function describeTraffic(list: Aircraft[], radiusKm: number) {
  if (!list.length) {
    return {
      summary: `No aircraft within ${radiusKm} kilometres, sir. The skies are clear.`,
      meta: [`RADIUS ..... ${radiusKm} km`, "CONTACTS ... 0"],
    };
  }

  const nearest = list[0];
  const airborne = list.filter((a) => !a.onGround).length;

  return {
    summary:
      `${list.length} aircraft within ${radiusKm} kilometres, sir. ` +
      `Nearest is ${spokenCallsign(nearest.callsign)}, ` +
      `${nearest.distanceKm.toFixed(0)} kilometres ${compassPoint(nearest.bearingDeg)}` +
      (nearest.onGround
        ? ", on the ground."
        : ` at ${Math.round(nearest.altitude)} metres.`),
    meta: [
      `RADIUS ..... ${radiusKm} km`,
      `CONTACTS ... ${list.length} (${airborne} airborne)`,
      ...list.slice(0, 8).map((a) => {
        const alt = a.onGround ? "GROUND" : `${Math.round(a.altitude)}m`;
        const spd = a.onGround ? "" : ` · ${Math.round(a.velocity * 3.6)}km/h`;
        return (
          `${a.callsign.padEnd(8)} ${a.distanceKm.toFixed(0).padStart(3)}km ` +
          `${compassPoint(a.bearingDeg).padEnd(3)} ${alt}${spd} · ${a.country}`
        );
      }),
    ],
  };
}

/** Read a callsign in a way speech synthesis handles sensibly. */
function spokenCallsign(cs: string): string {
  const m = cs.match(/^([A-Z]{2,3})(\d{1,4})$/);
  if (!m) return cs.split("").join(" ");
  return `${m[1].split("").join(" ")} ${m[2]}`;
}
