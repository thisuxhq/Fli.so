import { fail, error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createOrRetrieveStripeCustomer } from "$lib/server/stripe-utils";
import type { UsersResponse } from "$lib/types";

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
      console.log("Logged in");
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

    console.log("Creating user");

    try {
      console.log("Attempting to create user with email:", email);
      const user: UsersResponse = await locals.pb.collection("users").create({
        username: email.split("@")[0].length <= 2 ? `${email.split("@")[0]}-${Math.random().toString(36).slice(2, 11)}` : email.split("@")[0],
        email: email,
        password: password,
        passwordConfirm: password,
        name: email.split("@")[0], // Add default name
        emailVisibility: true,
      });

      console.log("User created successfully:", user);

      console.log("Requesting verification for user:", user.email);
      await locals.pb.collection("users").requestVerification(user.email);
      console.log("Verification request sent for user:", user.email);

      console.log("Creating Stripe customer for user:", user.email);
      await createOrRetrieveStripeCustomer(user, locals.pb);
      console.log("Stripe customer created for user:", user.email);

      console.log("Signed up user:", user);
      
      return { success: true };
      
    } catch (err) {
      console.error("Error during signup:", err);
      return fail(400, { message: "Signup failed" });
    }
  },
};
