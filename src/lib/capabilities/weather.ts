import { fail, ok, type CapabilityResult } from "./types";

/**
 * Real weather via Open-Meteo — no API key required.
 * Geocoding and forecast are separate public endpoints.
 */

const WMO: Record<number, string> = {
  0: "clear sky", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
  45: "fog", 48: "depositing rime fog",
  51: "light drizzle", 53: "moderate drizzle", 55: "dense drizzle",
  61: "slight rain", 63: "moderate rain", 65: "heavy rain",
  66: "freezing rain", 67: "heavy freezing rain",
  71: "slight snow", 73: "moderate snow", 75: "heavy snow", 77: "snow grains",
  80: "rain showers", 81: "moderate rain showers", 82: "violent rain showers",
  85: "snow showers", 86: "heavy snow showers",
  95: "thunderstorm", 96: "thunderstorm with hail", 99: "thunderstorm with heavy hail",
};

interface GeoHit {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
  admin1?: string;
}

async function geocode(place: string, signal?: AbortSignal): Promise<GeoHit | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const json = (await res.json()) as { results?: GeoHit[] };
  return json.results?.[0] ?? null;
}

export async function getWeather(
  place: string,
  opts: { lat?: number; lon?: number; signal?: AbortSignal } = {},
): Promise<CapabilityResult> {
  try {
    let lat = opts.lat;
    let lon = opts.lon;
    let label = place;

    if (lat === undefined || lon === undefined) {
      const hit = await geocode(place, opts.signal);
      if (!hit) return fail(`I could not find a place called ${place}, sir.`);
      lat = hit.latitude;
      lon = hit.longitude;
      label = [hit.name, hit.admin1, hit.country].filter(Boolean).join(", ");
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code` +
      `&timezone=auto&forecast_days=3`;

    const res = await fetch(url, { signal: opts.signal });
    if (!res.ok) return fail("The weather service is not responding, sir.");

    const j = (await res.json()) as {
      current: Record<string, number>;
      daily: Record<string, (number | string)[]>;
      timezone: string;
    };

    const c = j.current;
    const cond = WMO[c.weather_code] ?? "unsettled";
    const temp = Math.round(c.temperature_2m);
    const feels = Math.round(c.apparent_temperature);
    const wind = Math.round(c.wind_speed_10m);

    const days = (j.daily.time as string[]).slice(0, 3).map((d, i) => {
      const hi = Math.round(j.daily.temperature_2m_max[i] as number);
      const lo = Math.round(j.daily.temperature_2m_min[i] as number);
      const pop = j.daily.precipitation_probability_max[i] as number;
      const wc = WMO[j.daily.weather_code[i] as number] ?? "—";
      const name = i === 0 ? "Today" : new Date(d).toLocaleDateString(undefined, { weekday: "short" });
      return `${name.padEnd(6)} ${String(hi).padStart(3)}° / ${String(lo).padStart(3)}°  ${String(pop ?? 0).padStart(3)}% rain  ${wc}`;
    });

    return ok(
      `${label}: ${temp} degrees, ${cond}, feeling like ${feels}. Wind ${wind} kilometres per hour.`,
      [
        `LOCATION ... ${label}`,
        `NOW ........ ${temp}°C · ${cond} · feels ${feels}°C`,
        `HUMIDITY ... ${c.relative_humidity_2m}%`,
        `WIND ....... ${wind} km/h @ ${Math.round(c.wind_direction_10m)}°`,
        ...days,
      ],
      { label, current: c, daily: j.daily },
    );
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    return fail("I could not reach the weather service, sir.", [String(e)]);
  }
}
