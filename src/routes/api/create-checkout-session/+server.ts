import { json, redirect } from "@sveltejs/kit";
import { stripe } from "$lib/server/stripe";
import type { RequestHandler } from "./$types";
import { createOrRetrieveStripeCustomer } from "$lib/server/stripe-utils";
import type { UsersResponse } from "$lib/types";

export const POST: RequestHandler = async ({ request, url, locals }) => {
  try {
    // Check if the user is authenticated
    if (!locals.pb.authStore.isValid) {
      throw redirect(303, "/login");
    }

    // Extract priceId and tab from the request body
    const { priceId, tab } = await request.json();

    // Ensure the user is logged in
    if (!locals.user) {
      throw redirect(303, "/login");
    }

    // Retrieve or create a Stripe customer for the user
    const customer = await createOrRetrieveStripeCustomer(
      locals.user as UsersResponse,
    );

    // Create a new checkout session for the user
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customer.stripe_customer_id,
      client_reference_id: locals.user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${url.origin}/app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/app/billing?tab=${tab}`,
      metadata: {
        user_id: locals.user.id,
      },
    });

    // Return the URL of the checkout session
    return json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    // Return an error response if checkout session creation fails
    return json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
};
