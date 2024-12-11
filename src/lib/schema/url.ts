import { isReservedKeyword } from '$lib/utils/validation';
import { z } from "zod";

export const urlSchema = z.object({
  url: z
    .string()
    .min(2, "Please enter a valid URL")
    .max(500, "URL is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-zA-Z0-9-]+$/, "Only letters, numbers, and hyphens are allowed")
    .refine(
      (slug) => !isReservedKeyword(slug),
      "This URL is reserved for system use"
    ),
  createdBy: z.string(),
  tags: z.array(z.string()).optional(),
  passwordHash: z.string().optional(),
  expiresAt: z.string().optional(),
  expirationUrl: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaImageUrl: z.string().optional(),
  qrCode: z.string().optional(),
});

export type UrlSchema = typeof urlSchema;
