import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { generateSlug } from "$lib";
import { redirect } from "@sveltejs/kit";
import type {
  UrlsResponseWithTags,
  TagsResponse,
  SubscriptionsResponse,
} from "$lib/types";
import { superValidate } from "sveltekit-superforms";
import { urlSchema } from "$lib/schema/url";
import { zod } from "sveltekit-superforms/adapters";
import { convertExpirationToDate, hashPassword } from "$lib/utils/index";
import { env } from "$env/dynamic/private";
import { isReservedKeyword } from "$lib/utils/validation";
import { db } from "$lib/server/db";
import { subscriptions, tags, urls } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, "/app/login");
  }

  try {
    const [urls, tags, userWithSubscription] = await Promise.all([
      db.collection("urls").getFullList<UrlsResponseWithTags[]>({
        expand: "tags_id",
        sort: "-created",
      }),
      db.collection("tags").getFullList<TagsResponse[]>({
        filter: `created_by = "${locals.user?.id}"`,
        sort: "-created",
      }),
      db.collection("subscriptions").getFullList<SubscriptionsResponse[]>({
        filter: `user_id = "${locals.user?.id}"`,
        sort: "-created",
      }),
    ]);

    return {
      urls,
      tags,
      user: locals.user,
      userWithSubscription,
      totalUrls: urls.length || 0,
      form: await superValidate(zod(urlSchema)),
    };
  } catch (error) {
    return {
      error: "Failed to fetch URLs and tags",
    };
  }
};

export const actions: Actions = {
  shorten: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(302, "/app/login");
    }

    const form = await superValidate(request, zod(urlSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const exists = await db
        .select()
        .from(urls)
        .where(eq(urls.slug, form.data.slug))
        .catch(() => null);

      if (exists) {
        return fail(400, {
          form,
          message: "This custom URL is already taken",
        });
      }

      const URL_LIMIT = parseInt(env.PUBLIC_FREE_URL_LIMIT ?? "25");
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, locals.user?.id))
        .catch(() => null);

      const isPremium = subscription?.status === "active";

      if (!isPremium) {
        const urlCount = await db
          .select()
          .from(urls)
          .where(eq(urls.createdBy, locals.user?.id));

        if (urlCount.length >= URL_LIMIT) {
          return fail(400, {
            message: `You've reached the ${URL_LIMIT} URL limit. Please upgrade to premium for unlimited URLs.`,
          });
        }
      }

      const urlData = {
        url: form.data.url,
        slug: form.data.slug || generateSlug(),
        clicks: 0,
        createdBy: locals.user?.id,
        tagsId: form.data.tags || [],
      };

      if (form.data.password_hash) {
        urlData.passwordHash = await hashPassword(
          form.data.password_hash,
          HASH_SECRET,
        );
      }
      if (form.data.expiration) {
        urlData.expiresAt = convertExpirationToDate(form.data.expiration);
      }
      if (form.data.expiration_url) {
        urlData.expirationUrl = form.data.expiration_url;
      }
      if (form.data.meta_title) {
        urlData.metaTitle = form.data.meta_title;
      }
      if (form.data.meta_description) {
        urlData.metaDescription = form.data.meta_description;
      }
      if (form.data.meta_image_url) {
        urlData.metaImageUrl = form.data.meta_image_url;
      }

      if (isReservedKeyword(form.data.slug)) {
        return fail(400, {
          form,
          message: "This URL is reserved for system use",
        });
      }

      const record = await db.insert(urls).values(urlData).returning();

      return {
        form,
        type: "success",
        status: 201,
        message: "URL shortened successfully",
        shortUrl: `https://dun.sh/${record.slug}`,
      };
    } catch (error) {
      console.error("Error creating URL:", error);
      return fail(500, {
        form,
        message: "Failed to create shortened URL. Please try again.",
      });
    }
  },

  update: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(302, "/app/login");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const slug = formData.get("slug") as string;
    const password = formData.get("password_hash") as string;
    const expiration = formData.get("expiration") as string;
    const expiration_url = formData.get("expiration_url") as string;

    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return fail(400, {
        message: "Slug can only contain letters, numbers, and hyphens",
      });
    }

    try {
      // check url exist and owner of the url
      const url = await db.select().from(urls).where(eq(urls.id, id));

      if (url[0].createdBy !== locals.user?.id) {
        return fail(403, { message: "You are not the owner of this URL" });
      }

      const updateData: typeof urls.$inferInsert = {
        url: formData.get("url"),
        slug,
        tagsId: formData.getAll("tags"),
        metaTitle: formData.get("meta_title"),
        metaDescription: formData.get("meta_description"),
        metaImageUrl: formData.get("meta_image_url"),
        ...(password !== undefined
          ? {
              passwordHash: await hashPassword(password, HASH_SECRET),
            }
          : {}),
        ...(expiration
          ? {
              expiresAt: convertExpirationToDate(expiration),
            }
          : {}),
        ...(expiration_url ? { expirationUrl: expiration_url } : {}),
      };

      if (isReservedKeyword(slug)) {
        return fail(400, {
          message: "This URL is reserved for system use",
        });
      }

      const result = await db
        .update(urls)
        .set(updateData)
        .where(eq(urls.id, id));

      return {
        success: true,
        data: result,
        message: "URL updated successfully",
      };
    } catch (error) {
      return fail(400, {
        success: false,
        message: "Failed to update URL: " + error,
      });
    }
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(302, "/app/login");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const created_by = formData.get("created_by") as string;

    if (!id || !created_by) {
      return fail(400, { message: "ID is required" });
    }

    // check if the user is the owner of the URL
    const url = await db.select().from(urls).where(eq(urls.id, id));

    if (url[0].createdBy !== created_by) {
      return fail(403, { message: "You are not the owner of this URL" });
    }

    await db.delete(urls).where(eq(urls.id, id));

    return {
      type: "success",
      status: 200,
      message: "URL deleted successfully",
    };
  },

  logout: async ({ locals }) => {
    locals.user = null;
    throw redirect(302, "/app/login");
  },

  create_tag: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(302, "/app/login");
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;

    if (!name || !color) {
      return fail(400, { message: "Name and color are required" });
    }

    try {
      await db.insert(tags).values({
        name,
        color,
        created_by: locals.user?.id,
      });

      return {
        type: "success",
        status: 201,
        message: "Tag created successfully",
      };
    } catch (error) {
      return fail(500, {
        message: "Failed to create tag: " + error,
      });
    }
  },
};
