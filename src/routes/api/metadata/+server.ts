import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import getMetaData from "metadata-scraper";

export const GET: RequestHandler = async ({ url }) => {
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const data = await getMetaData(targetUrl);

    return json({
      title: data.title || "",
      description: data.description || "",
      image: data.image || "",
    });
  } catch (error) {
    console.error("Error scraping metadata:", error);
    return json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
};
