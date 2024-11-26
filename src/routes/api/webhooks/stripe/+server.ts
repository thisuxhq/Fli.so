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
    // Add logging before admin auth
    console.log("Starting webhook processing...");
    
    // Authenticate as admin FIRST before any operations
    try {
      await locals.pb.admins.authWithPassword(
        env.POCKETBASE_ADMIN_EMAIL!,
        env.POCKETBASE_ADMIN_PASSWORD!
      );
      console.log("Admin authentication successful");
    } catch (authError) {
      console.error("Admin authentication failed:", authError);
      throw error(500, "Admin authentication failed");
    }

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

        if (!session.customer) {
          console.log("No customer found in session - skipping");
          break;
        }

        // Now we're authenticated as admin, this should work
        console.log(`Looking up customer with Stripe ID: ${session.customer}`);
        let customer = await locals.pb
          .collection("customers")
          .getFirstListItem(`stripe_customer_id="${session.customer}"`)
          .catch(() => null);

        console.log("Customer with stripe ID", customer);

        if (!customer) {
          console.log("Customer not found, creating new customer record...");
          customer = await locals.pb.collection("customers").create({
            user_id: session.client_reference_id,
            stripe_customer_id: session.customer,
          });
          console.log(`Created new customer record with ID: ${customer?.id}`);
        }

        // Create subscription record
        console.log(`Retrieving subscription details from Stripe...`);
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          {
            expand: ["items.data.price.product"],
          },
        );

        console.log(`Creating subscription record in database...`);
        await locals.pb.collection("subscriptions").create({
          user_id: session.client_reference_id,
          customer_id: customer?.id,
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

        try {
          console.log(`Looking up existing subscription record...`);
          const existingSub = await locals.pb
            .collection("subscriptions")
            .getFirstListItem(`stripe_subscription_id="${subscription.id}"`);

          console.log(`Updating subscription record...`);

          console.log(
            "subscription",
            subscription.items.data[0].price.nickname || existingSub.plan_name,
          );
          console.log(
            "cancel_at_period_end",
            subscription.cancel_at_period_end,
          );

          console.log("status of subscription", subscription.status);

          const updateData = {
            status: subscription.status,
            plan_name:
              subscription.items.data[0].price.nickname ||
              existingSub.plan_name,
            current_period_start: new Date(
              subscription.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.cancel_at_period_end
              ? new Date().toISOString() // If cancel_at_period_end is set, set canceled_at to now
              : "",
          };

          console.log("Update data:", updateData);

          try {
            const updated = await locals.pb
              .collection("subscriptions")
              .update(existingSub.id, updateData);
            console.log("Update successful:", updated);
          } catch (updateError) {
            console.error("Update failed:", updateError);
            throw updateError;
          }
        } catch (err) {
          // Only log the error if subscription not found, don't create a new one
          if (err.status === 404) {
            console.log("Subscription not found for update - skipping");
          } else {
            throw err; // Re-throw if it's not a 404 error
          }
        }
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
    console.error("Error processing webhook:", {
      error: err,
      message: err.message,
      stack: err.stack,
      status: err.status,
      data: err.data
    });
    
    // Return more specific error messages
    if (err.type?.includes('StripeSignatureVerificationError')) {
      throw error(400, "Invalid Stripe signature");
    }
    
    throw error(500, `Webhook error: ${err.message}`);
  }
};
