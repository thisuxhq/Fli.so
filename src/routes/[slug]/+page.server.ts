import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { HMAC } from "@oslojs/crypto/hmac";
import { SHA256 } from "@oslojs/crypto/sha2";
import { env } from "$env/dynamic/private";
import type { UrlsResponse } from "$lib/types";
import { arrayBufferToHex } from "$lib/utils/buffer";
import { createInstance } from "$lib/pocketbase";

const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

export const load: PageServerLoad = async ({ params }) => {
  // Authenticate as admin
  const pb = createInstance();
  await pb.admins.authWithPassword(
    env.POCKETBASE_ADMIN_EMAIL!,
    env.POCKETBASE_ADMIN_PASSWORD!,
  );

  if (!params.slug) {
    throw error(400, "Slug is required");
  }

  const url = await pb
    .collection("urls")
    .getFirstListItem<UrlsResponse>(`slug = "${params.slug}"`);

  if (!url) {
    throw error(404, "Not found");
  }

  // Increment clicks
  await pb.collection("urls").update(url.id, {
    clicks: url.clicks + 1,
  });

  // Check if the url is expired and redirect to expiration URL if needed
  if (url.expiration && new Date(url.expiration) < new Date()) {
    if (url.expiration_url) {
      throw redirect(302, url.expiration_url);
    }
    throw error(410, "This link has expired");
  }

  // If URL has password
  if (url.password_hash) {
    return {
      isProtected: true,
      url_id: url.id,
    };
  }

  // If URL has meta data, return for brief display
  if (url.meta_title || url.meta_description) {
    return {
      meta: {
        title: url.meta_title,
        description: url.meta_description,
        image: url.meta_image_url,
        url: url.url,
      },
    };
  }

  // No meta or password - direct redirect
  throw redirect(302, url.url);
};

export const actions: Actions = {
  verify_password: async ({ request, locals }) => {
    // Get form data from request
    const formData = await request.formData();
    const url_id = formData.get("url_id") as string;
    const password = formData.get("password") as string;

    // Validate required fields
    if (!password || !url_id) {
      return fail(400, { message: "Password or URL ID is required" });
    }

    // Create hash from password for comparison
    const hasher = new HMAC(SHA256, new TextEncoder().encode(HASH_SECRET));
    if (typeof password === "string") {
      hasher.update(new TextEncoder().encode(password));
    } else {
      return fail(400, { message: "Password must be a string" });
    }
    const digest = hasher.digest();

    // Get URL from database
    const url = await locals.pb.collection("urls").getOne(url_id);

    // Verify URL exists
    if (!url) {
      return fail(404, { message: "URL not found" });
    }

    // Verify password hash matches
    if (url.password_hash !== arrayBufferToHex(digest.buffer as ArrayBuffer)) {
      console.log("Invalid password");
      return fail(401, { message: "Invalid password" });
    }

    // Redirect to target URL after successful verification
    throw redirect(302, url.url);
  },
};
