import type { Handle, HandleClientError } from "@sveltejs/kit";
import PocketBase from "pocketbase";
import { dev } from "$app/environment";
import { env } from "$env/dynamic/public";

// Create a singleton instance
export const pbClient = new PocketBase(
  dev ? "http://localhost:8090" : env.PUBLIC_POCKETBASE_URL,
);

export const handleError: HandleClientError = async ({ error }) => {
  // Handle client-side errors here
  console.error("Client error:", error);
  return {
    message: "An unexpected error occurred",
  };
};

export const handle: Handle = async ({ event, resolve }) => {
  // Initialize PB auth only on client side
  if (typeof window !== "undefined") {
    pbClient.authStore.loadFromCookie(document.cookie);
    pbClient.authStore.onChange(() => {
      document.cookie = pbClient.authStore.exportToCookie({ httpOnly: false });
    });
  }

  return await resolve(event);
};
