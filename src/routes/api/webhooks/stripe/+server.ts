import { stripe } from "$lib/server/stripe";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, locals }) => {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) throw error(400, "Missing stripe-signature header");

  try {
    // Authenticate as admin
    await locals.pb.admins.authWithPassword(
      env.POCKETBASE_ADMIN_EMAIL!,
      env.POCKETBASE_ADMIN_PASSWORD!
    );

    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (!session.customer) break;

        const customer = await locals.pb
          .collection("customers")
          .getFirstListItem(`stripe_customer_id="${session.customer}"`)
          .catch(async () => {
            return await locals.pb.collection("customers").create({
              user_id: session.client_reference_id,
              stripe_customer_id: session.customer,
            });
          });

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ["items.data.price.product"] }
        );

        await locals.pb.collection("subscriptions").create({
          user_id: session.client_reference_id,
          customer_id: customer?.id,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          plan_name: subscription.items.data[0].price.nickname || "Default Plan",
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const existingSub = await locals.pb
          .collection("subscriptions")
          .getFirstListItem(`stripe_subscription_id="${subscription.id}"`)
          .catch((err) => {
            if (err.status === 404) return null;
            throw err;
          });

        if (!existingSub) break;

        await locals.pb.collection("subscriptions").update(existingSub.id, {
          status: subscription.status,
          plan_name: subscription.items.data[0].price.nickname || existingSub.plan_name,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.cancel_at_period_end ? new Date().toISOString() : "",
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const existingSub = await locals.pb
          .collection("subscriptions")
          .getFirstListItem(`stripe_subscription_id="${subscription.id}"`);

        await locals.pb.collection("subscriptions").update(existingSub.id, {
          status: "canceled",
        });
        break;
      }
    }

    return json({ received: true });
  } catch (err) {
    if (err.type?.includes('StripeSignatureVerificationError')) {
      throw error(400, "Invalid Stripe signature");
    }
    throw error(500, err instanceof Error ? err.message : "Unknown error");
  }
};
