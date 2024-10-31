import { fail, error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  if (locals.pb.authStore.isValid) {
    throw redirect(302, "/");
  }
  return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
  login: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return fail(400, { message: "Please provide both email and password." });
    }

    try {
      await locals.pb.collection("users").authWithPassword(email, password);
    } catch (err) {
      console.log("Error: ", err);
      console.log(err);
      throw error(
        401,
        "Login failed. Please check your email and password." + err,
      );
    }

    throw redirect(303, "/"); // Redirect to home page
  },

  signup: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log(email, password);

    if (!email || !password) {
      return fail(400, { message: "Please provide both email and password." });
    }

    try {
      await locals.pb.collection("users").create({
        username: email.split("@")[0],
        email: email,
        password: password,
        passwordConfirm: password,
      });
    } catch (err) {
      console.log("Error: ", err);
    }
  },
};
