import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createOrRetrieveStripeCustomer } from "$lib/server/stripe-utils";
import type { UsersResponse } from "$lib/types";
import { createInstance } from "$lib/pocketbase";
import { env } from "$env/dynamic/private";

export const load = (async ({ locals }) => {
  // Redirect to the home page if the user is already authenticated
  if (locals.pb.authStore.isValid) {
    throw redirect(302, "/app");
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
      const authData = await locals.pb
        .collection("users")
        .authWithPassword(email, password);

      // Check if user is verified
      if (!authData.record.verified) {
        // Clear auth store since we don't want unverified users to remain logged in
        locals.pb.authStore.clear();

        // Send another verification email
        await locals.pb.collection("users").requestVerification(email);

        return fail(403, {
          message:
            "Please verify your email address. A new verification email has been sent.",
          unverified: true,
        });
      }
    } catch (err) {
      // Handle authentication failure
      return fail(401, {
        message: "Login failed. Please check your email and password.",
      });
    }

    // Redirect to the home page on successful login
    throw redirect(303, "/app");
  },

  // Action to handle signup form submission
  signup: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log(`Attempting signup with email: ${email}`); // Log for debugging

    // Validate form data
    if (!email || !password) {
      console.error("Missing email or password during signup"); // Log for debugging
      return fail(400, { message: "Please provide both email and password." });
    }

    const pb = createInstance();

    await pb.admins.authWithPassword(
      env.POCKETBASE_ADMIN_EMAIL!,
      env.POCKETBASE_ADMIN_PASSWORD!,
    );

    try {
      // Check if user already exists
      const existingUsers = await pb.collection("users").getList(1, 1, {
        filter: `email = "${email}"`,
      });

      if (existingUsers.items.length > 0) {
        console.log(`User already exists: ${email}`); // Log for debugging
        return fail(400, {
          message:
            "An account with this email already exists. Please login instead.",
        });
      }

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

      console.log(`User created successfully: ${user.email}`); // Log for debugging

      // Request verification for the new user
      await locals.pb.collection("users").requestVerification(user.email);
      console.log(`Verification request sent for: ${user.email}`); // Log for debugging

      // Create or retrieve a Stripe customer for the new user
      await createOrRetrieveStripeCustomer(user);
      console.log(`Stripe customer created or retrieved for: ${user.email}`); // Log for debugging

      // Return success response
      return { success: true };
    } catch (err) {
      console.error(`Signup failed: ${err}`); // Log for debugging
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
