import type { RequestHandler } from "./$types";
import { json, redirect } from "@sveltejs/kit";
import { convertExpirationToDate, hashPassword } from "$lib/utils/index";
import { env } from "$env/dynamic/private";
import { isReservedKeyword } from "$lib/utils/validation";
import { generateSlug } from "$lib";
import { db } from "$lib/server/db";
import { subscriptions, urls, urlsToTags } from "$lib/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "$lib";

export const PUT: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    throw redirect(302, "/login");
  }

  const data = await request.json();
  const { id, slug } = data;
  const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

  console.log(`PUT request received for URL with ID: ${id} and slug: ${slug}`);

  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    console.error(`Invalid slug format: ${slug}`);
    return json(
      { error: "Slug can only contain letters, numbers, and hyphens" },
      { status: 400 },
    );
  }

  if (isReservedKeyword(slug)) {
    console.error(`Slug is reserved: ${slug}`);
    return json(
      { error: "This URL is reserved for system use" },
      { status: 400 },
    );
  }

  try {
    // First, verify the URL belongs to the user
    const currentUrl = await db
      .select()
      .from(urls)
      .where(and(eq(urls.id, id), eq(urls.createdBy, locals.user.id)))
      .limit(1);

    console.log(`Current URL fetched: ${JSON.stringify(currentUrl)}`);

    if (currentUrl.length === 0) {
      console.error(`URL not found with ID: ${id}`);
      return json({ error: "URL not found" }, { status: 404 });
    }

    // If the slug hasn't changed, proceed with update
    if (currentUrl[0].slug === slug) {
      const updateData = {
        url: data.url,
        metaTitle: data.metaTitle ?? currentUrl[0].metaTitle,
        metaDescription: data.metaDescription ?? currentUrl[0].metaDescription,
        metaImageUrl: data.metaImageUrl ?? currentUrl[0].metaImageUrl,
        passwordHash: data.passwordHash === null 
          ? null  // Explicitly set to null if password was removed
          : data.passwordHash 
            ? await hashPassword(data.passwordHash, HASH_SECRET)
            : currentUrl[0].passwordHash,
        expiresAt: data.expiresAt ? convertExpirationToDate(data.expiresAt) : null,
        expirationUrl: data.expirationUrl ?? currentUrl[0].expirationUrl,
        updatedAt: new Date(),
      };

      // Update URL record
      const [updatedUrl] = await db
        .update(urls)
        .set(updateData)
        .where(eq(urls.id, id))
        .returning();

      // Handle tags update
      if (Array.isArray(data.tags)) {
        // Remove existing tag associations
        await db.delete(urlsToTags).where(eq(urlsToTags.urlId, id));

        // Add new tag associations
        if (data.tags.length > 0) {
          const tagAssociations = data.tags.map((tagId: string) => ({
            urlId: id,
            tagId,
          }));
          await db.insert(urlsToTags).values(tagAssociations);
        }
      }

      return json(updatedUrl);
    }

    // If slug has changed, check if the new slug exists
    const slugExists = await db
      .select()
      .from(urls)
      .where(eq(urls.slug, slug))
      .limit(1);

    console.log(
      `Slug existence check: ${slugExists.length > 0 ? "exists" : "does not exist"}`,
    );

    if (slugExists.length > 0) {
      console.error(`Slug already exists: ${slug}`);
      return json(
        { error: "This custom URL is already taken" },
        { status: 400 },
      );
    }

    // If we get here, we can safely update with the new slug
    const updateData = {
      url: data.url,
      slug: data.slug,
      metaTitle: data.meta_title ?? currentUrl[0].metaTitle,
      metaDescription: data.meta_description ?? currentUrl[0].metaDescription,
      metaImageUrl: data.meta_image_url ?? currentUrl[0].metaImageUrl,
      passwordHash: data.password_hash === null 
        ? null  // Explicitly set to null if password was removed
        : data.password_hash 
          ? await hashPassword(data.password_hash, HASH_SECRET)
          : currentUrl[0].passwordHash,
      expiresAt: data.expiration ? convertExpirationToDate(data.expiration) : null,
      expirationUrl: data.expiration_url ?? currentUrl[0].expirationUrl,
      updatedAt: new Date(),
    };

    console.log(
      `Update data with new slug prepared: ${JSON.stringify(updateData)}`,
    );

    const [updatedUrl] = await db
      .update(urls)
      .set(updateData)
      .where(eq(urls.id, id))
      .returning();

    console.log(
      `URL updated with new slug successfully: ${JSON.stringify(updatedUrl)}`,
    );
    return json(updatedUrl);
  } catch (error) {
    console.error("Failed to update URL", error);
    return json({ error: "Failed to update URL" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    throw redirect(302, "/login");
  }

  const { id } = await request.json();

  console.log(`DELETE request received for URL with ID: ${id}`);

  try {
    const [url] = await db
      .select()
      .from(urls)
      .where(and(eq(urls.id, id), eq(urls.createdBy, locals.user.id)))
      .limit(1);

    console.log(`URL fetched for deletion: ${JSON.stringify(url)}`);

    if (!url) {
      console.error(`Unauthorized access for URL deletion: ${id}`);
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.delete(urls).where(eq(urls.id, id));
    console.log(`URL deleted successfully: ${id}`);
    return json({ success: true });
  } catch (error) {
    console.error("Failed to delete URL", error);
    return json({ error: "Failed to delete URL" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    throw redirect(302, "/login");
  }

  const data = await request.json();
  const URL_LIMIT = parseInt(env.PUBLIC_FREE_URL_LIMIT ?? "25");
  const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

  console.log(
    `POST request received for URL creation: ${JSON.stringify(data)}`,
  );

  try {
    // Check if slug exists
    const exists = await db
      .select()
      .from(urls)
      .where(eq(urls.slug, data.slug))
      .limit(1);

    console.log(
      `Slug existence check: ${exists.length > 0 ? "exists" : "does not exist"}`,
    );

    if (exists.length > 0) {
      console.error(`Slug already exists: ${data.slug}`);
      return json(
        { error: "This custom URL is already taken" },
        { status: 400 },
      );
    }

    // Check URL limit for non-premium users
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, locals.user.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    const isPremium = subscription[0]?.status === "active";

    console.log(
      `Premium status check: ${isPremium ? "premium" : "non-premium"}`,
    );

    if (!isPremium) {
      const urlCount = await db
        .select()
        .from(urls)
        .where(eq(urls.createdBy, locals.user.id));

      console.log(`URL count for non-premium user: ${urlCount.length}`);

      if (urlCount.length >= URL_LIMIT) {
        console.error(`URL limit exceeded for non-premium user`);
        return json(
          {
            error: `You've reached the ${URL_LIMIT} URL limit. Please upgrade to premium for unlimited URLs.`,
          },
          { status: 400 },
        );
      }
    }

    if (isReservedKeyword(data.slug)) {
      console.error(`Slug is reserved: ${data.slug}`);
      return json(
        { error: "This URL is reserved for system use" },
        { status: 400 },
      );
    }

    const urlData = {
      id: nanoid(8),
      url: data.url,
      slug: data.slug || generateSlug(),
      clicks: 0,
      createdBy: locals.user.id,
      passwordHash: data.password_hash
        ? await hashPassword(data.password_hash, HASH_SECRET)
        : null,
      expiresAt: data.expiration ? convertExpirationToDate(data.expiration) : null,
      expirationUrl: data.expiration_url || null,
      metaTitle: data.meta_title || null,
      metaDescription: data.meta_description || null,
      metaImageUrl: data.meta_image_url || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("⚙️ tags", data.tags);

    console.log(`URL data prepared for creation: ${JSON.stringify(urlData)}`);

    // Create URL record
    const [record] = await db.insert(urls).values(urlData).returning();

    // Handle tags if provided
    if (Array.isArray(data.tags) && data.tags.length > 0) {
      const tagAssociations = data.tags.map((tagId: string) => ({
        urlId: record.id,
        tagId,
      }));
      await db.insert(urlsToTags).values(tagAssociations);
    }

    return json(record);
  } catch (error) {
    console.error("Failed to create URL", error);
    return json({ error: "Failed to create URL" }, { status: 500 });
  }
};
