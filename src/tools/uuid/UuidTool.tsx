import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Field from "../../components/ui/Field";
import TextArea from "../../components/ui/TextArea";
import CopyButton from "../../components/ui/CopyButton";
import { randomString, uuidV4Bulk, type Charset } from "../../lib/random";

const CHARSETS: Charset[] = ["alphanumeric", "alpha", "hex", "numeric", "base64"];

export default function UuidTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>(() => uuidV4Bulk(5));

  const [length, setLength] = useState(32);
  const [charset, setCharset] = useState<Charset>("alphanumeric");
  const [randomStr, setRandomStr] = useState(() => randomString(32, "alphanumeric"));

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-white/90">UUID v4</h3>
        <div className="flex items-end gap-3">
          <Field label="Count">
            <Input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24"
            />
          </Field>
          <Button
            variant="primary"
            onClick={() => setUuids(uuidV4Bulk(Math.min(1000, Math.max(1, count))))}
          >
            Generate
          </Button>
        </div>
        <TextArea
          value={uuids.join("\n")}
          readOnly
          copyable
          className="min-h-[10rem]"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-white/90">Random string</h3>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Length">
            <Input
              type="number"
              min={1}
              max={4096}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-24"
            />
          </Field>
          <Field label="Charset">
            <select
              value={charset}
              onChange={(e) => setCharset(e.target.value as Charset)}
              className="rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white/90 outline-none focus:border-sky-500/60"
            >
              {CHARSETS.map((c) => (
                <option key={c} value={c} className="bg-[#0b0d11]">
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Button
            variant="primary"
            onClick={() =>
              setRandomStr(randomString(Math.max(1, length), charset))
            }
          >
            Generate
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Input value={randomStr} readOnly className="flex-1 font-mono" />
          <CopyButton value={randomStr} />
        </div>
      </section>
    </div>
  );
}
