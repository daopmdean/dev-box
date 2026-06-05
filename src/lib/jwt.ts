import { SignJWT, jwtVerify } from "jose";

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function base64UrlDecode(segment: string): string {
  let s = segment.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4 !== 0) s += "=";
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Decode a JWT WITHOUT verifying its signature. */
export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT: expected 3 dot-separated segments");
  }
  const [headerPart, payloadPart, signature] = parts;
  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = JSON.parse(base64UrlDecode(headerPart));
  } catch {
    throw new Error("Invalid JWT: header is not valid base64url JSON");
  }
  try {
    payload = JSON.parse(base64UrlDecode(payloadPart));
  } catch {
    throw new Error("Invalid JWT: payload is not valid base64url JSON");
  }
  return { header, payload, signature };
}

/** Sign an HS256 JWT from a payload object and a secret string. */
export async function signHs256(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(key);
}

/** Verify an HS256 token's signature against a secret. */
export async function verifyHs256(
  token: string,
  secret: string,
): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}
