import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const returnUrl = url.searchParams.get("return_url");
  
  if (!returnUrl) {
    throw redirect(303, "/");
  }

  // Ensure user is still authenticated
  if (!locals.pb.authStore.isValid) {
    throw redirect(303, "/login");
  }

  // Redirect to the return URL while maintaining the session
  throw redirect(303, returnUrl);
}; 