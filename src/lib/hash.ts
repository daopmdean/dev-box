/**
 * MD5 implementation in pure TypeScript/JavaScript.
 * Operates on a Uint8Array and returns a hex string.
 */
export function md5(bytes: Uint8Array): string {
  // MD5 helper functions & constants
  const k = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]);

  const s = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];

  const bitLength = bytes.length * 8;

  // Padding: append 0x80, then zeros, then 64-bit length.
  // The message length (in bytes) before the 8-byte length field must be 56 mod 64.
  let padLen = 56 - (bytes.length % 64);
  if (padLen <= 0) padLen += 64;

  const padded = new Uint8Array(bytes.length + padLen + 8);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  // Write length in bits as 64-bit little-endian integer at the end
  const lowBits = bitLength & 0xffffffff;
  const highBits = Math.floor(bitLength / 0x100000000) & 0xffffffff;
  view.setUint32(padded.length - 8, lowBits, true);
  view.setUint32(padded.length - 4, highBits, true);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const w = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, true);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;

    for (let i = 0; i < 64; i++) {
      let f = 0;
      let g = 0;

      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const temp = d;
      d = c;
      c = b;

      const sum = (a + f + k[i] + w[g]) | 0;
      const rot = (sum << s[i]) | (sum >>> (32 - s[i]));
      b = (b + rot) | 0;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
  }

  const toHex = (n: number) => {
    let s = "";
    for (let i = 0; i < 4; i++) {
      const byte = (n >>> (i * 8)) & 0xff;
      s += byte.toString(16).padStart(2, "0");
    }
    return s;
  };

  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
}

/**
 * Calculates standard hashes for a Uint8Array using Web Crypto API.
 */
export async function sha1(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-1", bytes as any);
  return bufferToHex(hashBuffer);
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes as any);
  return bufferToHex(hashBuffer);
}

export async function sha384(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-384", bytes as any);
  return bufferToHex(hashBuffer);
}

export async function sha512(bytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-512", bytes as any);
  return bufferToHex(hashBuffer);
}

function bufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Interface for the list of generated hashes.
 */
export interface HashResults {
  md5: string;
  sha1: string;
  sha256: string;
  sha384: string;
  sha512: string;
}

/**
 * Generates all hashes (MD5, SHA-1, SHA-256, SHA-384, SHA-512) for a given string or Uint8Array.
 */
export async function generateHashes(input: string | Uint8Array): Promise<HashResults> {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  
  // Calculate MD5 synchronously/separately, and SHA family using Web Crypto API in parallel
  const md5Val = md5(bytes);
  const [sha1Val, sha256Val, sha384Val, sha512Val] = await Promise.all([
    sha1(bytes),
    sha256(bytes),
    sha384(bytes),
    sha512(bytes),
  ]);

  return {
    md5: md5Val,
    sha1: sha1Val,
    sha256: sha256Val,
    sha384: sha384Val,
    sha512: sha512Val,
  };
}
