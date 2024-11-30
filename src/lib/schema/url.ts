import { z } from "zod";

export const urlSchema = z.object({
  url: z
    .string()
    .min(2, "Please enter a valid URL")
    .max(500, "URL is too long"),
  slug: z
    .string()
    .min(2, "Custom URL is too short")
    .max(50, "Custom URL is too long")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "The custom URL can only contain letters, numbers, and hyphens",
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
