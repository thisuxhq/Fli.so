import { z } from "zod";

export const urlSchema = z.object({
  url: z.string().min(2).max(500),
  slug: z.string().min(2).max(50),
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
