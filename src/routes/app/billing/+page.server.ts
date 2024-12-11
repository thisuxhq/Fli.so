import { stripe } from "$lib/server/stripe";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { customers, subscriptions } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load = (async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, "/login");
  }

  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.userId, locals.user.id))
    .limit(1);

  if (!customer.length) {
    return {
      subscription: null,
      portalUrl: null,
    };
  }

  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, locals.user.id))
    .limit(1);

  let portalUrl = null;
  if (customer[0].stripeCustomerId) {
    const { url } = await stripe.billingPortal.sessions.create({
      customer: customer[0].stripeCustomerId,
      return_url: `${env.PUBLIC_APP_URL}/app/billing`,
    });
    portalUrl = url;
  }

  return {
    subscription: subscription[0] || null,
    portalUrl,
  };
}) satisfies PageServerLoad;
