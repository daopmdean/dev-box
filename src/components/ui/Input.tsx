import type { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      spellCheck={false}
      className={`rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white/90 outline-none focus:border-sky-500/60 ${className}`}
      {...props}
    />
  );
}
