import { useMemo, useState } from "react";
import TextArea from "../../components/ui/TextArea";
import { decodeBase64, encodeBase64 } from "../../lib/base64";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      const out =
        mode === "encode"
          ? encodeBase64(input, urlSafe)
          : decodeBase64(input, urlSafe);
      return { output: out, error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode, urlSafe]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="inline-flex rounded-md bg-white/5 p-1">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-sm capitalize transition-colors ${
                mode === m ? "bg-sky-500 text-white" : "text-white/60"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
          />
          URL-safe
        </label>
      </div>

      <TextArea
        label={mode === "encode" ? "Plain text" : "Base64"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === "encode" ? "Type text to encode…" : "Paste Base64…"}
      />

      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : (
        <TextArea
          label={mode === "encode" ? "Base64" : "Plain text"}
          value={output}
          readOnly
          copyable
          placeholder="Output…"
        />
      )}
    </div>
  );
}
