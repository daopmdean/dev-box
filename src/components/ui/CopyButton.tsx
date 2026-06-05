import { useState } from "react";

interface Props {
  value: string;
  className?: string;
}

export default function CopyButton({ value, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context); ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      className={`rounded-md px-2.5 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white/80 ${className}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
