import { stripe } from "./stripe";
import type { UsersResponse } from "$lib/types";
import { env } from "$env/dynamic/private";

export async function createOrRetrieveStripeCustomer(
  user: UsersResponse,
  locals: any,
) {
  try {
    console.log(
      "Attempting to create or retrieve Stripe customer for user:",
      user.id,
    );

    // Create new pocketbase client as admin
    // Authenticate as admin
    await locals.pb.admins.authWithPassword(
      env.POCKETBASE_ADMIN_EMAIL!,
      env.POCKETBASE_ADMIN_PASSWORD!,
    );

    // Check if customer already exists in PocketBase
    const existingCustomer = await locals.pb
      .collection("customers")
      .getFirstListItem(`user_id="${user.id}"`)
      .catch(() => {
        console.log("No customer found for user:", user.id);
        return null;
      });

    if (existingCustomer) {
      console.log("Existing customer found for user:", user.id);
      return existingCustomer;
    }

    // Create new customer in Stripe
    const stripeCustomer = await stripe.customers.create({
      name: user.name,
      email: user.email,
      metadata: {
        pocketbaseUserId: user.id,
      },
    });

    console.log("Stripe customer created successfully:", stripeCustomer.id);

    // Create customer record in PocketBase using authenticated client
    const customer = await locals.pb.collection("customers").create({
      user_id: user.id,
      stripe_customer_id: stripeCustomer.id,
    });

    console.log("Customer record created in PocketBase:", customer.id);
    return customer;
  } catch (error) {
    console.error("Error in createOrRetrieveStripeCustomer:", error);
    throw error;
  }
}
