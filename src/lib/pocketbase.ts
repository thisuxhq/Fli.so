import { env } from "$env/dynamic/public";
import PocketBase, { ClientResponseError } from "pocketbase";
import type { TypedPocketBase } from "./types";
import type { TypedPocketBase as TypedCmsPocketBase } from "./types/cms-generated-types";

export const createInstance = <T extends "app" | "cms">(url: string) => {
  return new PocketBase(url) as T extends "app" ? TypedPocketBase : TypedCmsPocketBase;
};

export const pb = createInstance(env.PUBLIC_POCKETBASE_URL);
export const cmsPb = createInstance(env.PUBLIC_POCKETBASE_CMS_URL);

export function handlePocketBaseError(error: unknown) {
  if (error instanceof ClientResponseError) {
    // Connection refused
    if (error.originalError?.cause?.message?.includes("ECONNREFUSED")) {
      console.error("Cannot connect to PocketBase server");
      return new Error("Database connection failed");
    }

    // Auto-cancelled request
    if (error.isAbort) {
      console.error("Request was auto-cancelled");
      return new Error("Request timeout");
    }

    // Other PocketBase errors
    console.error(`PocketBase error ${error.status}: ${error.message}`);
    return error;
  }

  // Unknown errors
  console.error("Unknown error:", error);
  return new Error("An unexpected error occurred");
}
