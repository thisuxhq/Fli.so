import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!params.slug) {
    throw error(400, "Slug is required");
  }

  const url = await locals.pb
    .collection("urls")
    .getFirstListItem(`slug = "${params.slug}"`);

  if (!url) {
    throw error(404, "Not found");
  }

  await locals.pb.collection("urls").update(url.id, {
    clicks: url.clicks + 1,
  });

  // redirect to the url
  throw redirect(302, url.url);
};
