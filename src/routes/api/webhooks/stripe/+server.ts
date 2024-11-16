import { stripe } from "$lib/server/stripe";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, locals }) => {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.log("Webhook error: Missing stripe-signature header");
    throw error(400, "Missing stripe-signature header");
  }

  try {
    console.log("Constructing Stripe webhook event...");
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET!,
    );

    console.log(`Processing webhook event type: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log(`Processing completed checkout session: ${session.id}`);

        // Get or create customer
        console.log(`Looking up customer with Stripe ID: ${session.customer}`);
        let customer = await locals.pb
          .collection("customers")
          .getFirstListItem(`stripe_customer_id="${session.customer}"`)
          .catch(() => null);

        if (!customer) {
          console.log("Customer not found, creating new customer record...");
          customer = await locals.pb.collection("customers").create({
            user_id: session.client_reference_id,
            stripe_customer_id: session.customer,
          });
          console.log(`Created new customer record with ID: ${customer.id}`);
        }

        // Create subscription record
        console.log(`Retrieving subscription details from Stripe...`);
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        console.log(`Creating subscription record in database...`);
        await locals.pb.collection("subscriptions").create({
          user_id: session.client_reference_id,
          customer_id: customer.id,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          plan_name:
            subscription.items.data[0].price.nickname || "Default Plan",
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        console.log(`Subscription record created successfully`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log(`Processing subscription update: ${subscription.id}`);

        console.log(`Looking up existing subscription record...`);
        const existingSub = await locals.pb
          .collection("subscriptions")
          .getFirstListItem(`stripe_subscription_id="${subscription.id}"`);

        console.log(`Updating subscription record...`);
        await locals.pb.collection("subscriptions").update(existingSub.id, {
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        console.log(`Subscription updated successfully`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log(`Processing subscription deletion: ${subscription.id}`);

        console.log(`Looking up existing subscription record...`);
        const existingSub = await locals.pb
          .collection("subscriptions")
          .getFirstListItem(`stripe_subscription_id="${subscription.id}"`);

        console.log(`Marking subscription as canceled...`);
        await locals.pb.collection("subscriptions").update(existingSub.id, {
          status: "canceled",
        });
        console.log(`Subscription marked as canceled successfully`);
        break;
      }
    }

    return json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    throw error(400, "Webhook error");
  }
};
