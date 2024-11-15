import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { generateSlug } from "$lib";
import { redirect } from "@sveltejs/kit";
import type { UrlsResponseWithTags, TagsResponse } from "$lib/types";
import { superValidate } from "sveltekit-superforms";
import { urlSchema } from "$lib/schema/url";
import { zod } from "sveltekit-superforms/adapters";
import { HMAC } from "@oslojs/crypto/hmac";
import { SHA256 } from "@oslojs/crypto/sha2";
import { convertExpirationToDate } from "$lib/utils/index";
import { env } from "$env/dynamic/private";

const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  try {
    // Fetch URLs and tags from server
    const [urls, tags] = await Promise.all([
      locals.pb.collection("urls").getFullList<UrlsResponseWithTags[]>({
        expand: "tags",
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
    console.error("Failed to fetch URLs and tags:", error);
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

    console.log("Form data for URL shortening:", form.data);

    // If no custom slug provided, generate one
    if (!form.data.slug) {
      form.data.slug = generateSlug();
      console.log("Generated slug for URL:", form.data.slug);
    }

    // Validate slug format
    if (!/^[a-zA-Z0-9-]+$/.test(form.data.slug)) {
      console.error("Slug format is invalid for URL shortening");
      return fail(400, {
        message: "Slug can only contain letters, numbers, and hyphens",
      });
    }

    try {
      // Check if slug already exists
      const exists = await locals.pb
        .collection("urls")
        .getFirstListItem(`slug = "${form.data.slug}"`)
        .catch(() => null);

      if (exists) {
        console.error("Slug already exists for URL shortening");
        return fail(400, {
          message: "This custom URL is already taken",
        });
      }

      console.log(
        "Creating HMAC with SHA256 and HASH_SECRET for password hashing",
      );
      const hasher = new HMAC(SHA256, new TextEncoder().encode(HASH_SECRET));
      console.log("Updating HMAC with password hash for encryption");
      hasher.update(new TextEncoder().encode(form.data.password_hash));
      console.log("Generating digest for password hash encryption");
      const digest = hasher.digest();
      console.log("Digest:", Buffer.from(digest).toString("hex"));

      await locals.pb.collection("urls").create({
        url: form.data.url,
        slug: form.data.slug,
        clicks: 0,
        created_by: locals.user?.id,
        ...(form.data.password_hash
          ? { password_hash: Buffer.from(digest).toString("hex") }
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

      console.log(
        "URL shortened successfully:",
        `https://dun.sh/${form.data.slug}`,
      );
      return {
        form,
        type: "success",
        status: 201,
        message: "URL shortened successfully",
        shortUrl: `https://dun.sh/${form.data.slug}`,
      };
    } catch (error) {
      console.error("Failed to create shortened URL:", error);
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
    const url = formData.get("url") as string;
    const slug = formData.get("slug") as string;
    const created_by = formData.get("created_by") as string;
    const tags = formData.getAll("tags") as string[];

    if (!id || !url || !slug || !created_by) {
      return fail(400, { message: "ID, URL, and slug are required" });
    }

    try {
      await locals.pb.collection("urls").update(id, {
        url,
        slug,
        created_by,
        tags,
      });

      // Fetch the updated record with expanded tags
      const updatedRecord = await locals.pb.collection("urls").getOne(id, {
        expand: "tags",
      });

      return {
        type: "success",
        status: 200,
        message: "URL updated successfully",
        data: updatedRecord,
      };
    } catch (error) {
      console.error("Failed to update URL:", error);
      return fail(500, {
        message: "Failed to update URL",
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

    // check if the user is the owner of the URL
    const url = await locals.pb.collection("urls").getOne(id);
    if (url.created_by !== created_by) {
      return fail(403, { message: "You are not the owner of this URL" });
    }

    // delete the URL
    await locals.pb.collection("urls").delete(id);

    return {
      type: "success",
      status: 200,
      message: "URL deleted successfully",
    };
  },
  logout: async ({ locals }) => {
    await locals.pb.authStore.clear();
    throw redirect(302, "/login");
  },

  createTag: async ({ request, locals }) => {
    if (!locals.pb.authStore.isValid) {
      throw redirect(302, "/login");
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const color = formData.get("color") as string;
    const created_by = formData.get("created_by") as string;

    if (!name || !color) {
      console.error("Missing required fields for creating a tag");
      return fail(400, { message: "Name and color are required" });
    }

    try {
      await locals.pb.collection("tags").create({
        name,
        color,
        created_by: locals.user?.id,
      });

      console.log(`Tag created successfully: ${name}, ${color}, ${created_by}`);
      return {
        type: "success",
        status: 201,
        message: "Tag created successfully",
      };
    } catch (error) {
      console.error(`Failed to create tag: ${error}`);
      return fail(500, {
        message: "Failed to create tag: " + error,
      });
    }
  },
};
