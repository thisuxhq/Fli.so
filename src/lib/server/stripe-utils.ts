import { stripe } from "./stripe";
import { db } from "./db";
import { customers } from "./db/schema";
import { eq } from "drizzle-orm";
import type { User } from "./db/schema";

export async function createOrRetrieveStripeCustomer(user: User) {
  try {
    console.log(
      "Attempting to create or retrieve Stripe customer for user:",
      user.id,
    );

    // Check if customer already exists in database
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, user.id))
      .limit(1);

    if (existingCustomer.length > 0) {
      console.log("Existing customer found for user:", user.id);
      return existingCustomer[0];
    }

    // Create new customer in Stripe
    const stripeCustomer = await stripe.customers.create({
      name: user.username,
      email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    console.log("Stripe customer created successfully:", stripeCustomer.id);

    // Create customer record in database
    const [customer] = await db
      .insert(customers)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        stripeCustomerId: stripeCustomer.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("Customer record created in database:", customer.id);
    return customer;
  } catch (error) {
    console.error("Error in createOrRetrieveStripeCustomer:", error);
    throw error;
  }
}
