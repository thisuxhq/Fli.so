import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { generateSlug } from "$lib";

export const load: PageServerLoad = async ({ locals }) => {
  const urls = await locals.pb.collection("urls").getFullList();
  return { urls };
};

export const actions: Actions = {
  shorten: async ({ request, locals }) => {
    const formData = await request.formData();
    const url = formData.get("url") as string;
    let slug = formData.get("slug") as string;

    if (!url) {
      return fail(400, { message: "URL is required" });
    }

    // If no custom slug provided, generate one
    if (!slug) {
      slug = generateSlug();
    }

    // Validate slug format
    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return fail(400, {
        message: "Slug can only contain letters, numbers, and hyphens",
      });
    }

    try {
      // Check if slug already exists
      const exists = await locals.pb
        .collection("urls")
        .getFirstListItem(`slug = "${slug}"`)
        .catch(() => null);

      if (exists) {
        return fail(400, {
          message: "This custom URL is already taken",
        });
      }

      await locals.pb.collection("urls").create({ url, slug, clicks: 0 });

      return {
        type: "success",
        status: 201,
        message: "URL shortened successfully",
        shortUrl: `https://dun.sh/${slug}`,
      };
    } catch (error) {
      return fail(500, {
        message: "Failed to create shortened URL: " + error,
      });
    }
  },

  update: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const url = formData.get("url") as string;
    const slug = formData.get("slug") as string;

    if (!id || !url || !slug) {
      return fail(400, { message: "ID, URL, and slug are required" });
    }

    await locals.pb.collection("urls").update(id, { url, slug });

    return {
      type: "success",
      status: 200,
      message: "URL updated successfully",
    };
  },

  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return fail(400, { message: "ID is required" });
    }

    await locals.pb.collection("urls").delete(id);

    return {
      type: "success",
      status: 200,
      message: "URL deleted successfully",
    };
  },
};
