import { useEffect, useState, useMemo, useRef } from "react";
import TextArea from "../../components/ui/TextArea";
import Input from "../../components/ui/Input";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import CopyButton from "../../components/ui/CopyButton";
import { generateHashes, type HashResults } from "../../lib/hash";

type Tab = "text" | "file";

const AUTO_CALCULATE_LIMIT = 10 * 1024 * 1024; // 10 MB

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function HashGenerator() {
  const [tab, setTab] = useState<Tab>("text");
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<HashResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [compareHash, setCompareHash] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset hashes when inputs change
  useEffect(() => {
    if (tab === "text") {
      setFile(null);
      if (!textInput) {
        setHashes(null);
        return;
      }
      setLoading(true);
      const timer = setTimeout(() => {
        generateHashes(textInput)
          .then((res) => setHashes(res))
          .catch(() => setHashes(null))
          .finally(() => setLoading(false));
      }, 200); // Small debounce to avoid blocking typing thread
      return () => clearTimeout(timer);
    } else {
      // File mode
      // Reset hashes and comparisons if file is cleared
      if (!file) {
        setHashes(null);
      }
    }
  }, [textInput, file, tab]);

  // Handle file reading and hash generation
  const computeFileHashes = async (selectedFile: File) => {
    setLoading(true);
    setHashes(null);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const res = await generateHashes(bytes);
      setHashes(res);
    } catch (err) {
      console.error("Error generating hashes for file:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (selected.size <= AUTO_CALCULATE_LIMIT) {
        computeFileHashes(selected);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected) {
      setFile(selected);
      if (selected.size <= AUTO_CALCULATE_LIMIT) {
        computeFileHashes(selected);
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setHashes(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Format hash output based on uppercase setting
  const formatHash = (hash: string) => {
    return uppercase ? hash.toUpperCase() : hash.toLowerCase();
  };

  // Normalized compare hash
  const cleanCompare = useMemo(() => {
    return compareHash.trim().toLowerCase();
  }, [compareHash]);

  // Check matching hashes
  const matchResult = useMemo(() => {
    if (!hashes || !cleanCompare) return null;
    const matchAlgorithms = Object.entries(hashes).filter(
      ([_, val]) => val.toLowerCase() === cleanCompare
    );
    if (matchAlgorithms.length > 0) {
      return {
        matched: true,
        algorithm: matchAlgorithms[0][0].toUpperCase(),
      };
    }
    // Check if compare hash length matches a standard hash but doesn't equal any values
    const hashLengths = [32, 40, 64, 96, 128];
    if (hashLengths.includes(cleanCompare.length)) {
      return {
        matched: false,
      };
    }
    return null;
  }, [hashes, cleanCompare]);

  return (
    <div className="flex flex-col gap-5">
      {/* Modes & General Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-md bg-black/5 dark:bg-white/5 p-1">
          {(["text", "file"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-sky-500 text-white" : "text-gray-500 dark:text-white/60"
              }`}
            >
              {t} Input
            </button>
          ))}
        </div>

        {hashes && (
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white/70 select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded text-sky-500 focus:ring-sky-500 border-black/10 dark:border-white/10 dark:bg-black/30"
            />
            Uppercase Hashes
          </label>
        )}
      </div>

      {/* Main Inputs */}
      {tab === "text" ? (
        <TextArea
          label="Plain Text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type or paste text here to generate hashes…"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[10rem] ${
              isDragOver
                ? "border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 scale-[0.99]"
                : "border-black/10 dark:border-white/10 hover:border-sky-500/60 hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
            }`}
          >
            <svg
              className="w-10 height-10 text-gray-400 dark:text-white/40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            <div>
              <span className="font-medium text-sky-500 dark:text-sky-400">Click to upload</span>{" "}
              <span className="text-gray-500 dark:text-white/50">or drag and drop a file</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-white/30">
              Files up to 10MB will be calculated automatically. All hashing runs locally.
            </p>
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-md border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 px-4 py-3 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-white/90 truncate max-w-md">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-white/40">
                  {formatSize(file.size)} &bull; {file.type || "unknown type"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {file.size > AUTO_CALCULATE_LIMIT && !hashes && !loading && (
                  <Button variant="primary" onClick={() => computeFileHashes(file)}>
                    Calculate Hashes
                  </Button>
                )}
                <button
                  onClick={clearFile}
                  className="rounded px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Clear File
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm text-gray-500 dark:text-white/50">Computing hashes…</span>
        </div>
      )}

      {/* Hash Results List */}
      {hashes && !loading && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">
              Generated Hashes
            </h3>
            <div className="flex flex-col gap-4">
              {(Object.keys(hashes) as Array<keyof HashResults>).map((key) => {
                const isMatched = matchResult?.matched && matchResult.algorithm && matchResult.algorithm.toLowerCase() === key;
                return (
                  <div
                    key={key}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-3 last:border-0 last:pb-0 transition-colors rounded-md p-1.5 ${
                      isMatched
                        ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300"
                        : ""
                    }`}
                  >
                    <div className="shrink-0 md:w-24">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/55">
                        {key}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-sm break-all select-all block text-gray-800 dark:text-white/90">
                        {formatHash(hashes[key])}
                      </span>
                    </div>
                    <div className="shrink-0 flex items-center justify-end">
                      <CopyButton value={formatHash(hashes[key])} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hash Compare Utility */}
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 p-4">
            <Field
              label="Verify / Compare Hash"
              hint="Paste a known hash (MD5, SHA-1, SHA-256, SHA-384, or SHA-512) to compare with the generated results."
            >
              <Input
                value={compareHash}
                onChange={(e) => setCompareHash(e.target.value)}
                placeholder="Paste expected checksum here…"
                className="w-full font-mono text-sm"
              />
            </Field>

            {/* Compare Results Alert */}
            {matchResult !== null && (
              <div className="mt-3">
                {matchResult.matched ? (
                  <div className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      Match found! Checksum matches calculated <strong>{matchResult.algorithm}</strong> hash.
                    </span>
                  </div>
                ) : (
                  <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Checksum mismatch. No match found for the entered length.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
