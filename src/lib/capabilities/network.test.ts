import { afterEach, describe, expect, it, vi } from "vitest";
import { getWeather } from "./weather";
import { lookup } from "./search";

/**
 * The sandbox has no outbound network, and CI should not depend on third-party
 * uptime, so these exercise the parsing and failure paths against recorded
 * response shapes.
 */

const json = (body: unknown, ok = true) =>
  Promise.resolve({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(body),
  } as Response);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("weather", () => {
  const forecast = {
    current: {
      temperature_2m: 21.4,
      apparent_temperature: 20.1,
      relative_humidity_2m: 62,
      wind_speed_10m: 11.2,
      wind_direction_10m: 220,
      weather_code: 3,
      is_day: 1,
    },
    daily: {
      time: ["2026-08-14", "2026-08-15", "2026-08-16"],
      temperature_2m_max: [24, 26, 22],
      temperature_2m_min: [15, 17, 14],
      precipitation_probability_max: [10, 40, 70],
      weather_code: [3, 61, 80],
    },
    timezone: "Asia/Tokyo",
  };

  it("geocodes then reports real readings", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        url.includes("geocoding")
          ? json({ results: [{ latitude: 35.7, longitude: 139.7, name: "Tokyo", country: "Japan" }] })
          : json(forecast),
      ),
    );

    const r = await getWeather("Tokyo");
    expect(r.ok).toBe(true);
    expect(r.summary).toContain("21");
    expect(r.summary).toContain("overcast");
    expect(r.summary).toMatch(/tokyo/i);
    // 3-day outlook plus the fixed header rows.
    expect(r.meta!.length).toBeGreaterThanOrEqual(7);
    expect(r.meta!.join("\n")).toContain("62%");
  });

  it("skips geocoding when coordinates are supplied", async () => {
    const f = vi.fn(() => json(forecast));
    vi.stubGlobal("fetch", f);

    const r = await getWeather("here", { lat: 9.08, lon: 36.55 });
    expect(r.ok).toBe(true);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it("reports an unknown place rather than guessing", async () => {
    vi.stubGlobal("fetch", vi.fn(() => json({ results: [] })));
    const r = await getWeather("Zzzyxville");
    expect(r.ok).toBe(false);
    expect(r.summary).toMatch(/could not find/i);
  });

  it("survives a network failure in character", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("ECONNREFUSED"))));
    const r = await getWeather("Tokyo");
    expect(r.ok).toBe(false);
    expect(r.summary).toMatch(/sir/);
  });
});

describe("knowledge lookup", () => {
  it("uses the Wikipedia summary and speaks only the opening", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        json({
          title: "Nikola Tesla",
          description: "Serbian-American engineer",
          extract:
            "Nikola Tesla was a Serbian-American inventor. He is known for the AC electricity supply system. He held around 300 patents.",
          content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Nikola_Tesla" } },
        }),
      ),
    );

    const r = await lookup("Nikola Tesla");
    expect(r.ok).toBe(true);
    // Two sentences spoken, not the whole article.
    expect(r.summary).toContain("Serbian-American inventor");
    expect(r.summary).not.toContain("300 patents");
    expect(r.meta!.join("\n")).toContain("300 patents");
  });

  it("falls back to search when there is no exact page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("rest_v1")) return json({}, false);
        if (url.includes("duckduckgo")) return json({}, false);
        return json({
          query: { search: [{ title: "Vibranium", snippet: "A <b>fictional</b> metal" }] },
        });
      }),
    );

    const r = await lookup("vibranium");
    expect(r.ok).toBe(true);
    expect(r.meta!.join()).toContain("Vibranium");
    // HTML is stripped before it reaches the HUD.
    expect(r.meta!.join()).not.toContain("<b>");
  });

  it("ignores disambiguation pages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        url.includes("rest_v1")
          ? json({ title: "Blort", extract: "Blort may refer to", type: "disambiguation" })
          : json({}, false),
      ),
    );
    // "mercury" would now be answered offline by the astronomy core, so this
    // uses a term no offline provider claims.
    const r = await lookup("blort");
    expect(r.ok).toBe(false);
  });

  it("prefers the offline core over the network for known facts", async () => {
    const f = vi.fn(() => json({}, false));
    vi.stubGlobal("fetch", f);

    const r = await lookup("mercury");
    expect(r.ok).toBe(true);
    expect(r.summary).toMatch(/terrestrial planet/);
    // Answered entirely from the embedded knowledge core.
    expect(f).not.toHaveBeenCalled();
  });

  it("requires a query", async () => {
    const r = await lookup("   ");
    expect(r.ok).toBe(false);
  });
});
