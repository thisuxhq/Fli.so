import type { RequestHandler } from "./$types";
import { json, redirect } from "@sveltejs/kit";
import { convertExpirationToDate, hashPassword } from "$lib/utils/index";
import { env } from "$env/dynamic/private";

export const PUT: RequestHandler = async ({ locals, request }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  const data = await request.json();
  const { id, slug } = data;
  const HASH_SECRET = env.HASH_SECRET || "your-fallback-secret-key";

  if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
    return json(
      { error: "Slug can only contain letters, numbers, and hyphens" },
      { status: 400 },
    );
  }

  try {
    // Check if slug exists but belongs to different URL
    const exists = await locals.pb
      .collection("urls")
      .getFirstListItem(`slug = "${slug}" && id != "${id}"`)
      .catch(() => null);

    if (exists) {
      return json(
        { error: "This custom URL is already taken" },
        { status: 400 },
      );
    }

    const updateData = {
      url: data.url,
      slug: data.slug,
      tags_id: data.tags_id,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      meta_image_url: data.meta_image_url,
      ...(data.password_hash
        ? {
            password_hash: await hashPassword(
              data.password_hash,
              HASH_SECRET,
            ),
          }
        : {}),
      ...(data.expiration
        ? { expiration: convertExpirationToDate(data.expiration) }
        : {}),
      ...(data.expiration_url ? { expiration_url: data.expiration_url } : {}),
    };

    const updatedUrl = await locals.pb
      .collection("urls")
      .update(id, updateData);
    return json(updatedUrl);
  } catch (error) {
    console.error("Failed to update URL", error);
    return json({ error: "Failed to update URL" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  const { id } = await request.json();

  try {
    // check if the user is the owner of the url
    const url = await locals.pb.collection("urls").getOne(id);
    if (url.created_by !== locals.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // delete the url
    await locals.pb.collection("urls").delete(id);
    return json({ success: true });
  } catch (error) {
    console.error("Failed to delete URL", error);
    return json({ error: "Failed to delete URL" }, { status: 500 });
  }
};
