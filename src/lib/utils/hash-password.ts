import { HMAC } from "@oslojs/crypto/hmac";
import { SHA256 } from "@oslojs/crypto/sha2";

export async function hashPassword(password: string, secret: string): Promise<string> {
  const hasher: HMAC = new HMAC(SHA256, new TextEncoder().encode(secret));
  hasher.update(new TextEncoder().encode(password));
  return Buffer.from(hasher.digest()).toString("hex");
}
