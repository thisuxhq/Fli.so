import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pb } from '$lib/pocketbase';

export const GET: RequestHandler = async ({ locals }) => {
  try {
    if (!locals.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const tags = await pb.collection('tags').getFullList({
      sort: 'name',
      filter: `created_by = "${locals.user.id}"`,
      expand: 'created_by'
    });

    return json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return new Response('Failed to fetch tags', { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name || !color) {
      return new Response('Name and color are required', { status: 400 });
    }

    // Check if tag with same name already exists for this user
    const existingTags = await pb.collection('tags').getFullList({
      filter: `name = "${name}" && created_by = "${locals.user.id}"`
    });

    if (existingTags.length > 0) {
      return new Response('Tag with this name already exists', { status: 409 });
    }

    const tag = await pb.collection('tags').create({
      name,
      color,
      created_by: locals.user.id
    });

    return json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    return new Response('Failed to create tag', { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { id, name, color } = body;

    if (!id || !name || !color) {
      return new Response('Id, name and color are required', { status: 400 });
    }

    // Check if tag exists and belongs to user
    const tag = await pb.collection('tags').getOne(id);
    if (tag.created_by !== locals.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Check if another tag with same name exists for this user
    const existingTags = await pb.collection('tags').getFullList({
      filter: `name = "${name}" && created_by = "${locals.user.id}" && id != "${id}"`
    });

    if (existingTags.length > 0) {
      return new Response('Tag with this name already exists', { status: 409 });
    }

    const updatedTag = await pb.collection('tags').update(id, {
      name,
      color
    });

    return json(updatedTag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return new Response('Failed to update tag', { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    if (!locals.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response('Tag ID is required', { status: 400 });
    }

    // Check if tag exists and belongs to user
    const tag = await pb.collection('tags').getOne(id);
    if (tag.created_by !== locals.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await pb.collection('tags').delete(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return new Response('Failed to delete tag', { status: 500 });
  }
};
