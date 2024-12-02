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
  created_by: z.string(),
  tags: z.array(z.string()).optional(),
  password_hash: z.string().optional(),
  expiration: z.string().optional(),
  expiration_url: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_image_url: z.string().optional(),
  qr_code: z.string().optional(),
});

export type UrlSchema = typeof urlSchema;
