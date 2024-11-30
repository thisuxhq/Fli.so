import { z } from "zod";

export const domainSchema = z.object({
  domain: z
      .string()
    .min(2, "Please enter a valid URL")
    .max(500, "URL is too long"),
  user_id: z.string(),
  status: z.enum(['pending', 'verified', 'failed']),
  verification_token: z.string(),
  verification_method: z.enum(['dns', 'file']),
  created: z.string(),
  updated: z.string()
});

export type DomainSchema = typeof domainSchema;
