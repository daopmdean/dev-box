export type TimeUnit =
  | "ns"
  | "us"
  | "ms"
  | "s"
  | "min"
  | "h"
  | "d"
  | "wk"
  | "mo"
  | "yr";

export interface TimeUnitMeta {
  id: TimeUnit;
  label: string;
  shortLabel: string;
  /** Factor in seconds (1 unit = factor seconds) */
  toSeconds: number;
}

export const TIME_UNITS: TimeUnitMeta[] = [
  { id: "ns", label: "Nanoseconds", shortLabel: "ns", toSeconds: 1e-9 },
  { id: "us", label: "Microseconds", shortLabel: "μs", toSeconds: 1e-6 },
  { id: "ms", label: "Milliseconds", shortLabel: "ms", toSeconds: 1e-3 },
  { id: "s", label: "Seconds", shortLabel: "s", toSeconds: 1 },
  { id: "min", label: "Minutes", shortLabel: "min", toSeconds: 60 },
  { id: "h", label: "Hours", shortLabel: "h", toSeconds: 3600 },
  { id: "d", label: "Days", shortLabel: "d", toSeconds: 86400 },
  { id: "wk", label: "Weeks", shortLabel: "wk", toSeconds: 604800 },
  { id: "mo", label: "Months (30d)", shortLabel: "mo", toSeconds: 2592000 },
  { id: "yr", label: "Years (365d)", shortLabel: "yr", toSeconds: 31536000 },
];

const UNIT_MAP: Record<TimeUnit, TimeUnitMeta> = Object.fromEntries(
  TIME_UNITS.map((u) => [u.id, u]),
) as Record<TimeUnit, TimeUnitMeta>;

/**
 * Convert a value from one time unit to another.
 */
export function convertTimeUnit(
  value: number,
  from: TimeUnit,
  to: TimeUnit,
): number {
  if (!Number.isFinite(value)) return NaN;
  if (from === to) return value;
  const seconds = value * UNIT_MAP[from].toSeconds;
  return seconds / UNIT_MAP[to].toSeconds;
}

/**
 * Convert a value in a given unit to all supported time units.
 */
export function convertToAllUnits(
  value: number,
  from: TimeUnit,
): Record<TimeUnit, number> {
  const result = {} as Record<TimeUnit, number>;
  for (const unit of TIME_UNITS) {
    result[unit.id] = convertTimeUnit(value, from, unit.id);
  }
  return result;
}

/**
 * Format a converted numeric value cleanly without floating-point noise.
 */
export function formatTimeValue(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e15 || (abs > 0 && abs < 1e-6)) {
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }
  return String(Number(value.toPrecision(12)));
}

/**
 * Format a duration in seconds as a human-readable compound string (e.g. "1d 2h 30m 15s").
 */
export function formatCompoundDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return "—";
  if (totalSeconds === 0) return "0s";

  const sign = totalSeconds < 0 ? "-" : "";
  let remainingMs = Math.round(Math.abs(totalSeconds) * 1000);

  if (remainingMs === 0) {
    const ns = Math.round(Math.abs(totalSeconds) * 1e9);
    return `${sign}${ns}ns`;
  }

  const units: [string, number][] = [
    ["y", 31536000 * 1000],
    ["d", 86400 * 1000],
    ["h", 3600 * 1000],
    ["m", 60 * 1000],
    ["s", 1000],
    ["ms", 1],
  ];

  const parts: string[] = [];
  for (const [label, unitMs] of units) {
    if (remainingMs >= unitMs) {
      const count = Math.floor(remainingMs / unitMs);
      remainingMs %= unitMs;
      parts.push(`${count}${label}`);
    }
  }

  return sign + parts.join(" ");
}
