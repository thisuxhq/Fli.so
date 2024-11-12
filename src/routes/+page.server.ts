import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { generateSlug } from "$lib";
import { redirect } from "@sveltejs/kit";
import type { UrlsResponseWithTags, TagsResponse } from "$lib/types";

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

    const formData = await request.formData();
    const url = formData.get("url") as string;
    let slug = formData.get("slug") as string;
    const created_by = formData.get("created_by") as string;

    if (!url || !created_by) {
      return fail(400, { message: "URL and created_by are required" });
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

    const tags = formData.getAll("tags") as string[];

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

      await locals.pb.collection("urls").create({
        url,
        slug,
        clicks: 0,
        created_by,
        tags,
      });

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
