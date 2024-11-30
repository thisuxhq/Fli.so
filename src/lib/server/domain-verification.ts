import { env } from "$env/dynamic/private";


export async function verifyDomain(domain) {
  const {
    domain: domainName,
    verification_token,
    verification_method,
  } = domain;

  console.log(
    `Attempting to verify domain: ${domainName} using method: ${verification_method}`,
  );

  let isVerified = false;

  if (verification_method === "dns") {
    try {
      const dnsApiUrl = `https://dns.google/resolve?name=${domainName}&type=TXT`;
      const response = await fetch(dnsApiUrl);
      const data = await response.json();

      if (!data.Answer) {
        console.log("No DNS TXT records found.");
        return false;
      }

      console.log(`DNS records for ${domainName}:`, data.Answer);
      isVerified = data.Answer.some((record) => {
        const recordValue = record.data.replace(/"/g, ""); // Remove quotes around TXT record values
        console.log(
          `Checking if record matches verification token: ${recordValue === verification_token}`,
        );
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
      isVerified = text.trim() === verification_token;
    } catch (err) {
      console.error("File verification failed:", err);
      return false;
    }
  } else {
    console.error("Invalid verification method.");
    return false;
  }

  if (isVerified) {
    console.log(`Domain ${domainName} successfully verified.`);
    const addedToCloudflare = await addCustomDomainToCloudflare(domainName);
    return addedToCloudflare ? true : false;
  } else {
    console.log(`Domain ${domainName} verification failed.`);
    return false;
  }
}

async function addCustomDomainToCloudflare(domainName: string) {
  const url = `${env.CLOUDFLARE_API_URL}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${env.CLOUDFLARE_PROJECT_NAME}/domains`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      },
      body: JSON.stringify({
        name: domainName,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Successfully added ${domainName} to Cloudflare Pages.`);
      return true;
    } else {
      console.error(
        `Failed to add domain to Cloudflare. Error: ${data.errors || data}`,
      );
      return false;
    }
  } catch (err) {
    console.error("Cloudflare API call failed:", err);
    return false;
  }
}
