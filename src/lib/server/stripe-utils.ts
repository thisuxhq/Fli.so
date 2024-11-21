import { stripe } from "./stripe";
import type { TypedPocketBase } from "$lib/types";
import type { UsersResponse } from "$lib/types";

export async function createOrRetrieveStripeCustomer(user: UsersResponse, pb: TypedPocketBase) {
  try {
    // Check if customer already exists in PocketBase
    const existingCustomer = await pb
      .collection("customers")
      .getFirstListItem(`user_id="${user.id}"`)
      .catch(() => null);

    if (existingCustomer) {
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

    // Create customer record in PocketBase using authenticated client
    const customer = await pb.collection("customers").create({
      user_id: user.id,
      stripe_customer_id: stripeCustomer.id,
    });

    return customer;
  } catch (error) {
    console.error("Error in createOrRetrieveStripeCustomer:", error);
    throw error;
  }
}
