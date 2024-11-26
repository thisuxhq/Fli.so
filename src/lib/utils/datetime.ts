import * as chrono from "chrono-node";

// Converts any date string (including natural language) to ISO format
function convertExpirationToDate(expiration: string): string {
  const referenceDate = new Date();
  const parsed = chrono.parseDate(expiration, referenceDate, { forwardDate: true });
  
  if (!parsed) {
    throw new Error("Invalid date format");
  }

  return parsed.toISOString();
}

// Converts ISO date string to human readable format with time
function convertExpirationToHumanReadable(expiration: string): string {
  const date = new Date(expiration);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
}

export { convertExpirationToDate, convertExpirationToHumanReadable };
