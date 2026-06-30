import { useMemo, useState } from "react";
import TextArea from "../../components/ui/TextArea";

type Mode = "encode" | "decode";

export default function UrlEncoderTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      const out =
        mode === "encode"
          ? encodeURIComponent(input)
          : decodeURIComponent(input);
      return { output: out, error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="inline-flex rounded-md bg-black/5 dark:bg-white/5 p-1">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-sm capitalize transition-colors ${
                mode === m ? "bg-sky-500 text-white" : "text-gray-500 dark:text-white/60"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <TextArea
        label={mode === "encode" ? "Plain text" : "URL Encoded"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "Type text to encode…" : "Paste URL encoded text…"}
      />

      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : (
        <TextArea
          label={mode === "encode" ? "URL Encoded" : "Plain text"}
          value={output}
          readOnly
          copyable
          placeholder="Output…"
        />
      )}
    </div>
  );
}
