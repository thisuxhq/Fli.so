import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { generateSlug } from "$lib";
import { redirect } from "@sveltejs/kit";
import type { UrlsResponseWithTags, TagsResponse } from "$lib/types";
import { superValidate } from "sveltekit-superforms";
import { urlSchema } from "$lib/schema/url";
import { zod } from "sveltekit-superforms/adapters";
import { convertExpirationToDate, hashPassword } from "$lib/utils/index";
import { env } from "$env/dynamic/private";


const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  try {
    const [urls, tags] = await Promise.all([
      locals.pb.collection("urls").getFullList<UrlsResponseWithTags[]>({
        expand: "tags_id",
        sort: "-created",
      }),
      locals.pb.collection("tags").getFullList<TagsResponse[]>({
        filter: `created_by = "${locals.user?.id}"`,
        sort: "-created",
      }),
    ]);

    return {
      urls: urls,
      tags: tags,
      user: locals.pb.authStore.model,
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
    if (!locals.pb.authStore.isValid) {
      throw redirect(302, "/login");
    }

    const form = await superValidate(request, zod(urlSchema));

    if (!form.data.slug) {
      form.data.slug = generateSlug();
    }

    if (!/^[a-zA-Z0-9-]+$/.test(form.data.slug)) {
      return fail(400, {
        message: "Slug can only contain letters, numbers, and hyphens",
      });
    }

    try {
      const exists = await locals.pb
        .collection("urls")
        .getFirstListItem(`slug = "${form.data.slug}"`)
        .catch(() => null);

      if (exists) {
        return fail(400, {
          message: "This custom URL is already taken",
        });
      }

      await locals.pb.collection("urls").create({
        url: form.data.url,
        slug: form.data.slug,
        clicks: 0,
        created_by: locals.user?.id,
        tags_id: form.data.tags,
        expiration: form.data.expiration
          ? convertExpirationToDate(form.data.expiration)
          : null,
        expiration_url: form.data.expiration_url
          ? form.data.expiration_url
          : null,
        ...(form.data.password_hash
          ? {
              password_hash: await hashPassword(
                form.data.password_hash,
                HASH_SECRET,
              ),
            }
          : {}),
        ...(form.data.expiration
          ? { expiration: convertExpirationToDate(form.data.expiration) }
          : {}),
        ...(form.data.expiration_url
          ? { expiration_url: form.data.expiration_url }
          : {}),
        ...(form.data.meta_title ? { meta_title: form.data.meta_title } : {}),
        ...(form.data.meta_description
          ? { meta_description: form.data.meta_description }
          : {}),
        ...(form.data.meta_image_url
          ? { meta_image_url: form.data.meta_image_url }
          : {}),
      });

      return {
        form,
        type: "success",
        status: 201,
        message: "URL shortened successfully",
        shortUrl: `https://dun.sh/${form.data.slug}`,
      };
    } catch (error) {
      return fail(500, {
        message: "Failed to create shortened URL: " + error,
      });
    }
  },

  update: async ({ request, locals }) => {
    if (!locals.pb.authStore.isValid) {
      throw redirect(302, "/login");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const slug = formData.get("slug") as string;
    const password = formData.get("password_hash") as string;

    if (!id) {
      return fail(400, { message: "ID is required" });
    }

    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return fail(400, {
        message: "Slug can only contain letters, numbers, and hyphens",
      });
    }

    try {
      const exists = await locals.pb
        .collection("urls")
        .getFirstListItem(`slug = "${slug}" && id != "${id}"`)
        .catch(() => null);

      if (exists) {
        return fail(400, {
          message: "This custom URL is already taken",
        });
      }

      const updateData = {
        url: formData.get("url"),
        slug,
        tags_id: formData.getAll("tags"),
        meta_title: formData.get("meta_title"),
        meta_description: formData.get("meta_description"),
        meta_image_url: formData.get("meta_image_url"),
        ...(password
          ? {
              password_hash: await hashPassword(password, HASH_SECRET),
            }
          : {}),
        ...(formData.get("expiration")
          ? { expiration: convertExpirationToDate(formData.get("expiration") as string) }
          : {}),
        ...(formData.get("expiration_url")
          ? { expiration_url: formData.get("expiration_url") }
          : {}),
      };

      const result = await locals.pb.collection("urls").update(id, updateData);

      return { 
        success: true, 
        data: result,
        message: "URL updated successfully" 
      };
    } catch (error) {
      return fail(400, {
        success: false,
        message: "Failed to update URL: " + error,
      });
    }
  },

  delete: async ({ request, locals }) => {
    if (!locals.pb.authStore.isValid) {
      throw redirect(302, "/login");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const created_by = formData.get("created_by") as string;

    if (!id || !created_by) {
      return fail(400, { message: "ID is required" });
    }

    const url = await locals.pb.collection("urls").getOne(id);
    if (url.created_by !== created_by) {
      return fail(403, { message: "You are not the owner of this URL" });
    }

    await locals.pb.collection("urls").delete(id);

    return {
      type: "success",
      status: 200,
      message: "URL deleted successfully",
    };
  },
  logout: async ({ locals }) => {
    locals.pb.authStore.clear();
    throw redirect(302, "/login");
  },

  create_tag: async ({ request, locals }) => {
    if (!locals.pb.authStore.isValid) {
      throw redirect(302, "/login");
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;

    if (!name || !color) {
      return fail(400, { message: "Name and color are required" });
    }

    try {
      await locals.pb.collection("tags").create({
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
