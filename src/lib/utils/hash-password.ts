import { HMAC } from "@oslojs/crypto/hmac";
import { SHA256 } from "@oslojs/crypto/sha2";

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string, secret: string): Promise<string> {
  const hasher: HMAC = new HMAC(SHA256, new TextEncoder().encode(secret));
  hasher.update(new TextEncoder().encode(password));
  return arrayBufferToHex(hasher.digest().buffer as ArrayBuffer);
}
