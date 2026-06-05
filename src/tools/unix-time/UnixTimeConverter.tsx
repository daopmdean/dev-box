import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Field from "../../components/ui/Field";
import CopyButton from "../../components/ui/CopyButton";
import {
  describe,
  parseEpoch,
  toDatetimeLocal,
  type TimeParts,
} from "../../lib/unixtime";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-2">
      <span className="text-sm text-white/50">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-white/90">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
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

  // Live clock for the current epoch.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parsed: TimeParts | null = useMemo(() => {
    const date = parseEpoch(epochInput);
    return date ? describe(date) : null;
  }, [epochInput]);

  const fromDate = useMemo(() => {
    const d = new Date(dateInput);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [dateInput]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-4 py-3">
        <span className="text-sm text-white/50">Current epoch (seconds)</span>
        <span className="font-mono text-lg text-sky-300">
          {Math.floor(now / 1000)}
        </span>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-white/90">
          Epoch → Human
        </h3>
        <div className="flex items-end gap-3">
          <Field label="Epoch (seconds or milliseconds)" hint="Auto-detects s vs ms">
            <Input
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value)}
              className="w-72 font-mono"
              placeholder="1700000000"
            />
          </Field>
          <Button
            onClick={() => setEpochInput(String(Math.floor(Date.now() / 1000)))}
          >
            Now
          </Button>
        </div>
        {epochInput && !parsed && (
          <p className="text-sm text-red-300">Not a valid epoch timestamp.</p>
        )}
        {parsed && (
          <div className="rounded-md border border-white/10 bg-black/20 px-4">
            <Row label="Local" value={parsed.local} />
            <Row label="UTC" value={parsed.utc} />
            <Row label="ISO 8601" value={parsed.iso} />
            <Row label="Relative" value={parsed.relative} />
            <Row label="Seconds" value={String(parsed.epochSeconds)} />
            <Row label="Milliseconds" value={String(parsed.epochMillis)} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-white/90">
          Human → Epoch
        </h3>
        <Field label="Date & time (local)">
          <Input
            type="datetime-local"
            step={1}
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-72"
          />
        </Field>
        {fromDate && (
          <div className="rounded-md border border-white/10 bg-black/20 px-4">
            <Row
              label="Seconds"
              value={String(Math.floor(fromDate.getTime() / 1000))}
            />
            <Row label="Milliseconds" value={String(fromDate.getTime())} />
            <Row label="ISO 8601" value={fromDate.toISOString()} />
          </div>
        )}
      </section>
    </div>
  );
}
