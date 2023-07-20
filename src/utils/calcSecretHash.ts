import { webcrypto } from "crypto";

export const arrayBufferToHex = (buffer: ArrayBuffer) =>
  new Uint8Array(buffer).reduce(
    (s, v) => (s += "0123456789abcdef"[v >> 4]! + "0123456789abcdef"[v & 15]!),
    ""
  );

export const calcSecretHash = async (secret: string, pubKey: string) => {
  const publicKey = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pubKey.endsWith("\n") ? pubKey : `${pubKey}\n`),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
  const hash = await webcrypto.subtle.sign(
    "HMAC",
    publicKey,
    new TextEncoder().encode(secret)
  );
  return arrayBufferToHex(hash);
};
