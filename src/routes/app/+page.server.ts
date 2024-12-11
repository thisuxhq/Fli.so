import { generateSlug } from "$lib";
import { redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { urlSchema } from "$lib/schema/url";
import { zod } from "sveltekit-superforms/adapters";
import { convertExpirationToDate, hashPassword } from "$lib/utils/index";
import { env } from "$env/dynamic/private";
import { isReservedKeyword } from "$lib/utils/validation";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { generateSlug, nanoid } from "$lib";
import { redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { urlSchema } from "$lib/schema/url";
import { zod } from "sveltekit-superforms/adapters";
import { convertExpirationToDate, hashPassword } from "$lib/utils/index";
import { env } from "$env/dynamic/private";
import { isReservedKeyword } from "$lib/utils/validation";
import { db } from "$lib/server/db";
import { subscriptions, tags, urls, urlsToTags } from "$lib/server/db/schema";
import { and, desc, eq } from "drizzle-orm";

const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, "/app/login");
  }

  try {
    const [urlsWithTags, tagsData, userWithSubscription] = await Promise.all([
      db.query.urls.findMany({
        with: {
          tags: {
            with: {
              tag: true,
            },
          },
        },
      }),
      db
        .select()
        .from(tags)
        .where(eq(tags.createdBy, locals.user.id))
        .orderBy(desc(tags.createdAt)),
      db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, locals.user.id))
        .orderBy(desc(subscriptions.createdAt)),
    ]);

    console.log("userWithSubscription", userWithSubscription);
    console.log("tagsData", tagsData);
    console.log("locals.user", locals.user);
    console.log("urlsWithTags", urlsWithTags);

    return {
      urls: urlsWithTags,
      tags: tagsData,
      user: locals.user,
      userWithSubscription,
      totalUrls: urlsWithTags.length || 0,
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
      // Check if slug exists
      const existingUrl = await db
        .select()
        .from(urls)
        .where(eq(urls.slug, form.data.slug))
        .limit(1);

      if (existingUrl.length > 0) {
        return fail(400, {
          form,
          message: "This custom URL is already taken",
        });
      }

      const URL_LIMIT = parseInt(env.PUBLIC_FREE_URL_LIMIT ?? "25");
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, locals.user.id))
        .limit(1);

      const isPremium = subscription[0]?.status === "active";

      if (!isPremium) {
        const urlCount = await db
          .select()
          .from(urls)
          .where(eq(urls.createdBy, locals.user.id));

        if (urlCount.length >= URL_LIMIT) {
          return fail(400, {
            message: `You've reached the ${URL_LIMIT} URL limit. Please upgrade to premium for unlimited URLs.`,
          });
        }
      }

      const urlData = {
        id: nanoid(8),
        url: form.data.url,
        slug: form.data.slug || generateSlug(),
        clicks: 0,
        createdBy: locals.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(form.data.password_hash && {
          passwordHash: await hashPassword(
            form.data.password_hash,
            HASH_SECRET,
          ),
        }),
        ...(form.data.expiration && {
          expiresAt: convertExpirationToDate(form.data.expiration),
        }),
        ...(form.data.expiration_url && {
          expirationUrl: form.data.expiration_url,
        }),
        ...(form.data.meta_title && {
          metaTitle: form.data.meta_title,
        }),
        ...(form.data.meta_description && {
          metaDescription: form.data.meta_description,
        }),
        ...(form.data.meta_image_url && {
          metaImageUrl: form.data.meta_image_url,
        }),
      };

      if (isReservedKeyword(urlData.slug)) {
        return fail(400, {
          form,
          message: "This URL is reserved for system use",
        });
      }

      const [record] = await db.insert(urls).values(urlData).returning();

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
      const [existingUrl] = await db
        .select()
        .from(urls)
        .where(and(eq(urls.id, id), eq(urls.createdBy, locals.user.id)));

      if (!existingUrl) {
        return fail(403, { message: "You are not the owner of this URL" });
      }

      const updateData = {
        url: formData.get("url") as string,
        slug,
        updatedAt: new Date(),
        ...(password && {
          passwordHash: await hashPassword(password, HASH_SECRET),
        }),
        ...(expiration && {
          expiresAt: convertExpirationToDate(expiration),
        }),
        ...(expiration_url && {
          expirationUrl: expiration_url,
        }),
        ...(formData.get("meta_title") && {
          metaTitle: formData.get("meta_title") as string,
        }),
        ...(formData.get("meta_description") && {
          metaDescription: formData.get("meta_description") as string,
        }),
        ...(formData.get("meta_image_url") && {
          metaImageUrl: formData.get("meta_image_url") as string,
        }),
      };

      const [result] = await db
        .update(urls)
        .set(updateData)
        .where(eq(urls.id, id))
        .returning();

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

    try {
      const [url] = await db
        .select()
        .from(urls)
        .where(and(eq(urls.id, id), eq(urls.createdBy, locals.user.id)));

      if (!url) {
        return fail(403, { message: "You are not the owner of this URL" });
      }

      await db.delete(urls).where(eq(urls.id, id));

      return {
        type: "success",
        status: 200,
        message: "URL deleted successfully",
      };
    } catch (error) {
      return fail(500, {
        message: "Failed to delete URL",
      });
    }
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
        id: crypto.randomUUID(),
        name,
        color,
        createdBy: locals.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
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
