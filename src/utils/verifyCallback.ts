import { webcrypto } from "crypto";
import { base64ToArrayBuffer } from "koishi";

// public key import cache
const publicKeys: Record<string, webcrypto.CryptoKey> = {};

export const verifyCallback = async (
  signature: string,
  secret: string,
  pubKey: string,
  body?: string,
) => {
  const sign = base64ToArrayBuffer(signature);
  const data = new TextEncoder().encode(
    new URLSearchParams({
      body: body?.trim() ?? "",
      secret,
    }).toString(),
  );

  const publicKey = (publicKeys[pubKey] ??= await webcrypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(pubKey.slice(26, -24)),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  ));
  return await webcrypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    sign,
    data,
  );
};
