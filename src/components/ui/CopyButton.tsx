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
      className={`rounded-md px-2.5 py-1 text-xs font-medium bg-white/10 hover:bg-white/15 text-white/80 transition-colors disabled:opacity-40 ${className}`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
