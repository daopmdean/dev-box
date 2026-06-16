import { useMemo, useState } from "react";
import TextArea from "../../components/ui/TextArea";
import Button from "../../components/ui/Button";
import { diffLines, diffWords, diffChars } from "../../lib/diff";
import type { DiffChange } from "../../lib/diff";

type DiffLevel = "line" | "word" | "char";
type ViewMode = "split" | "unified";

const SAMPLE_ORIGINAL = `function calculateTotal(items, tax) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  
  // Calculate tax
  const taxAmount = total * tax;
  return total + taxAmount;
}`;

const SAMPLE_MODIFIED = `function calculateTotal(items, taxRate) {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  
  // Apply tax rate
  const taxAmount = total * (taxRate / 100);
  return total + taxAmount;
}`;

interface AlignedRow {
  left: {
    type: "common" | "removed" | "empty";
    value: string;
    lineNum: number | string;
  };
  right: {
    type: "common" | "added" | "empty";
    value: string;
    lineNum: number | string;
  };
}

function getAlignedRows(changes: DiffChange[]): AlignedRow[] {
  const rows: AlignedRow[] = [];
  let leftLineNum = 1;
  let rightLineNum = 1;

  let removedQueue: { value: string; lineNum: number }[] = [];
  let addedQueue: { value: string; lineNum: number }[] = [];

  const flushQueues = () => {
    const maxLen = Math.max(removedQueue.length, addedQueue.length);
    for (let k = 0; k < maxLen; k++) {
      const removed = removedQueue[k];
      const added = addedQueue[k];

      rows.push({
        left: removed
          ? { type: "removed", value: removed.value, lineNum: removed.lineNum }
          : { type: "empty", value: "", lineNum: "" },
        right: added
          ? { type: "added", value: added.value, lineNum: added.lineNum }
          : { type: "empty", value: "", lineNum: "" },
      });
    }
    removedQueue = [];
    addedQueue = [];
  };

  for (const change of changes) {
    if (change.type === "common") {
      flushQueues();
      rows.push({
        left: { type: "common", value: change.value, lineNum: leftLineNum++ },
        right: { type: "common", value: change.value, lineNum: rightLineNum++ },
      });
    } else if (change.type === "removed") {
      removedQueue.push({ value: change.value, lineNum: leftLineNum++ });
    } else if (change.type === "added") {
      addedQueue.push({ value: change.value, lineNum: rightLineNum++ });
    }
  }
  flushQueues();

  return rows;
}

function LineContent({
  text,
  type,
  otherText,
}: {
  text: string;
  type: "added" | "removed" | "common" | "empty";
  otherText?: string;
}) {
  if (type === "empty") return <span className="opacity-0"> </span>;
  if (!otherText || type === "common" || !text.trim()) {
    return <span>{text}</span>;
  }

  // Generate word-level inline diffs
  const wordDiff = type === "removed" ? diffWords(text, otherText) : diffWords(otherText, text);

  return (
    <>
      {wordDiff.map((part, index) => {
        if (part.type === "common") {
          return <span key={index}>{part.value}</span>;
        }
        if (type === "removed" && part.type === "removed") {
          return (
            <mark
              key={index}
              className="bg-red-400/40 text-red-950 dark:bg-red-500/30 dark:text-red-100 rounded-sm font-semibold px-0.5"
            >
              {part.value}
            </mark>
          );
        }
        if (type === "added" && part.type === "added") {
          return (
            <mark
              key={index}
              className="bg-green-400/45 text-green-950 dark:bg-green-500/35 dark:text-green-100 rounded-sm font-semibold px-0.5"
            >
              {part.value}
            </mark>
          );
        }
        return null;
      })}
    </>
  );
}

