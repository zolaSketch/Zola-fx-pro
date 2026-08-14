import { afterEach, describe, expect, it, vi } from "vitest";
import { describeTraffic, getAircraftNearby, proximityLevel } from "./flights";

afterEach(() => vi.unstubAllGlobals());

/** Build an OpenSky state vector with sensible defaults. */
function state(
  over: Partial<{
    icao: string;
    callsign: string;
    country: string;
    lon: number;
    lat: number;
    onGround: boolean;
    velocity: number;
    track: number;
    geoAlt: number;
  }> = {},
) {
  const {
    icao = "abc123",
    callsign = "ETH701 ",
    country = "Ethiopia",
    lon = 38.8,
    lat = 9.0,
    onGround = false,
    velocity = 240,
    track = 90,
    geoAlt = 10_000,
  } = over;
  return [
    icao, callsign, country, null, 0, lon, lat, geoAlt, onGround,
    velocity, track, 0, null, geoAlt, null, false, 0,
  ];
}

const respond = (states: unknown[]) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ states }) } as Response),
    ),
  );

describe("proximity banding", () => {
  it("maps distance to threat level", () => {
    expect(proximityLevel(10)).toBe("high");
    expect(proximityLevel(50)).toBe("medium");
    expect(proximityLevel(200)).toBe("low");
  });
});

describe("fetching nearby aircraft", () => {
  const here = { lat: 9.0, lon: 38.8 };

  it("computes distance and bearing for each contact", async () => {
    respond([state({ lat: 9.5, lon: 38.8 })]); // due north
    const [a] = await getAircraftNearby({ ...here, radiusKm: 200 });
    expect(a.callsign).toBe("ETH701");
    expect(a.distanceKm).toBeCloseTo(55.6, 0);
    expect(a.bearingDeg).toBeCloseTo(0, 0);
  });

  it("filters to a circle, not the fetched bounding box", async () => {
    respond([
      state({ icao: "near", lat: 9.1, lon: 38.8 }),
      // Inside the square but outside the radius, on the diagonal.
      state({ icao: "far", lat: 9.9, lon: 39.7 }),
    ]);
    const list = await getAircraftNearby({ ...here, radiusKm: 100 });
    expect(list.map((a) => a.id)).toEqual(["near"]);
  });

  it("sorts nearest first", async () => {
    respond([
      state({ icao: "c", lat: 9.9 }),
      state({ icao: "a", lat: 9.05 }),
      state({ icao: "b", lat: 9.4 }),
    ]);
    const list = await getAircraftNearby({ ...here, radiusKm: 300 });
    expect(list.map((a) => a.id)).toEqual(["a", "b", "c"]);
  });

  it("skips rows with no position", async () => {
    respond([state({ lat: undefined as unknown as number, lon: undefined as unknown as number })]);
    const rows = [state()];
    (rows[0] as unknown[])[5] = null;
    (rows[0] as unknown[])[6] = null;
    respond(rows);
    expect(await getAircraftNearby({ ...here })).toHaveLength(0);
  });

  it("tolerates an empty response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ states: null }) } as Response),
      ),
    );
    expect(await getAircraftNearby({ ...here })).toEqual([]);
  });

  it("throws on an upstream error so the caller can report it", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false, status: 503 } as Response)));
    await expect(getAircraftNearby({ ...here })).rejects.toThrow(/503/);
  });

  it("does not divide by zero near the poles", async () => {
    respond([]);
    await expect(
      getAircraftNearby({ lat: 90, lon: 0, radiusKm: 50 }),
    ).resolves.toEqual([]);
  });
});

describe("spoken summary", () => {
  it("reports an empty sky plainly", () => {
    const r = describeTraffic([], 150);
    expect(r.summary).toMatch(/no aircraft/i);
    expect(r.meta.join()).toContain("CONTACTS ... 0");
  });

  it("names the nearest contact with bearing and altitude", async () => {
    respond([state({ lat: 9.2, lon: 38.8, geoAlt: 9000 })]);
    const list = await getAircraftNearby({ lat: 9, lon: 38.8, radiusKm: 200 });
    const r = describeTraffic(list, 200);
    expect(r.summary).toMatch(/1 aircraft/);
    expect(r.summary).toMatch(/9000 metres/);
    expect(r.summary).toMatch(/\bN\b/);
  });

  it("says on the ground rather than quoting an altitude", async () => {
    respond([state({ lat: 9.01, lon: 38.8, onGround: true, geoAlt: 0 })]);
    const list = await getAircraftNearby({ lat: 9, lon: 38.8, radiusKm: 50 });
    expect(describeTraffic(list, 50).summary).toMatch(/on the ground/);
  });
});
