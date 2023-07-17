import { webcrypto } from "crypto";
import { importPublicKey } from "./importPublicKey";

export const calcSecretHash = async (secret: string, pubKey: string) => {
  const publicKey = await importPublicKey(pubKey, {
    name: "HMAC",
    hash: "SHA256",
  });
  const hash = await webcrypto.subtle.sign(
    "HMAC",
    publicKey,
    new TextEncoder().encode(secret)
  );
  return new TextDecoder().decode(hash);
};
