export type Charset = "alphanumeric" | "alpha" | "hex" | "numeric" | "base64";

const CHARSETS: Record<Charset, string> = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  hex: "0123456789abcdef",
  numeric: "0123456789",
  base64: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
};

/** Generate a single RFC-4122 v4 UUID. */
export function uuidV4(): string {
  return crypto.randomUUID();
}

/** Generate `count` UUIDs. */
export function uuidV4Bulk(count: number): string[] {
  return Array.from({ length: Math.max(0, count) }, () => crypto.randomUUID());
}

/**
 * Generate a cryptographically-random string of `length` characters drawn from
 * the given charset (or a custom alphabet). Uses rejection sampling to avoid
 * modulo bias.
 */
export function randomString(
  length: number,
  charset: Charset | string,
): string {
  const alphabet =
    charset in CHARSETS ? CHARSETS[charset as Charset] : (charset as string);
  if (!alphabet) return "";
  const n = alphabet.length;
  const max = Math.floor(256 / n) * n;
  let out = "";
  while (out.length < length) {
    const bytes = new Uint8Array(length - out.length);
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < max) out += alphabet[b % n];
      if (out.length === length) break;
    }
  }
  return out;
}
