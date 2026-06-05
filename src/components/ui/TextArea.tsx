import type { TextareaHTMLAttributes, ReactNode } from "react";
import CopyButton from "./CopyButton";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  /** Show a copy button in the header that copies the textarea value. */
  copyable?: boolean;
  /** Extra controls rendered on the right of the label row. */
  actions?: ReactNode;
}

export default function TextArea({
  label,
  copyable,
  actions,
  className = "",
  value,
  ...props
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {(label || copyable || actions) && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-white/70">{label}</label>
          <div className="flex items-center gap-2">
            {actions}
            {copyable && <CopyButton value={String(value ?? "")} />}
          </div>
        </div>
      )}
      <textarea
        value={value}
        spellCheck={false}
        className={`w-full min-h-[8rem] resize-y rounded-md border border-black/10 bg-white text-gray-900 p-3 text-sm outline-none focus:border-sky-500/60 dark:border-white/10 dark:bg-black/30 dark:text-white/90 ${className}`}
        {...props}
      />
    </div>
  );
}
