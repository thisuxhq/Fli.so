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
  // Authenticate as admin because we have api rules that prevent unauthenticated access
  console.log('Starting load function with params:', params);
  const pb = createInstance();
  await pb.admins.authWithPassword(
    env.POCKETBASE_ADMIN_EMAIL!,
    env.POCKETBASE_ADMIN_PASSWORD!,
  );
  console.log('Successfully authenticated with PocketBase');

  if (!params.slug) {
    console.log('No slug provided in params');
    throw error(400, "Slug is required");
  }

  console.log('Attempting to fetch URL with slug:', params.slug);
  const url = await pb
    .collection("urls")
    .getFirstListItem<UrlsResponse>(`slug = "${params.slug}"`).catch(() =>{
      console.log('URL not found for slug:', params.slug);
      return null
    })

  if (!url) {
    throw error(404, "Not found");
  }
  console.log('Found URL:', url);

  // Increment clicks
  console.log('Incrementing clicks for URL ID:', url.id);
  await pb.collection("urls").update(url.id, {
    clicks: url.clicks + 1,
  });

  // Check if the url is expired and redirect to expiration URL if needed
  if (url.expiration && new Date(url.expiration) < new Date()) {
    console.log('URL is expired. Expiration date:', url.expiration);
    if (url.expiration_url) {
      console.log('Redirecting to expiration URL:', url.expiration_url);
      throw redirect(302, url.expiration_url);
    }
    throw error(410, "This link has expired");
  }

  // If URL has password
  if (url.password_hash) {
    console.log('URL is password protected');
    return {
      isProtected: true,
      url_id: url.id,
    };
  }

  // If URL has meta data, return for brief display
  if (url.meta_title || url.meta_description || url.meta_image_url) {
    console.log('URL has meta data, returning meta information');
    return {
      meta: {
        title: url.meta_title,
        description: url.meta_description || "not working",
        image: url.meta_image_url,
        url: url.url,
      },
    };
  }

  // No meta or password - direct redirect
  console.log('Redirecting to URL:', url.url);
  throw redirect(302, url.url);
};

export const actions: Actions = {
  verify_password: async ({ request }) => {
    
    const pb = createInstance();
    await pb.admins.authWithPassword(
      env.POCKETBASE_ADMIN_EMAIL!,
      env.POCKETBASE_ADMIN_PASSWORD!,
    );
    
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
    const url = await pb.collection("urls").getOne(url_id);

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
