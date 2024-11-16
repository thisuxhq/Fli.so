import type { PageServerLoad } from "./$types";
// success_url: `${url.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,

export const load: PageServerLoad = async ({ params }) => {
  const { session_id } = params;
  return {
    session_id,
  };
};
