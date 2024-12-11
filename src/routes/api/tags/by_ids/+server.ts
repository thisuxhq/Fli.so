import { db } from "$lib/server/db";
import { json, type RequestHandler } from "@sveltejs/kit";
import { tags } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { tags_ids } = await request.json();

    if (!tags_ids?.length) {
      return json({ error: "No tags provided" }, { status: 400 });
    }

    const all_tags = await Promise.all(
      tags_ids.map((id: string) =>
        db.select().from(tags).where(eq(tags.id, id)).limit(1),
      ),
    );

    return json(all_tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return json({ error: "Failed to fetch tags" }, { status: 500 });
  }
};
