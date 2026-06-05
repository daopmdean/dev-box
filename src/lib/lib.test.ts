import { describe, it, expect } from "vitest";
import { encodeBase64, decodeBase64 } from "./base64";
import { beautifyJson, minifyJson } from "./json";
import { parseEpoch } from "./unixtime";
import { decodeJwt, signHs256, verifyHs256 } from "./jwt";
import { randomString, uuidV4 } from "./random";

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
