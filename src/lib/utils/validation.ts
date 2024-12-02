export const RESERVED_KEYWORDS = [
  "app",
  "api",
  "auth",
  "login",
  "register",
  "admin",
  "dashboard",
  "settings",
  "profile",
  "pricing",
  "about",
  "contact",
  "terms",
  "privacy",
  "help",
  "support",
  "docs",
  "documentation",
  "blog",
  "status",
  "health",
  "metrics",
  "saas", // Added for SaaS
  "subscription",
  "billing",
  "payment",
  "plan",
  "pricing",
  "upgrade",
  "downgrade",
  "cancel",
  "partner",
];

export function isReservedKeyword(slug: string): boolean {
  return RESERVED_KEYWORDS.includes(slug.toLowerCase());
}
