import type { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      spellCheck={false}
      className={`rounded-md border border-black/10 bg-white text-gray-900 px-3 py-1.5 text-sm outline-none focus:border-sky-500/60 dark:border-white/10 dark:bg-black/30 dark:text-white/90 ${className}`}
      {...props}
    />
  );
}
