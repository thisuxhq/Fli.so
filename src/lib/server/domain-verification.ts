export async function verifyDomain(domain) {
  const { domain: domainName, verification_token, verification_method } = domain;

  console.log(`Attempting to verify domain: ${domainName} using method: ${verification_method}`);

  if (verification_method === "dns") {
    try {
      // Use an external DNS resolution API, e.g., Google's DNS API
      const dnsApiUrl = `https://dns.google/resolve?name=${domainName}&type=TXT`;
      const response = await fetch(dnsApiUrl);
      const data = await response.json();

      if (!data.Answer) {
        console.log("No DNS TXT records found.");
        return false;
      }

      console.log(`DNS records for ${domainName}:`, data.Answer);
      return data.Answer.some((record) => {
        const recordValue = record.data.replace(/"/g, ""); // Remove quotes around TXT record values
        console.log(`Checking if record matches verification token: ${recordValue === verification_token}`);
        return recordValue === verification_token;
      });
    } catch (err) {
      console.error("DNS verification failed:", err);
      return false;
    }
  } else if (verification_method === "file") {
    try {
      const url = `https://${domainName}/.well-known/fli-so-verification`;
      console.log(`Fetching verification file from URL: ${url}`);
      const response = await fetch(url);
      const text = await response.text();
      console.log(`Verification file content: ${text.trim()}`);
      return text.trim() === verification_token;
    } catch (err) {
      console.error("File verification failed:", err);
      return false;
    }
  } else {
    console.error("Invalid verification method.");
    return false;
  }
}
