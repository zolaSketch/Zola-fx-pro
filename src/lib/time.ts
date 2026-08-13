/** Ethiopia (EAT, UTC+3) is the clock Dega thinks in. */

const TZ = "Africa/Addis_Ababa";

export function eatNow(date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return new Date(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
}

export function eatHour(date = new Date()): number {
  const d = eatNow(date);
  return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
}

export function formatEat(date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function formatEatLong(date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function hourLabel(h: number): string {
  const hh = Math.floor(h) % 24;
  const mm = Math.round((h - Math.floor(h)) * 60) % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
