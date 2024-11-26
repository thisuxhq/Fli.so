import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { HMAC } from "@oslojs/crypto/hmac";
import { SHA256 } from "@oslojs/crypto/sha2";
import { env } from "$env/dynamic/private";
import type { UrlsResponse } from "$lib/types";

const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!params.slug) {
    throw error(400, "Slug is required");
  }

  const url = await locals.pb
    .collection("urls")
    .getFirstListItem<UrlsResponse>(`slug = "${params.slug}"`);

  if (!url) {
    throw error(404, "Not found");
  }

  // Increment clicks
  await locals.pb.collection("urls").update(url.id, {
    clicks: url.clicks + 1,
  });

  // Check if the url is expired and redirect to expiration URL if needed
  if (url.expiration && new Date(url.expiration) < new Date()) {
    throw redirect(302, url.expiration_url);
  }

  // If URL has password, return data for password verification
  if (url.password_hash) {
    return {
      isProtected: true,
      url_id: url.id,
    };
  }

  // Otherwise redirect directly to the target URL
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
    if (url.password_hash !== Buffer.from(digest).toString("hex")) {
      console.log("Invalid password");
      return fail(401, { message: "Invalid password" });
    }

    // Redirect to target URL after successful verification
    throw redirect(302, url.url);
  },
};
