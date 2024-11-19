import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { HMAC } from "@oslojs/crypto/hmac";
import { SHA256 } from "@oslojs/crypto/sha2";
import { env } from "$env/dynamic/private";

const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!params.slug) {
    throw error(400, "Slug is required");
  }

  const url = await locals.pb
    .collection("urls")
    .getFirstListItem(`slug = "${params.slug}"`);

  if (!url) {
    throw error(404, "Not found");
  }

  // Increment clicks
  await locals.pb.collection("urls").update(url.id, {
    clicks: url.clicks + 1,
  });

  // If URL has password, return data for password verification
  if (url.password_hash) {
    return {
      isProtected: true,
      url_id: url.id,
    };
  }

  // Otherwise redirect directly
  throw redirect(302, url.url);
};

export const actions: Actions = {
  verify_password: async ({ request, locals }) => {
    console.log("Attempting to verify password for URL");
    const formData = await request.formData();
    const url_id = formData.get("url_id") as string;
    const password = formData.get("password") as string;

    console.log("Password:", password);
    console.log("URL ID:", url_id);

    if (!password || !url_id) {
      console.error("Password or URL ID is required but not provided");
      return fail(400, { message: "Password or URL ID is required" });
    }

    console.log("Hashing password for verification");
    const hasher = new HMAC(SHA256, new TextEncoder().encode(HASH_SECRET));
    if (typeof password === "string") {
      hasher.update(new TextEncoder().encode(password));
    } else {
      console.error("Password is not a string");
      return fail(400, { message: "Password must be a string" });
    }
    const digest = hasher.digest();

    console.log("Retrieving URL for password verification");
    const url = await locals.pb.collection("urls").getOne(url_id);

    console.log("URL:", url);

    if (!url) {
      console.error("URL not found for verification");
      return fail(404, { message: "URL not found" });
    }

    if (url.password_hash !== Buffer.from(digest).toString("hex")) {
      console.error("Password verification failed");
      return fail(401, { message: "Invalid password" });
    }

    console.log("Password verification successful, redirecting");
    throw redirect(302, url.url);
  },
};
