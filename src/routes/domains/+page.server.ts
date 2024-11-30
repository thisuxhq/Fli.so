import { redirect, fail, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { domainSchema } from "$lib/schema/domain";
import { zod } from "sveltekit-superforms/adapters";
import {
  removeCustomDomainFromCloudflare,
  verifyDomain,
} from "$lib/server/domain-verification";
import { nanoid } from "$lib";

export const load = async ({ locals }) => {
  if (!locals.pb.authStore.isValid) {
    throw redirect(302, "/login");
  }

  const domains = await locals.pb.collection("domains").getList(1, 50, {
    filter: `user_id = "${locals.user?.id}"`,
    sort: "-created",
  });

  return {
    domains: domains.items,
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
      await locals.pb.collection("domains").create({
        domain: form.data.domain,
        user_id: locals.user?.id,
        status: "pending",
        verification_token: verificationToken,
        verification_method: form.data.verification_method,
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
      await locals.pb.collection("domains").update(id, {
        status: "verified",
      });
      return { success: true };
    }

    return fail(400, { error: "Verification failed" });
  },

  remove: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get("id") as string;
    const domainName = data.get("domain") as string;
    
    if (!id) {
      return fail(400, { error: "Invalid domain id" });
    }

    try {
      await locals.pb
        .collection("domains")
        .delete(id)
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
