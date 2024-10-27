import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  console.log("Loading", params.slug);

  const url = await locals.pb
    .collection("urls")
    .getFirstListItem(`slug = "${params.slug}"`);

  if (!url) {
    throw error(404, "Not found");
  }

  console.log("Got url", url);

  console.log("Updating clicks", url.clicks + 1);

  await locals.pb.collection("urls").update(url.id, {
    clicks: url.clicks + 1,
  });

  console.log("Updated clicks", url.clicks + 1);

  // redirect to the url
  throw redirect(302, url.url);
};
