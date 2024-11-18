import { json, redirect } from "@sveltejs/kit";
import { stripe } from "$lib/server/stripe";
import type { RequestHandler } from "./$types";
import { createOrRetrieveStripeCustomer } from "$lib/server/stripe-utils";

export const POST: RequestHandler = async ({ request, url, locals }) => {
  try {
    if (!locals.pb.authStore.isValid) {
      throw redirect(303, "/login");
    }

    const { priceId } = await request.json();

    if (!locals.user) {
      throw redirect(303, "/login");
    }

    // Get or create customer
    const customer = await createOrRetrieveStripeCustomer(locals.user);

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
      success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}&token=${locals.pb.authStore.token}`,
      cancel_url: `${url.origin}/pricing`,
      metadata: {
        user_id: locals.user.id,
      },
    });

    return json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
};
