/** UTF-8 safe Base64 helpers (handles emoji and non-ASCII correctly). */

function toBinary(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return binary;
}

function fromBinary(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  const base64 = btoa(toBinary(bytes));
  if (!urlSafe) return base64;
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBase64(input: string, urlSafe = false): string {
  let normalized = input.trim();
  if (urlSafe) {
    normalized = normalized.replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4 !== 0) normalized += "=";
  }
  const binary = atob(normalized);
  return new TextDecoder().decode(fromBinary(binary));
}
