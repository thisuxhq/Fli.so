import * as chrono from "chrono-node";

// Converts any date string (including natural language) to ISO format in UTC
function convertExpirationToDate(input: string): Date | null {
  if (!input) return null;

  try {
    // If input is already a Date or ISO string, return it
    if (input instanceof Date) return input;
    if (
      typeof input === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(input)
    ) {
      return new Date(input);
    }

    // Parse relative dates using Chrono
    const results = chrono.parse(input);
    if (results.length > 0) {
      const date = results[0].start.date();
      return date;
    }

    return null;
  } catch (error) {
    console.error("Failed to parse date:", error);
    return null;
  }
}

// Converts ISO date string to human-readable format in the user's local timezone
function convertExpirationToHumanReadable(expiration: string): string {
  const date = new Date(expiration);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  });
}

export { convertExpirationToDate, convertExpirationToHumanReadable };
