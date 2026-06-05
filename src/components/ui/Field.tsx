import type { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
  hint?: string;
}

/** A labeled row for inline form controls. */
export default function Field({ label, children, hint }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/70">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/40">{hint}</p>}
    </div>
  );
}
