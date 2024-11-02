import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const { tags_ids }: { tags_ids: string[] } = await request.json();

  try {
    const tags = await locals.pb.collection("tags").getFullList({
      filter: tags_ids.map((id) => `id='${id}'`).join("||"),
    });

    return json(tags);
  } catch (error) {
    console.error("Failed to fetch tags", error);
    return json({ error: "Failed to fetch tags" }, { status: 500 });
  }
};
