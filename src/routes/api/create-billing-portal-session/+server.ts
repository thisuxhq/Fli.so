import { json } from "@sveltejs/kit";
import { stripe } from "$lib/server/stripe";
import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import type { UsersResponse } from "$lib/types";
import { createOrRetrieveStripeCustomer } from "$lib/server/stripe-utils";

export const POST: RequestHandler = async ({ locals, url }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  try {
    // Get or create Stripe customer
    const customer = await createOrRetrieveStripeCustomer(
      locals?.user as UsersResponse,
    );

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer?.stripe_customer_id || "",
      return_url: `${url.origin}/app/billing`,
    });

    return json({ url: session.url });
  } catch (error) {
    console.error("Error creating billing session:", error);
    return json({ error: "Failed to create billing session" }, { status: 500 });
  }
};
