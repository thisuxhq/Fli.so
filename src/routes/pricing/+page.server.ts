import { stripe } from "$lib/server/stripe";
import type { PageServerLoad } from "./$types";

interface StripePlan {
  id: string;
  name: string;
  price: number;
  stripe_price_id: string;
  features: string[];
  interval: string;
}

export const load: PageServerLoad = async () => {
  const { data: products } = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  const plans = products.reduce<Record<string, StripePlan>>((acc, product) => {
    const price = product.default_price as Stripe.Price;

    acc[product.name.toUpperCase()] = {
      id: product.id,
      name: product.name,
      price: price.unit_amount! / 100,
      stripe_price_id: price.id,
      features: product.features || [],
      interval: price.recurring?.interval || "month",
    };

    return acc;
  }, {});

  return { plans };
};
