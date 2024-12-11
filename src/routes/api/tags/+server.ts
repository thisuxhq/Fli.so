import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";
import { tags } from "$lib/server/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { nanoid } from "$lib";

export const GET: RequestHandler = async ({ locals }) => {
  try {
    if (!locals.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userTags = await db
      .select()
      .from(tags)
      .where(eq(tags.createdBy, locals.user.id))
      .orderBy(asc(tags.name));

    return json(userTags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return new Response("Failed to fetch tags", { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name || !color) {
      return new Response("Name and color are required", { status: 400 });
    }

    // Check for existing tag
    const existingTag = await db
      .select()
      .from(tags)
      .where(
        and(eq(tags.name, name.trim()), eq(tags.createdBy, locals.user.id)),
      )
      .limit(1);

    if (existingTag.length > 0) {
      return new Response("Tag with this name already exists", { status: 409 });
    }

    // Create new tag
    const [newTag] = await db
      .insert(tags)
      .values({
        id: nanoid(8),
        name: name.trim(),
        color: color.trim(),
        createdBy: locals.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return json(newTag);
  } catch (error) {
    console.error("Error creating tag:", error);
    return new Response("Failed to create tag", { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { id, name, color } = body;

    if (!id || !name || !color) {
      return new Response("Id, name and color are required", { status: 400 });
    }

    // Check if tag exists and belongs to user
    const tag = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    if (tag[0].createdBy !== locals.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if another tag with same name exists for this user
    const existingTags = await db
      .select()
      .from(tags)
      .where(
        and(
          eq(tags.name, name.trim()),
          eq(tags.createdBy, locals.user.id),
          eq(tags.id, id),
        ),
      )
      .limit(1);

    if (existingTags.length > 0) {
      return new Response("Tag with this name already exists", { status: 409 });
    }

    // Updating the tag
    const updatedTag = await db
      .update(tags)
      .set({
        name: name.trim(),
        color: color.trim(),
        updatedAt: new Date(),
      })
      .where(eq(tags.id, id))
      .returning();

    return json(updatedTag[0]);
  } catch (error) {
    console.error("Error updating tag:", error);
    return new Response("Failed to update tag", { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Tag ID is required", { status: 400 });
    }

    // Check if tag exists and belongs to user
    const tag = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    if (tag[0].createdBy !== locals.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Deleting the tag
    await db.delete(tags).where(eq(tags.id, id));

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return new Response("Failed to delete tag", { status: 500 });
  }
};
