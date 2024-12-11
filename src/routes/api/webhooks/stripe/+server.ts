import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { stripe } from "$lib/server/stripe";
import { db } from "$lib/server/db";
import { customers, subscriptions } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "$env/dynamic/private";
import { nanoid } from "$lib";

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (!session.customer) break;

        // Find or create customer
        let customer = await db
          .select()
          .from(customers)
          .where(eq(customers.stripeCustomerId, session.customer.toString()))
          .limit(1);

        if (!customer.length) {
          const [customer] = await db
            .insert(customers)
            .values({
              id: nanoid(8),
              userId: session.client_reference_id!,
              stripeCustomerId: session.customer.toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          { expand: ["items.data.price.product"] },
        );

        await db.insert(subscriptions).values({
          id: nanoid(8),
          userId: session.client_reference_id!,
          customerId: customer[0].id,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          planName: subscription.items.data[0].price.nickname || "Default Plan",
          status: subscription.status,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000,
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const existingSub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
          .limit(1);

        if (!existingSub.length) break;

        await db
          .update(subscriptions)
          .set({
            status: subscription.status,
            planName:
              subscription.items.data[0].price.nickname ||
              existingSub[0].planName,
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000,
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.cancel_at_period_end ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, existingSub[0].id));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const existingSub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
          .limit(1);

        if (!existingSub.length) break;

        await db
          .update(subscriptions)
          .set({
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, existingSub[0].id));
        break;
      }
    }

    return json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response("Webhook Error", { status: 400 });
  }
};
