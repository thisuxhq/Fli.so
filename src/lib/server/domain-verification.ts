import dns from "dns";
import { promisify } from "util";

const resolveTxt = promisify(dns.resolveTxt);

export async function verifyDomain(domain: {
  domain: string;
  verification_token: string;
  verification_method: "dns" | "file";
}) {
  console.log(`Attempting to verify domain: ${domain.domain} using method: ${domain.verification_method}`);
  if (domain.verification_method === "dns") {
    try {
      const records = await resolveTxt(domain.domain);
      console.log(`DNS records for ${domain.domain}:`, records);
      return records.some((record) =>
        record.some((string) => {
          console.log(`Checking if record matches verification token: ${string === domain.verification_token}`);
          return string === domain.verification_token;
        }),
      );
    } catch (err) {
      console.error("DNS verification failed:", err);
      return false;
    }
  } else {
    try {
      const url = `https://${domain.domain}/.well-known/fli-so-verification`;
      console.log(`Fetching verification file from URL: ${url}`);
      const response = await fetch(url);
      const text = await response.text();
      console.log(`Verification file content: ${text.trim()}`);
      return text.trim() === domain.verification_token;
    } catch (err) {
      console.error("File verification failed:", err);
      return false;
    }
  }
}
