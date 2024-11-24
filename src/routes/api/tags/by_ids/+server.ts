import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const { tags_ids } = await request.json();

    if (!tags_ids?.length) {
      return json({ error: "No tags provided" }, { status: 400 });
    }

    const tags = await Promise.all(
      tags_ids.map((id: string) => locals.pb.collection("tags").getOne(id)),
    );

    return json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return json({ error: "Failed to fetch tags" }, { status: 500 });
  }
};
