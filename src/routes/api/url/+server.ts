import type { RequestHandler } from "./$types";
import { json, redirect } from "@sveltejs/kit";
import type { UrlsResponseWithTags } from "$lib/types";

export const PUT: RequestHandler = async ({ locals, request }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  const {
    id,
    url,
    slug,
    expand,
    password_hash,
    expiration,
    expiration_url,
    clicks,
    tags_id,
    meta_title,
    meta_description,
    meta_image_url,
    qr_code,
  }: UrlsResponseWithTags = await request.json();

  try {
    const updatedUrl = await locals.pb.collection("urls").update(id, {
      url,
      slug,
      expand,
      expiration,
      expiration_url,
      password_hash,
      clicks,
      tags_id,
      meta_title,
      meta_description,
      meta_image_url,
      qr_code,
    });
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
