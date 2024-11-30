import { stripe } from "$lib/server/stripe";
import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ url, locals }) => {
  // Check if the user is authenticated
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  // Extract tab and token from URL search parameters
  const tab = url.searchParams.get("tab"); // To persist the tab in the URL

  try {
    // Attempt to find an active subscription for the user in PocketBase
    const subscription = await locals.pb
      .collection("subscriptions")
      .getFirstListItem(
        `user_id = "${locals?.user?.id}" && status = "active"`,
        {
          expand: "user_id",
        },
      );

    // If a subscription is found, return it along with tab and token
    if (subscription) {
      return {
        subscription,
        tab,

        hasSubscription: true,
      };
    }

    // If no subscription is found, fetch available plans from Stripe
    const plans = await stripe.prices.list({
      product: env.STRIPE_PRODUCT_ID,
    });

    // Return plans along with tab and token
    return {
      plans: plans.data,
      tab,
      hasSubscription: false,
    };
  } catch (error) {
    // Handle errors, specifically checking for a 404 error indicating no subscription found
    if (error.status === 404) {
      // Fetch plans from Stripe if no subscription is found
      const plans = await stripe.prices.list({
        product: env.STRIPE_PRODUCT_ID,
      });

      // Return plans along with tab and token
      return {
        plans: plans.data,
        tab,
        hasSubscription: false,
      };
    }

    // Log any other errors and rethrow them
    console.error("Error retrieving subscription/prices:", error);
    throw error;
  }
};
