export interface TimeParts {
  epochSeconds: number;
  epochMillis: number;
  local: string;
  utc: string;
  iso: string;
  relative: string;
}

/**
 * Parse a raw epoch input. Auto-detects seconds vs milliseconds: values with
 * 13+ digits are treated as milliseconds, otherwise seconds.
 */
export function parseEpoch(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  const millis = Math.abs(num) >= 1e12 ? num : num * 1000;
  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function relativeFromNow(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000000],
    ["month", 2592000000],
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
    ["second", 1000],
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second") {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return "now";
}

export function describe(date: Date, now: Date = new Date()): TimeParts {
  return {
    epochSeconds: Math.floor(date.getTime() / 1000),
    epochMillis: date.getTime(),
    local: date.toLocaleString(),
    utc: date.toUTCString(),
    iso: date.toISOString(),
    relative: relativeFromNow(date, now),
  };
}

export interface DurationParts {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function secondsToDuration(totalSeconds: number): DurationParts {
  const abs = Math.floor(Math.abs(totalSeconds));
  const years = Math.floor(abs / 31536000);
  const months = Math.floor((abs % 31536000) / 2592000);
  const days = Math.floor((abs % 2592000) / 86400);
  const hours = Math.floor((abs % 86400) / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  return { years, months, days, hours, minutes, seconds };
}

/** Format a Date for a `datetime-local` input (in local time). */
export function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
