import { json } from "@sveltejs/kit";
import { stripe } from "$lib/server/stripe";
import type { RequestHandler } from "./$types";
import { createOrRetrieveStripeCustomer } from "$lib/server/stripe-utils";

export const POST: RequestHandler = async ({ request, url, locals }) => {
  try {
    const { priceId } = await request.json();
    const user = locals.user; // Get authenticated user

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create customer
    const customer = await createOrRetrieveStripeCustomer(user);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customer.stripe_customer_id,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/pricing`,
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
