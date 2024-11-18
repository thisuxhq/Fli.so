import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
  const body = await request.json();
  console.log("Request body:", body);

  if (!body.tags_ids || !Array.isArray(body.tags_ids)) {
    console.error("Invalid or missing tags_ids");
    return json({ error: "Invalid or missing tags_ids" }, { status: 400 });
  }

  const { tags_ids } = body;
  console.log("Tags IDs:", tags_ids);

  try {
    const tags = await locals.pb.collection("tags").getFullList({
      filter: tags_ids.map((id: string) => `id='${id}'`).join("||"),
    });
    console.log("Fetched tags:", tags);

    return json(tags);
  } catch (error) {
    console.error("Failed to fetch tags", error);
    return json({ error: "Failed to fetch tags" }, { status: 500 });
  }
};
