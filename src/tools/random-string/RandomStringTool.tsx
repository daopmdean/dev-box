import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Field from "../../components/ui/Field";
import CopyButton from "../../components/ui/CopyButton";
import { randomString, type Charset } from "../../lib/random";

const CHARSETS: Charset[] = ["alphanumeric", "alpha", "hex", "numeric", "base64"];

export default function RandomStringTool() {
  const [length, setLength] = useState(32);
  const [charset, setCharset] = useState<Charset>("alphanumeric");
  const [randomStr, setRandomStr] = useState(() => randomString(32, "alphanumeric"));

  return (
    <div className="flex flex-col gap-3">
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
            className="rounded-md border border-black/10 bg-white text-gray-900 px-3 py-1.5 text-sm outline-none focus:border-sky-500/60 dark:border-white/10 dark:bg-black/30 dark:text-white/90"
          >
            {CHARSETS.map((c) => (
              <option key={c} value={c} className="dark:bg-[#0b0d11]">
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Button
          variant="primary"
          onClick={() => setRandomStr(randomString(Math.max(1, length), charset))}
        >
          Generate
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Input value={randomStr} readOnly className="flex-1 font-mono" />
        <CopyButton value={randomStr} />
      </div>
    </div>
  );
}
