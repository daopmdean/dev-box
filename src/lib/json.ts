export type IndentOption = 2 | 4 | "tab";

function indentValue(indent: IndentOption): string | number {
  return indent === "tab" ? "\t" : indent;
}

export interface JsonResult {
  ok: boolean;
  output: string;
  error?: string;
}

export function beautifyJson(input: string, indent: IndentOption = 2): JsonResult {
  if (!input.trim()) return { ok: true, output: "" };
  try {
    const parsed = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed, null, indentValue(indent)) };
  } catch (e) {
    return { ok: false, output: "", error: (e as Error).message };
  }
}

export function minifyJson(input: string): JsonResult {
  if (!input.trim()) return { ok: true, output: "" };
  try {
    const parsed = JSON.parse(input);
    return { ok: true, output: JSON.stringify(parsed) };
  } catch (e) {
    return { ok: false, output: "", error: (e as Error).message };
  }
}
