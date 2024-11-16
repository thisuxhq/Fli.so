import { env } from "$env/dynamic/private";

interface Plan {
  id: string;
  name: string;
  price: number;
  stripe_price_id?: string | null;
  features: string[];
  limits: {
    urls_per_month: number;
    custom_domains: number;
    team_members: number;
  };
}

export const PLANS: Record<string, Plan> = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    features: ["5 URLs/month", "Basic Analytics", "Standard Support"],
    limits: {
      urls_per_month: 5,
      custom_domains: 0,
      team_members: 1,
    },
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: 9,
    stripe_price_id: env.STRIPE_PRO_PRICE_ID,
    features: [
      "Unlimited URLs",
      "Advanced Analytics",
      "Custom Domains",
      "Priority Support",
    ],
    limits: {
      urls_per_month: -1,
      custom_domains: 3,
      team_members: 5,
    },
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    price: 29,
    stripe_price_id: env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Everything in Pro",
      "Unlimited Custom Domains",
      "Team Management",
      "SLA Support",
      "Custom Integration",
    ],
    limits: {
      urls_per_month: -1,
      custom_domains: -1,
      team_members: -1,
    },
  },
};
