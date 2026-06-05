import { useEffect, useMemo, useState } from "react";
import TextArea from "../../components/ui/TextArea";
import Input from "../../components/ui/Input";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import {
  decodeJwt,
  signHs256,
  verifyHs256,
  type DecodedJwt,
} from "../../lib/jwt";

type Mode = "decode" | "encode";

function timeFields(payload: Record<string, unknown>) {
  const out: { label: string; value: string }[] = [];
  for (const key of ["iat", "nbf", "exp"]) {
    const v = payload[key];
    if (typeof v === "number") {
      out.push({ label: key, value: new Date(v * 1000).toLocaleString() });
    }
  }
  return out;
}

function DecodeMode() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [verified, setVerified] = useState<boolean | null>(null);

  const result = useMemo(() => {
    if (!token.trim()) return { decoded: null as DecodedJwt | null, error: "" };
    try {
      return { decoded: decodeJwt(token), error: "" };
    } catch (e) {
      return { decoded: null, error: (e as Error).message };
    }
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    if (!token.trim() || !secret) {
      setVerified(null);
      return;
    }
    verifyHs256(token, secret).then((ok) => {
      if (!cancelled) setVerified(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [token, secret]);

  const expired =
    result.decoded && typeof result.decoded.payload.exp === "number"
      ? (result.decoded.payload.exp as number) * 1000 < Date.now()
      : null;

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste a JWT (header.payload.signature)…"
      />

      {result.error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {result.error}
        </p>
      )}

      {result.decoded && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <TextArea
              label="Header"
              value={JSON.stringify(result.decoded.header, null, 2)}
              readOnly
              copyable
            />
            <TextArea
              label="Payload"
              value={JSON.stringify(result.decoded.payload, null, 2)}
              readOnly
              copyable
            />
          </div>

          {timeFields(result.decoded.payload).length > 0 && (
            <div className="rounded-md border border-white/10 bg-black/20 px-4 py-2">
              {timeFields(result.decoded.payload).map((f) => (
                <div
                  key={f.label}
                  className="flex justify-between border-b border-white/5 py-1.5 text-sm last:border-0"
                >
                  <span className="text-white/50">{f.label}</span>
                  <span className="font-mono text-white/90">{f.value}</span>
                </div>
              ))}
              {expired !== null && (
                <div className="pt-2 text-sm">
                  Status:{" "}
                  <span className={expired ? "text-red-400" : "text-green-400"}>
                    {expired ? "expired" : "valid (not expired)"}
                  </span>
                </div>
              )}
            </div>
          )}

          <Field
            label="Verify signature (HS256, optional)"
            hint="Enter the secret to check the signature. Decoding never requires it."
          >
            <Input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="your-256-bit-secret"
              className="w-full"
            />
          </Field>
          {secret && verified !== null && (
            <p className="text-sm">
              Signature:{" "}
              <span className={verified ? "text-green-400" : "text-red-400"}>
                {verified ? "verified ✓" : "invalid ✗"}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
}

function EncodeMode() {
  const [payload, setPayload] = useState('{\n  "sub": "1234567890",\n  "name": "Jane Doe"\n}');
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  async function generate() {
    setError("");
    setToken("");
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(payload);
    } catch (e) {
      setError("Payload is not valid JSON: " + (e as Error).message);
      return;
    }
    try {
      setToken(await signHs256(obj, secret));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <TextArea
        label="Payload (JSON)"
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />
      <Field label="Secret (HS256)">
        <Input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full"
        />
      </Field>
      <div>
        <Button variant="primary" onClick={generate}>
          Generate token
        </Button>
      </div>
      {error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {token && (
        <TextArea label="Token" value={token} readOnly copyable />
      )}
    </div>
  );
}

export default function JwtTool() {
  const [mode, setMode] = useState<Mode>("decode");

  return (
    <div className="flex flex-col gap-4">
      <div className="inline-flex w-fit rounded-md bg-white/5 p-1">
        {(["decode", "encode"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded px-3 py-1 text-sm capitalize transition-colors ${
              mode === m ? "bg-sky-500 text-white" : "text-white/60"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      {mode === "decode" ? <DecodeMode /> : <EncodeMode />}
    </div>
  );
}
