import type { RequestHandler } from "./$types";
import { json, redirect } from "@sveltejs/kit";
import { convertExpirationToDate, hashPassword } from "$lib/utils/index";
import { env } from "$env/dynamic/private";
import { isReservedKeyword } from "$lib/utils/validation";
import { generateSlug } from "$lib";

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

  if (isReservedKeyword(slug)) {
    return json(
      { error: "This URL is reserved for system use" },
      { status: 400 },
    );
  }

  try {
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
      ...(data.meta_title !== null && { meta_title: data.meta_title }),
      ...(data.meta_description !== null && {
        meta_description: data.meta_description,
      }),
      ...(data.meta_image_url !== null && {
        meta_image_url: data.meta_image_url,
      }),
      ...(typeof data.password_hash !== "undefined"
        ? {
            password_hash: await hashPassword(data.password_hash, HASH_SECRET),
          }
        : {}),
      ...(data.expiration !== null
        ? { expiration: convertExpirationToDate(data.expiration) }
        : { expiration: null }),
      ...(data.expiration_url !== null
        ? { expiration_url: data.expiration_url }
        : { expiration_url: null }),
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
    const url = await locals.pb.collection("urls").getOne(id);
    if (url.created_by !== locals.user?.id) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    await locals.pb.collection("urls").delete(id);
    return json({ success: true });
  } catch (error) {
    console.error("Failed to delete URL", error);
    return json({ error: "Failed to delete URL" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  const data = await request.json();
  const URL_LIMIT = parseInt(env.PUBLIC_FREE_URL_LIMIT ?? "25");

  try {
    const exists = await locals.pb
      .collection("urls")
      .getFirstListItem(`slug = "${data.slug}"`)
      .catch(() => null);

    if (exists) {
      return json(
        { error: "This custom URL is already taken" },
        { status: 400 },
      );
    }

    // Check URL limit for non-premium users
    const subscription = await locals.pb
      .collection("subscriptions")
      .getFirstListItem(`user_id = "${locals.user?.id}"`)
      .catch(() => null);
    const isPremium = subscription?.status === "active";

    if (!isPremium) {
      const urlCount = await locals.pb.collection("urls").getList(1, 1, {
        filter: `created_by = "${locals.user?.id}"`,
        $cancelKey: locals.user?.id,
      });

      if (urlCount.totalItems >= URL_LIMIT) {
        return json(
          {
            error: `You've reached the ${URL_LIMIT} URL limit. Please upgrade to premium for unlimited URLs.`,
          },
          { status: 400 },
        );
      }
    }

    if (isReservedKeyword(data.slug)) {
      return json(
        { error: "This URL is reserved for system use" },
        { status: 400 },
      );
    }

    const urlData = {
      url: data.url,
      slug: data.slug || generateSlug(),
      clicks: 0,
      created_by: locals.user?.id,
      tags_id: data.tags || [],
      ...(data.password_hash && {
        password_hash: await hashPassword(data.password_hash, env.HASH_SECRET),
      }),
      ...(data.expiration && {
        expiration: convertExpirationToDate(data.expiration),
      }),
      ...(data.expiration_url && { expiration_url: data.expiration_url }),
      ...(data.meta_title && { meta_title: data.meta_title }),
      ...(data.meta_description && { meta_description: data.meta_description }),
      ...(data.meta_image_url && { meta_image_url: data.meta_image_url }),
    };

    const record = await locals.pb.collection("urls").create(urlData);
    return json({
      ...record,
      shortUrl: `https://dun.sh/${record.slug}`,
    });
  } catch (error) {
    console.error("Failed to create URL", error);
    return json({ error: "Failed to create URL" }, { status: 500 });
  }
};
