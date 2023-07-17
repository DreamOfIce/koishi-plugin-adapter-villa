import { webcrypto } from "crypto";
import { base64ToArrayBuffer } from "koishi";
import { importPublicKey } from "./importPublicKey";

export const verifyCallback = async (
  signature: string,
  secret: string,
  pubKey: string,
  body?: string
) => {
  const sign = base64ToArrayBuffer(signature);
  const data = new URLSearchParams({
    body: body ?? "",
    secret,
  }).toString();
  const hash = await webcrypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data)
  );

  const publicKey = await importPublicKey(pubKey, {
    name: "RSA-PKCS1-v1_5",
    hash: "SHA-256",
  });
  return await webcrypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    sign,
    hash
  );
};
