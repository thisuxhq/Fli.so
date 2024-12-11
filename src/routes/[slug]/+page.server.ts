import { error, fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { hashPassword } from "$lib/utils/hash-password";
import { db } from "$lib/server/db";
import { urls } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

export const load: PageServerLoad = async ({ params }) => {
  if (!params.slug) {
    console.log("No slug provided in params");
    throw error(400, "Slug is required");
  }

  console.log("Attempting to fetch URL with slug:", params.slug);
  const [url] = await db
    .select()
    .from(urls)
    .where(eq(urls.slug, params.slug))
    .limit(1);

  if (!url) {
    throw error(404, "Not found");
  }
  console.log("Found URL:", url);

  // Increment clicks
  console.log("Incrementing clicks for URL ID:", url.id);
  await db
    .update(urls)
    .set({ clicks: (url.clicks || 0) + 1, updatedAt: new Date() })
    .where(eq(urls.id, url.id));

  // Check if the url is expired and redirect to expiration URL if needed
  if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
    console.log("URL is expired. Expiration date:", url.expiresAt);
    if (url.expirationUrl) {
      console.log("Redirecting to expiration URL:", url.expirationUrl);
      throw redirect(302, url.expirationUrl);
    }
    throw error(410, "This link has expired");
  }

  // If URL has password
  if (url.passwordHash) {
    console.log("URL is password protected");
    return {
      isProtected: true,
      url_id: url.id,
    };
  }

  // If URL has meta data, return for brief display
  if (url.metaTitle || url.metaDescription || url.metaImageUrl) {
    console.log("URL has meta data, returning meta information");
    return {
      meta: {
        title: url.metaTitle,
        description: url.metaDescription || "not working",
        image: url.metaImageUrl,
        url: url.url,
      },
    };
  }

  // No meta or password - direct redirect
  console.log("Redirecting to URL:", url.url);
  throw redirect(302, url.url);
};

export const actions: Actions = {
  verify_password: async ({ request }) => {
    // Get form data from request
    const formData = await request.formData();
    const url_id = formData.get("url_id") as string;
    const password = formData.get("password") as string;

    console.log("Received URL ID:", url_id, "and password:", password);

    // Validate required fields
    if (!password || !url_id) {
      console.error("Missing required field: password or URL ID");
      return fail(400, { message: "Password or URL ID is required" });
    }

    // Create hash from password for comparison
    const hashedPassword = await hashPassword(password, HASH_SECRET);
    console.log("Hashed password for comparison:", hashedPassword);

    // Get URL from database
    const [url] = await db
      .select()
      .from(urls)
      .where(eq(urls.id, url_id))
      .limit(1);

    console.log("Fetched URL:", url);

    // Verify URL exists
    if (!url) {
      console.error("URL not found for ID:", url_id);
      return fail(404, { message: "URL not found" });
    }

    // Verify password hash matches
    if (url.passwordHash !== hashedPassword) {
      console.error("Password hash does not match for URL ID:", url_id);
      return fail(401, { message: "Invalid password" });
    }

    // Redirect to target URL after successful verification
    console.log("Redirecting to URL:", url.url);
    throw redirect(302, url.url);
  },
};
