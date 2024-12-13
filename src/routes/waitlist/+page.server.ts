import { env } from "$env/dynamic/private";
import { createInstance } from "$lib/pocketbase";
import { fail, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get("email")?.toString();
    const message = data.get("message")?.toString();

    if (!email) {
      return fail(400, { error: "Email is required" });
    }

    try {
      const pb = createInstance();
      await pb.admins.authWithPassword(
        env.POCKETBASE_ADMIN_EMAIL!,
        env.POCKETBASE_ADMIN_PASSWORD!,
      );

      const exists = await pb
        .collection("waitlist")
        .getFirstListItem(`email = "${email}"`)
        .catch(() => null);

      if (exists) {
        return fail(400, { error: "Email already registered" });
      }

      await pb.collection("waitlist").create({
        email,
        message,
      });
      return { success: true };
    } catch (error) {
      return fail(500, { error: "Failed to join waitlist" });
    }
  },
} satisfies Actions;
