import { fail, error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createOrRetrieveStripeCustomer } from "$lib/server/stripe-utils";
import type { UsersResponse } from "$lib/types";

export const load = (async ({ locals }) => {
  // Redirect to the home page if the user is already authenticated
  if (locals.pb.authStore.isValid) {
    throw redirect(302, "/");
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  // Action to handle login form submission
  login: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate form data
    if (!email || !password) {
      return fail(400, { message: "Please provide both email and password." });
    }

    try {
      // Attempt to authenticate the user
      await locals.pb.collection("users").authWithPassword(email, password);
    } catch (err) {
      // Handle authentication failure
      throw error(
        401,
        "Login failed. Please check your email and password." + err,
      );
    }

    // Redirect to the home page on successful login
    throw redirect(303, "/");
  },

  // Action to handle signup form submission
  signup: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate form data
    if (!email || !password) {
      return fail(400, { message: "Please provide both email and password." });
    }

    try {
      // Create a new user
      const user: UsersResponse = await locals.pb.collection("users").create({
        username:
          email.split("@")[0].length <= 2
            ? `${email.split("@")[0]}-${Math.random().toString(36).slice(2, 11)}`
            : email.split("@")[0],
        email: email,
        password: password,
        passwordConfirm: password,
        name: email.split("@")[0], // Add default name
        emailVisibility: true,
      });

      // Request verification for the new user
      await locals.pb.collection("users").requestVerification(user.email);
      // Create or retrieve a Stripe customer for the new user
      await createOrRetrieveStripeCustomer(user, locals.pb);

      // Return success response
      return { success: true };
    } catch (err) {
      // Handle signup failure
      return fail(400, { message: "Signup failed" });
    }
  },

  forgotPassword: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email) {
      return fail(400, { message: "Please provide an email address." });
    }

    try {
      await locals.pb.collection("users").requestPasswordReset(email);
      return { success: true };
    } catch (err) {
      return fail(400, { message: "Failed to send reset email" });
    }
  },
};
