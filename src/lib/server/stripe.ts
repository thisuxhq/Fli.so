import Stripe from "stripe";
import { env } from "$env/dynamic/private";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-10-28.acacia",
});

export const stripeWorker = new Stripe(env.STRIPE_SECRET_KEY, {
  // Cloudflare Workers use the Fetch API for their API requests.
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: "2024-10-28.acacia",
});
