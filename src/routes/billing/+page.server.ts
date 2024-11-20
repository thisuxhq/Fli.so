import { stripe } from "$lib/server/stripe";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url, locals }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  const tab = url.searchParams.get("tab");
  const token = url.searchParams.get("token");

  try {
    // Check for subscription in PocketBase
    const subscription = await locals.pb
      .collection("subscriptions")
      .getFirstListItem(
        `user_id = "${locals?.user?.id}" && status = "active"`,
        {
          expand: "user_id",
        },
      );

    if (subscription) {
      return {
        subscription,
        tab,
        token,
        hasSubscription: true,
      };
    }

    // If no subscription found, return plans
    const plans = await stripe.prices.list({
      product: env.STRIPE_PRODUCT_ID,
    });

    return {
      plans: plans.data,
      tab,
      token,
      hasSubscription: false,
    };
  } catch (error) {
    // If error is 404 (no subscription found), return plans
    if (error.status === 404) {
      const plans = await stripe.prices.list({
        product: env.STRIPE_PRODUCT_ID,
      });

      return {
        plans: plans.data,
        tab,
        token,
        hasSubscription: false,
      };
    }

    console.error("Error retrieving subscription/prices:", error);
    throw error;
  }
};
