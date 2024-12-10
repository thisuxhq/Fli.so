import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createOrRetrieveStripeCustomer } from "$lib/server/stripe-utils";
import { hash, verify } from "@node-rs/argon2";
import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db";
import { eq } from "drizzle-orm";
import { users } from "$lib/server/db/schema";
import { nanoid } from "$lib";

export const load = (async ({ locals }) => {
  // Redirect to the home page if the user is already authenticated
  if (locals.user) {
    return redirect(302, "/app");
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  login: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate form data
    if (!email || !password) {
      return fail(400, { message: "Please provide both email and password." });
    }

    if (!validateEmail(email)) {
      return fail(400, { message: "Invalid email" });
    }
    if (!validatePassword(password)) {
      return fail(400, { message: "Invalid password" });
    }

    const results = await db.select().from(users).where(eq(users.email, email));

    const existingUser = results.at(0);
    if (!existingUser) {
      return fail(400, { message: "Incorrect username or password" });
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    if (!validPassword) {
      return fail(400, { message: "Incorrect username or password" });
    }

    const sessionToken = auth.generateSessionToken();
    const session = await auth.createSession(sessionToken, existingUser.id);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

    return redirect(302, "/app");
  },
  signup: async (event) => {
    const formData = await event.request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!validateEmail(email)) {
      return fail(400, { message: "Invalid email format" });
    }
    if (!validatePassword(password)) {
      return fail(400, {
        message: "Password must be between 6 and 255 characters long",
      });
    }

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUsers.length > 0) {
      return fail(400, {
        message: "An account with this email already exists",
      });
    }

    const userId = nanoid(8);

    console.log("Generating password hash...");
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    console.log("Password hash generated successfully");

    console.log("Creating user in database...");
    const newUser = await db
      .insert(users)
      .values({
        id: userId,
        email: email,
        passwordHash: passwordHash,
        username: email.split("@")[0],
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    console.log("User created successfully:", userId);

    if (!newUser || newUser.length === 0) {
      console.error("User creation failed - no user returned");
      return fail(500, {
        message: "Failed to create user account - database error",
      });
    }

    console.log("Generating session token...");
    const sessionToken = auth.generateSessionToken();
    console.log("Creating session...");
    const session = await auth.createSession(sessionToken, userId);
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
    console.log("Session created successfully");

    // Create Stripe customer
    await createOrRetrieveStripeCustomer(newUser[0]);

    throw redirect(302, "/app");
  },
};

function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.includes("@");
}

function validatePassword(password: unknown): password is string {
  return (
    typeof password === "string" &&
    password.length >= 6 &&
    password.length <= 255
  );
}
