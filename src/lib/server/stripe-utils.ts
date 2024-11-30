import { stripe } from "./stripe";
import type { TypedPocketBase } from "$lib/types";
import type { UsersResponse } from "$lib/types";

export async function createOrRetrieveStripeCustomer(user: UsersResponse, pb: TypedPocketBase) {
  try {
    console.log("Attempting to create or retrieve Stripe customer for user:", user.id);
    // Check if customer already exists in PocketBase
    const existingCustomer = await pb
      .collection("customers")
      .getFirstListItem(`user_id="${user.id}"`)
      .catch((error) => {
        console.error("Error fetching existing customer from PocketBase:", error);
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
    const customer = await pb.collection("customers").create({
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
