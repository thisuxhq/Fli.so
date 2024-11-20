import type { TypedPocketBase } from "$lib/types";
import { HMAC } from "@oslojs/crypto/hmac";
import { SHA256 } from "@oslojs/crypto/sha2";

export class UrlService {
  static async checkSlugExists(pb: TypedPocketBase, slug: string) {
    return await pb
      .collection('urls')
      .getFirstListItem(`slug = "${slug}"`)
      .catch(() => null);
  }

  static generatePasswordHash(password: string, secret: string) {
    const hasher = new HMAC(SHA256, new TextEncoder().encode(secret));
    hasher.update(new TextEncoder().encode(password));
    return Buffer.from(hasher.digest()).toString("hex");
  }

  static validateSlug(slug: string) {
    return /^[a-zA-Z0-9-]+$/.test(slug);
  }
}
