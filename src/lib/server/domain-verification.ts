import dns from "dns";
import { promisify } from "util";

const resolveTxt = promisify(dns.resolveTxt);

export async function verifyDomain(domain: {
  domain: string;
  verification_token: string;
  verification_method: "dns" | "file";
}) {
  if (domain.verification_method === "dns") {
    try {
      const records = await resolveTxt(domain.domain);
      return records.some((record) =>
        record.some((string) => string === domain.verification_token),
      );
    } catch (err) {
      console.error("DNS verification failed:", err);
      return false;
    }
  } else {
    try {
      const url = `https://${domain.domain}/.well-known/fli-so-verification`;
      const response = await fetch(url);
      const text = await response.text();
      return text.trim() === domain.verification_token;
    } catch (err) {
      console.error("File verification failed:", err);
      return false;
    }
  }
}
