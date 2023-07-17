import { webcrypto } from "crypto";
import { base64ToArrayBuffer } from "koishi";

export const importPublicKey = async (
  pemKey: string,
  algorithm: Parameters<webcrypto.SubtleCrypto["importKey"]>[2]
) =>
  await webcrypto.subtle.importKey(
    "spki",
    base64ToArrayBuffer(pemKey.slice(26, -24).trim()),
    algorithm,
    false,
    ["sign", "verify"]
  );
