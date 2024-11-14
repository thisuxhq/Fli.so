interface MetadataResponse {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface MetaData {
  title: string;
  description: string;
  imageUrl: string;
}

export async function scrapeMetadata(url: string): Promise<MetaData> {
  if (!url) {
    return { title: "", description: "", imageUrl: "" };
  }

  try {
    const response = await fetch(
      `https://metadata-scraper.spikeysanju.workers.dev?url=${encodeURIComponent(url)}`,
    );

    const data = (await response.json()) as MetadataResponse;

    return {
      title: data.title || "",
      description: data.description || "",
      imageUrl: data.image || "",
    };
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
    return { title: "", description: "", imageUrl: "" };
  }
}
