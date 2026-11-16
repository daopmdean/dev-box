import { useMemo, useState } from "react";
import CopyButton from "../../components/ui/CopyButton";
import {
  TIME_UNITS,
  convertToAllUnits,
  formatCompoundDuration,
  formatTimeValue,
  type TimeUnit,
} from "../../lib/time-unit";

function Row({
  label,
  shortLabel,
  value,
  highlight,
}: {
  label: string;
  shortLabel: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 py-2.5 last:border-0 ${
        highlight ? "bg-sky-500/5 -mx-4 px-4" : ""
      }`}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-gray-700 dark:text-white/70">{label}</span>
        <span className="text-xs font-mono text-gray-400 dark:text-white/30">
          ({shortLabel})
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-gray-900 dark:text-white/90">
          {value}
        </span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30">
      {children}
    </h3>
  );
}

export default function TimeUnitTool() {
  const [inputValue, setInputValue] = useState("1");
  const [selectedUnit, setSelectedUnit] = useState<TimeUnit>("h");

  const numericValue = useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }, [inputValue]);

  const converted = useMemo(() => {
    if (numericValue === null) return null;
    return convertToAllUnits(numericValue, selectedUnit);
  }, [numericValue, selectedUnit]);

  const compound = useMemo(() => {
    if (!converted) return null;
    return formatCompoundDuration(converted.s);
  }, [converted]);

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Input section */}
      <section className="flex flex-col gap-3">
        <SectionLabel>Input Time</SectionLabel>

        <div className="flex overflow-hidden rounded-lg border border-black/10 dark:border-white/10 focus-within:border-sky-500/50 transition-colors">
          <input
            type="text"
            inputMode="decimal"
            spellCheck={false}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value..."
            className="flex-1 min-w-0 bg-white dark:bg-black/30 px-3 py-2 text-sm font-mono text-gray-900 dark:text-white/90 outline-none placeholder:text-gray-400 dark:placeholder:text-white/20"
          />
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value as TimeUnit)}
            aria-label="Time unit"
            className="shrink-0 border-l border-black/10 dark:border-white/10 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 px-3 py-2 text-sm font-medium text-gray-700 dark:text-white/80 outline-none transition-colors cursor-pointer"
          >
            {TIME_UNITS.map((u) => (
              <option key={u.id} value={u.id} className="bg-white dark:bg-neutral-900">
                {u.label} ({u.shortLabel})
              </option>
            ))}
          </select>
        </div>

        {/* Quick unit pills */}
        <div className="flex flex-wrap gap-1.5">
          {TIME_UNITS.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelectedUnit(u.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
                selectedUnit === u.id
                  ? "bg-sky-500 text-white"
                  : "bg-black/5 hover:bg-black/10 text-gray-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60"
              }`}
            >
              {u.shortLabel}
            </button>
          ))}
        </div>

        {inputValue.trim() !== "" && numericValue === null && (
          <p className="text-sm text-red-400 dark:text-red-300">
            Not a valid number.
          </p>
        )}
      </section>

      {/* Human-readable breakdown */}
      {compound && (
        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black/30 px-5 py-3.5">
          <span className="text-sm text-gray-500 dark:text-white/40">
            Breakdown
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-semibold text-sky-600 dark:text-sky-400">
              {compound}
            </span>
            <CopyButton value={compound} />
          </div>
        </div>
      )}

      {/* Converted units list */}
      {converted && (
        <section className="flex flex-col gap-3">
          <SectionLabel>Converted Units</SectionLabel>
          <div className="rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black/20 px-4 overflow-hidden">
            {TIME_UNITS.map((u) => (
              <Row
                key={u.id}
                label={u.label}
                shortLabel={u.shortLabel}
                value={formatTimeValue(converted[u.id])}
                highlight={u.id === selectedUnit}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
