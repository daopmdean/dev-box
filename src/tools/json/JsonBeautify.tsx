import { useMemo, useState } from "react";
import TextArea from "../../components/ui/TextArea";
import Button from "../../components/ui/Button";
import { beautifyJson, minifyJson, type IndentOption } from "../../lib/json";

export default function JsonBeautify() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);
  const [minified, setMinified] = useState(false);

  const result = useMemo(
    () => (minified ? minifyJson(input) : beautifyJson(input, indent)),
    [input, indent, minified],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/70">Indent</span>
        <div className="inline-flex rounded-md bg-white/5 p-1">
          {([2, 4, "tab"] as IndentOption[]).map((opt) => (
            <button
              key={String(opt)}
              onClick={() => {
                setIndent(opt);
                setMinified(false);
              }}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                !minified && indent === opt
                  ? "bg-sky-500 text-white"
                  : "text-white/60"
              }`}
            >
              {opt === "tab" ? "Tab" : `${opt} spaces`}
            </button>
          ))}
        </div>
        <Button onClick={() => setMinified(true)} variant="secondary">
          Minify
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextArea
          label="Input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"paste":"your json here"}'
          className="min-h-[24rem]"
        />
        {result.ok ? (
          <TextArea
            label="Formatted"
            value={result.output}
            readOnly
            copyable
            className="min-h-[24rem]"
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-white/70">Formatted</span>
            <div className="min-h-[24rem] rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {result.error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
