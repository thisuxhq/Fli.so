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
    const plans = await stripe.prices.list({
      product: env.STRIPE_PRODUCT_ID,
    });
    return {
      plans: plans.data,
      tab,
      token,
    };
  } catch (error) {
    console.error("Error retrieving prices:", error);
  }
};