export default function DiffTool() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diffLevel, setDiffLevel] = useState<DiffLevel>("line");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [caseInsensitive, setCaseInsensitive] = useState(false);

  const changes = useMemo(() => {
    const opts = { ignoreWhitespace, caseInsensitive };
    if (diffLevel === "word") {
      return diffWords(original, modified, opts);
    }
    if (diffLevel === "char") {
      return diffChars(original, modified, opts);
    }
    return diffLines(original, modified, opts);
  }, [original, modified, diffLevel, ignoreWhitespace, caseInsensitive]);

  const alignedRows = useMemo(() => {
    if (diffLevel !== "line") return [];
    return getAlignedRows(changes);
  }, [changes, diffLevel]);

  const loadSample = () => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
  };

  const clearAll = () => {
    setOriginal("");
    setModified("");
  };

  // Styles helpers
  const getBgColor = (type: "added" | "removed" | "common" | "empty") => {
    switch (type) {
      case "added":
        return "bg-green-500/10 dark:bg-green-500/15";
      case "removed":
        return "bg-red-500/10 dark:bg-red-500/15";
      case "empty":
        return "bg-gray-500/5 dark:bg-white/5 opacity-50";
      default:
        return "";
    }
  };

  const getTextColor = (type: "added" | "removed" | "common" | "empty") => {
    switch (type) {
      case "added":
        return "text-green-800 dark:text-green-300";
      case "removed":
        return "text-red-800 dark:text-red-300";
      case "empty":
        return "text-gray-400 dark:text-gray-600";
      default:
        return "text-gray-800 dark:text-gray-200";
    }
  };

  // Render Helpers
  const renderLineDiff = () => {
    if (viewMode === "split") {
      return (
        <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-black/20">
          {/* Header */}
          <div className="grid grid-cols-2 text-xs font-semibold text-gray-500 dark:text-white/60 bg-gray-50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 divide-x divide-black/10 dark:divide-white/10">
            <div className="px-4 py-2">Original Text</div>
            <div className="px-4 py-2">Modified Text</div>
          </div>
          {/* Body */}
          <div className="flex flex-col font-mono text-xs divide-y divide-black/5 dark:divide-white/5 max-h-[32rem] overflow-y-auto">
            {alignedRows.length === 0 ? (
              <div className="p-8 text-center text-gray-400 dark:text-gray-500 italic">
                No differences to display. Enter text above to compare.
              </div>
            ) : (
              alignedRows.map((row, idx) => (
                <div key={idx} className="flex min-w-0 hover:bg-black/5 dark:hover:bg-white/5 divide-x divide-black/10 dark:divide-white/10">
                  {/* Left Cell */}
                  <div className={`flex-1 min-w-0 flex items-stretch ${getBgColor(row.left.type)}`}>
                    <span className="w-10 select-none text-right text-gray-400 dark:text-gray-500 pr-2 py-1 border-r border-black/5 dark:border-white/5 bg-black/[2%] dark:bg-white/[2%]">
                      {row.left.lineNum}
                    </span>
                    <span className="w-6 select-none flex justify-center items-center text-red-500 font-bold">
                      {row.left.type === "removed" ? "-" : ""}
                    </span>
                    <pre className={`flex-1 px-2 py-1 whitespace-pre-wrap break-all ${getTextColor(row.left.type)}`}>
                      <LineContent
                        text={row.left.value}
                        type={row.left.type}
                        otherText={row.right.type === "added" ? row.right.value : undefined}
                      />
                    </pre>
                  </div>

                  {/* Right Cell */}
                  <div className={`flex-1 min-w-0 flex items-stretch ${getBgColor(row.right.type)}`}>
                    <span className="w-10 select-none text-right text-gray-400 dark:text-gray-500 pr-2 py-1 border-r border-black/5 dark:border-white/5 bg-black/[2%] dark:bg-white/[2%]">
                      {row.right.lineNum}
                    </span>
                    <span className="w-6 select-none flex justify-center items-center text-green-500 font-bold">
                      {row.right.type === "added" ? "+" : ""}
                    </span>
                    <pre className={`flex-1 px-2 py-1 whitespace-pre-wrap break-all ${getTextColor(row.right.type)}`}>
                      <LineContent
                        text={row.right.value}
                        type={row.right.type}
                        otherText={row.left.type === "removed" ? row.left.value : undefined}
                      />
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // Unified view
    let leftLineNum = 1;
    let rightLineNum = 1;

    return (
      <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-black/20">
        <div className="font-mono text-xs flex flex-col divide-y divide-black/5 dark:divide-white/5 max-h-[32rem] overflow-y-auto">
          {changes.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 italic">
              No differences to display. Enter text above to compare.
            </div>
          ) : (
            changes.map((change, idx) => {
              const type = change.type;
              const isAdded = type === "added";
              const isRemoved = type === "removed";
              const isCommon = type === "common";

              const oldNum = isCommon || isRemoved ? leftLineNum++ : "";
              const newNum = isCommon || isAdded ? rightLineNum++ : "";
              const sign = isAdded ? "+" : isRemoved ? "-" : " ";

              // For inline word diffs in unified view:
              // If this is a removed line and the next is an added line,
              // we can pass the next line to diff.
              // If this is an added line and the previous was a removed line,
              // we can pass the previous line to diff.
              let otherText: string | undefined;
              if (isRemoved && changes[idx + 1]?.type === "added") {
                otherText = changes[idx + 1].value;
              } else if (isAdded && changes[idx - 1]?.type === "removed") {
                otherText = changes[idx - 1].value;
              }

              return (
                <div
                  key={idx}
                  className={`flex min-w-0 hover:bg-black/5 dark:hover:bg-white/5 items-stretch ${getBgColor(type)}`}
                >
                  <span className="w-10 select-none text-right text-gray-400 dark:text-gray-500 pr-2 py-1 border-r border-black/5 dark:border-white/5 bg-black/[2%] dark:bg-white/[2%]">
                    {oldNum}
                  </span>
                  <span className="w-10 select-none text-right text-gray-400 dark:text-gray-500 pr-2 py-1 border-r border-black/5 dark:border-white/5 bg-black/[2%] dark:bg-white/[2%]">
                    {newNum}
                  </span>
                  <span
                    className={`w-6 select-none flex justify-center items-center font-bold ${
                      isAdded ? "text-green-500" : isRemoved ? "text-red-500" : "text-gray-400 opacity-50"
                    }`}
                  >
                    {sign}
                  </span>
                  <pre className={`flex-1 px-2 py-1 whitespace-pre-wrap break-all ${getTextColor(type)}`}>
                    <LineContent text={change.value} type={type} otherText={otherText} />
                  </pre>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderInlineDiff = () => {
    return (
      <div className="border border-black/10 dark:border-white/10 rounded-lg p-4 bg-white dark:bg-black/20 max-h-[32rem] overflow-y-auto font-mono text-sm leading-relaxed">
        {changes.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 italic p-4">
            No differences to display. Enter text above to compare.
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-all">
            {changes.map((change, idx) => {
              if (change.type === "common") {
                return <span key={idx} className="text-gray-700 dark:text-gray-300">{change.value}</span>;
              }
              if (change.type === "added") {
                return (
                  <span
                    key={idx}
                    className="bg-green-500/20 text-green-800 dark:bg-green-500/25 dark:text-green-300 font-medium px-0.5 rounded-sm"
                  >
                    {change.value}
                  </span>
                );
              }
              // Removed
              return (
                <span
                  key={idx}
                  className="bg-red-500/20 text-red-800 dark:bg-red-500/25 dark:text-red-300 line-through font-medium px-0.5 rounded-sm"
                >
                  {change.value}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Actions row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadSample}>
            Load Sample
          </Button>
          <Button variant="secondary" onClick={clearAll} disabled={!original && !modified}>
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Options checkboxes */}
          <div className="flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-white/60">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-gray-300 text-sky-500 focus:ring-sky-500 dark:border-white/10 dark:bg-black/30"
              />
              Ignore Whitespace
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={caseInsensitive}
                onChange={(e) => setCaseInsensitive(e.target.checked)}
                className="rounded border-gray-300 text-sky-500 focus:ring-sky-500 dark:border-white/10 dark:bg-black/30"
              />
              Case Insensitive
            </label>
          </div>

          {/* Diff Level selector */}
          <div className="inline-flex rounded-lg bg-black/5 dark:bg-white/5 p-0.5 border border-black/5 dark:border-white/5">
            {(["line", "word", "char"] as DiffLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setDiffLevel(level)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  diffLevel === level
                    ? "bg-sky-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 dark:text-white/60 dark:hover:text-white"
                }`}
              >
                {level} Diff
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextArea
          label="Original Text"
          placeholder="Paste original text here…"
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          className="min-h-[12rem] font-mono text-xs"
        />
        <TextArea
          label="Modified Text"
          placeholder="Paste modified text here…"
          value={modified}
          onChange={(e) => setModified(e.target.value)}
          className="min-h-[12rem] font-mono text-xs"
        />
      </div>

      {/* Output Panel */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-white/80">Differences</h3>

          {/* Unified / Split toggle (only for line level diffs) */}
          {diffLevel === "line" && (
            <div className="inline-flex rounded-lg bg-black/5 dark:bg-white/5 p-0.5 border border-black/5 dark:border-white/5">
              {(["split", "unified"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors ${
                    viewMode === mode
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-800 dark:text-white/60 dark:hover:text-white"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Diff Output Area */}
        {diffLevel === "line" ? renderLineDiff() : renderInlineDiff()}
      </div>
    </div>
  );
}
