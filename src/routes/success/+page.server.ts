import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const session_id = url.searchParams.get("session_id");

  if (!session_id) {
    return {
      status: 400,
      body: {
        error: "session_id is required",
      },
    };
  }

  return {
    session_id,
  };
};
