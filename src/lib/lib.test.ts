import { describe, it, expect } from "vitest";
import { encodeBase64, decodeBase64 } from "./base64";
import { beautifyJson, minifyJson } from "./json";
import { parseEpoch } from "./unixtime";
import { decodeJwt, signHs256, verifyHs256 } from "./jwt";
import { randomString, uuidV4 } from "./random";
import { md5, generateHashes } from "./hash";
import { diffLines, diffWords, diffChars } from "./diff";


describe("base64", () => {
  it("round-trips ASCII", () => {
    expect(decodeBase64(encodeBase64("hello world"))).toBe("hello world");
  });

  it("round-trips non-ASCII (emoji)", () => {
    const s = "héllo 🌍 café";
    expect(decodeBase64(encodeBase64(s))).toBe(s);
  });

  it("supports url-safe variant", () => {
    const s = "subjects?_data=??";
    const enc = encodeBase64(s, true);
    expect(enc).not.toContain("+");
    expect(enc).not.toContain("/");
    expect(enc).not.toContain("=");
    expect(decodeBase64(enc, true)).toBe(s);
  });
});

describe("json", () => {
  it("beautifies with 2-space indent", () => {
    expect(beautifyJson('{"a":1}', 2).output).toBe('{\n  "a": 1\n}');
  });

  it("minifies", () => {
    expect(minifyJson('{ "a" : 1 }').output).toBe('{"a":1}');
  });

  it("reports parse errors", () => {
    const r = beautifyJson("{ not json }");
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });
});

describe("unixtime", () => {
  it("parses seconds", () => {
    expect(parseEpoch("1700000000")?.getTime()).toBe(1700000000 * 1000);
  });

  it("parses milliseconds", () => {
    expect(parseEpoch("1700000000000")?.getTime()).toBe(1700000000000);
  });

  it("rejects non-numeric", () => {
    expect(parseEpoch("not-a-time")).toBeNull();
  });
});

describe("jwt", () => {
  it("decodes a token without verification", () => {
    // {"alg":"HS256","typ":"JWT"} . {"sub":"123","name":"Jane"} . sig
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      "eyJzdWIiOiIxMjMiLCJuYW1lIjoiSmFuZSJ9." +
      "abc";
    const decoded = decodeJwt(token);
    expect(decoded.header.alg).toBe("HS256");
    expect(decoded.payload.name).toBe("Jane");
  });

  it("throws on malformed token", () => {
    expect(() => decodeJwt("not.a.jwt.token")).toThrow();
  });

  it("signs and verifies HS256", async () => {
    const token = await signHs256({ sub: "abc" }, "s3cret");
    expect(await verifyHs256(token, "s3cret")).toBe(true);
    expect(await verifyHs256(token, "wrong")).toBe(false);
    expect(decodeJwt(token).payload.sub).toBe("abc");
  });
});

describe("random", () => {
  it("generates valid v4 uuids", () => {
    expect(uuidV4()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("respects length and charset", () => {
    const s = randomString(32, "hex");
    expect(s).toHaveLength(32);
    expect(s).toMatch(/^[0-9a-f]+$/);
  });
});

describe("hash", () => {
  it("calculates MD5 correctly (known vectors)", () => {
    // Empty string
    expect(md5(new Uint8Array())).toBe("d41d8cd98f00b204e9800998ecf8427e");
    
    // Simple string
    const encoder = new TextEncoder();
    expect(md5(encoder.encode("The quick brown fox jumps over the lazy dog")))
      .toBe("9e107d9d372bb6826bd81d3542a419d6");

    // UTF-8 string
    expect(md5(encoder.encode("héllo 🌍 café")))
      .toBe("373bfc8556e8ac1266bb8d8b8f8a1710");
  });

  it("calculates all hashes (MD5 + SHA family) in parallel", async () => {
    const results = await generateHashes("The quick brown fox jumps over the lazy dog");
    
    expect(results.md5).toBe("9e107d9d372bb6826bd81d3542a419d6");
    // SHA-1
    expect(results.sha1).toBe("2fd4e1c67a2d28fced849ee1bb76e7391b93eb12");
    // SHA-256
    expect(results.sha256).toBe("d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592");
    // SHA-384
    expect(results.sha384).toBe("ca737f1014a48f4c0b6dd43cb177b0afd9e5169367544c494011e3317dbf9a509cb1e5dc1e85a941bbee3d7f2afbc9b1");
    // SHA-512
    expect(results.sha512).toBe("07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6");
  });
});

describe("diff", () => {
  it("diffs lines correctly", () => {
    const textA = "line 1\nline 2\nline 3";
    const textB = "line 1\nline 2.5\nline 3\nline 4";
    const result = diffLines(textA, textB);
    expect(result).toEqual([
      { type: "common", value: "line 1" },
      { type: "removed", value: "line 2" },
      { type: "added", value: "line 2.5" },
      { type: "common", value: "line 3" },
      { type: "added", value: "line 4" },
    ]);
  });

  it("handles case insensitivity and whitespace options", () => {
    const textA = "LINE 1\n  line 2";
    const textB = "line 1\nline 2";
    
    // Default (strict)
    expect(diffLines(textA, textB)).toEqual([
      { type: "removed", value: "LINE 1" },
      { type: "removed", value: "  line 2" },
      { type: "added", value: "line 1" },
      { type: "added", value: "line 2" },
    ]);

    // Case insensitive
    expect(diffLines(textA, textB, { caseInsensitive: true })).toEqual([
      { type: "common", value: "line 1" },
      { type: "removed", value: "  line 2" },
      { type: "added", value: "line 2" },
    ]);

    // Ignore whitespace
    expect(diffLines(textA, textB, { ignoreWhitespace: true })).toEqual([
      { type: "removed", value: "LINE 1" },
      { type: "added", value: "line 1" },
      { type: "common", value: "line 2" },
    ]);

    // Both
    expect(diffLines(textA, textB, { caseInsensitive: true, ignoreWhitespace: true })).toEqual([
      { type: "common", value: "line 1" },
      { type: "common", value: "line 2" },
    ]);
  });

  it("diffs words correctly", () => {
    const textA = "hello world";
    const textB = "hello sweet world!";
    const result = diffWords(textA, textB);
    expect(result).toEqual([
      { type: "common", value: "hello" },
      { type: "added", value: " " },
      { type: "added", value: "sweet" },
      { type: "common", value: " " },
      { type: "common", value: "world" },
      { type: "added", value: "!" },
    ]);
  });

  it("diffs characters correctly", () => {
    const textA = "abc";
    const textB = "axc";
    const result = diffChars(textA, textB);
    expect(result).toEqual([
      { type: "common", value: "a" },
      { type: "removed", value: "b" },
      { type: "added", value: "x" },
      { type: "common", value: "c" },
    ]);
  });

  it("handles empty values and edge cases", () => {
    expect(diffLines("", "")).toEqual([]);
    expect(diffLines("a", "")).toEqual([{ type: "removed", value: "a" }]);
    expect(diffLines("", "b")).toEqual([{ type: "added", value: "b" }]);
  });
});

