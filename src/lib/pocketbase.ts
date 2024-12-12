import { env } from "$env/dynamic/public";
import PocketBase, { ClientResponseError } from "pocketbase";
import type { TypedPocketBase } from "./types";

export function createInstance() {
  return new PocketBase(env.PUBLIC_POCKETBASE_URL) as TypedPocketBase;
}

export const pb = createInstance() as TypedPocketBase;

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
