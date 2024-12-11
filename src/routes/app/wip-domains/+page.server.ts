import { redirect, fail, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { domainSchema } from "$lib/schema/domain";
import { zod } from "sveltekit-superforms/adapters";
import { db } from "$lib/server/db";
import { domains } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  removeCustomDomainFromCloudflare,
  verifyDomain,
} from "$lib/server/domain-verification";
import { nanoid } from "$lib";

export const load = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(302, "/app/login");
  }

  const all_domains = await db
    .select()
    .from(domains)
    .where(eq(domains.userId, locals.user?.id))
    .orderBy(desc(domains.createdAt));

  return {
    domains: all_domains,
    form: await superValidate(zod(domainSchema)),
  };
};

export const actions: Actions = {
  add: async ({ request, locals }) => {
    const form = await superValidate(request, zod(domainSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const verificationToken = nanoid(32);

    try {
      await db.insert(domains).values({
        domain: form.data.domain,
        userId: locals.user?.id,
        status: "pending",
        verificationToken: verificationToken,
        verificationMethod: form.data.verification_method,
      });

      return { form };
    } catch (err) {
      return fail(400, {
        form,
        error: "Failed to add domain",
      });
    }
  },

  verify: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get("id") as string;

    const domain = await locals.pb.collection("domains").getOne(id);

    if (!domain) {
      return fail(404, { error: "Domain not found" });
    }

    const isVerified = await verifyDomain(domain);

    if (isVerified) {
      await db
        .update(domains)
        .set({
          status: "verified",
        })
        .where(eq(domains.id, id));
      return { success: true };
    }

    return fail(400, { error: "Verification failed" });
  },

  remove: async ({ request }) => {
    const data = await request.formData();
    const id = data.get("id") as string;
    const domainName = data.get("domain") as string;

    if (!id) {
      return fail(400, { error: "Invalid domain id" });
    }

    try {
      await db
        .delete(domains)
        .where(eq(domains.id, id))
        .then(() => {
          console.log("Domain deleted");
          removeCustomDomainFromCloudflare(domainName);
        });
      return { success: true };
    } catch (err) {
      return fail(400, { error: "Failed to remove domain" });
    }
  },
};
