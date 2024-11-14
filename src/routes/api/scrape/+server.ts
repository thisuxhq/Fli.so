import { json } from "@sveltejs/kit";
import { parse } from "node-html-parser";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    const { url } = await request.json();

    const response = await fetch(url);
    const html = await response.text();

    // Parse HTML
    const root = parse(html);

    // Extract metadata
    const metadata = {
      title:
        root
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") ||
        root.querySelector("title")?.text ||
        "",

      description:
        root
          .querySelector('meta[property="og:description"]')
          ?.getAttribute("content") ||
        root
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") ||
        "",

      imageUrl:
        root
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content") ||
        root.querySelector('link[rel="icon"]')?.getAttribute("href") ||
        "",
    };

    return json(metadata);
  } catch (error) {
    console.error("Error scraping metadata:", error);
    return json({
      title: "",
      description: "",
      imageUrl: "",
    });
  }
};
