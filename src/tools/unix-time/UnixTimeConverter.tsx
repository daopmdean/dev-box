import { useEffect, useMemo, useState } from "react";
import Input from "../../components/ui/Input";
import CopyButton from "../../components/ui/CopyButton";
import {
  describe,
  parseEpoch,
  secondsToDuration,
  toDatetimeLocal,
  type DurationParts,
  type TimeParts,
} from "../../lib/unixtime";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 py-2.5 last:border-0">
      <span className="text-sm text-gray-500 dark:text-white/40">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-gray-900 dark:text-white/90">{value}</span>
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

export default function UnixTimeConverter() {
  const [now, setNow] = useState(() => Date.now());
  const [epochInput, setEpochInput] = useState(() =>
    String(Math.floor(Date.now() / 1000)),
  );
  const [dateInput, setDateInput] = useState(() =>
    toDatetimeLocal(new Date()),
  );

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parsed: TimeParts | null = useMemo(() => {
    const date = parseEpoch(epochInput);
    return date ? describe(date) : null;
  }, [epochInput]);

  const [durationInput, setDurationInput] = useState("");

  const fromDate = useMemo(() => {
    const d = new Date(dateInput);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [dateInput]);

  const duration: DurationParts | null = useMemo(() => {
    const trimmed = durationInput.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? secondsToDuration(num) : null;
  }, [durationInput]);

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Live clock */}
      <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black/30 px-5 py-4">
        <span className="text-sm text-gray-500 dark:text-white/40">Current epoch</span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl font-semibold tabular-nums text-sky-600 dark:text-sky-400">
            {Math.floor(now / 1000)}
          </span>
          <span className="text-xs text-gray-400 dark:text-white/30">s</span>
        </div>
      </div>

      {/* Epoch → Human */}
      <section className="flex flex-col gap-3">
        <SectionLabel>Epoch → Human</SectionLabel>

        {/* Input group: epoch input + Now button share one border */}
        <div className="flex overflow-hidden rounded-lg border border-black/10 dark:border-white/10 focus-within:border-sky-500/50 transition-colors">
          <input
            spellCheck={false}
            value={epochInput}
            onChange={(e) => setEpochInput(e.target.value)}
            placeholder="1700000000"
            className="flex-1 min-w-0 bg-white dark:bg-black/30 px-3 py-2 text-sm font-mono text-gray-900 dark:text-white/90 outline-none placeholder:text-gray-400 dark:placeholder:text-white/20"
          />
          <button
            onClick={() => setEpochInput(String(Math.floor(Date.now() / 1000)))}
            className="shrink-0 border-l border-black/10 dark:border-white/10 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 px-3 text-sm font-medium text-gray-600 dark:text-white/50 transition-colors"
          >
            Now
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-white/30">Auto-detects seconds vs milliseconds</p>

        {epochInput && !parsed && (
          <p className="text-sm text-red-400 dark:text-red-300">Not a valid epoch timestamp.</p>
        )}
        {parsed && (
          <div className="rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black/20 px-4">
            <Row label="Local" value={parsed.local} />
            <Row label="UTC" value={parsed.utc} />
            <Row label="ISO 8601" value={parsed.iso} />
            <Row label="Relative" value={parsed.relative} />
            <Row label="Seconds" value={String(parsed.epochSeconds)} />
            <Row label="Milliseconds" value={String(parsed.epochMillis)} />
          </div>
        )}
      </section>

      {/* Human → Epoch */}
      <section className="flex flex-col gap-3">
        <SectionLabel>Human → Epoch</SectionLabel>
        <Input
          type="datetime-local"
          step={1}
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-72"
        />
        {fromDate && (
          <div className="rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black/20 px-4">
            <Row label="Seconds" value={String(Math.floor(fromDate.getTime() / 1000))} />
            <Row label="Milliseconds" value={String(fromDate.getTime())} />
            <Row label="ISO 8601" value={fromDate.toISOString()} />
          </div>
        )}
      </section>

      {/* Seconds → Duration */}
      <section className="flex flex-col gap-3">
        <SectionLabel>Seconds → Duration</SectionLabel>
        <div className="flex overflow-hidden rounded-lg border border-black/10 dark:border-white/10 focus-within:border-sky-500/50 transition-colors">
          <input
            spellCheck={false}
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            placeholder="86400"
            className="flex-1 min-w-0 bg-white dark:bg-black/30 px-3 py-2 text-sm font-mono text-gray-900 dark:text-white/90 outline-none placeholder:text-gray-400 dark:placeholder:text-white/20"
          />
        </div>
        {durationInput && !duration && (
          <p className="text-sm text-red-400 dark:text-red-300">Not a valid number.</p>
        )}
        {duration && (
          <div className="rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black/20 px-4">
            <Row label="Years" value={String(duration.years)} />
            <Row label="Months" value={String(duration.months)} />
            <Row label="Days" value={String(duration.days)} />
            <Row label="Hours" value={String(duration.hours)} />
            <Row label="Minutes" value={String(duration.minutes)} />
            <Row label="Seconds" value={String(duration.seconds)} />
          </div>
        )}
      </section>
    </div>
  );
}
