import Stripe from "stripe";
import { env } from "$env/dynamic/private";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-10-28.acacia",
});
