<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Globe, Trash } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";

  interface Props {
    domain: {
      id: string;
      domain: string;
      status: "pending" | "verified" | "failed";
      verification_method: "dns" | "file";
      verification_token: string;
    };
  }

  let { domain }: Props = $props();

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    verified: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };
</script>

<div class="relative rounded-2xl border bg-white p-6 shadow-sm">
  <div class="mb-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <Globe class="h-5 w-5 text-muted-foreground" />
      <h3 class="font-medium">{domain.domain}</h3>
    </div>
    <Badge class={statusColors[domain.status]}>
      {domain.status}
    </Badge>
  </div>

  {#if domain.status === "pending" || domain.status === "failed"}
    <div class="mb-4">
      <h4 class="mb-2 font-medium">Verification Instructions</h4>
      {#if domain.verification_method === "dns"}
        <p class="text-sm text-muted-foreground">
          Add this TXT record to your DNS settings:
        </p>
        <p class="mt-2 w-full break-all rounded bg-slate-100 p-2 text-xs">
          {domain.verification_token}
        </p>
      {:else}
        <p class="text-sm text-muted-foreground">
          Create a file at:
          <code class="rounded bg-slate-100 px-1"
            >.well-known/fli-so-verification</code
          >
          with this content:
        </p>
        <pre class="mt-2 w-full break-all rounded bg-slate-100 p-2 text-xs">
          {domain.verification_token}
        </pre>
      {/if}
    </div>

    <form
      method="POST"
      action="?/verify"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "success") {
            toast.success("Domain verified successfully");
          } else {
            toast.error("Verification failed");
          }
        };
      }}
    >
      <input type="hidden" name="id" value={domain.id} />
      <Button type="submit" class="w-full rounded-2xl">Verify Domain</Button>
    </form>
  {/if}

  <form
    method="POST"
    action="?/remove"
    class="absolute right-4 top-4"
    use:enhance={() => {
      return async ({ result }) => {
        if (result.type === "success") {
          toast.success("Domain removed successfully");
        } else {
          toast.error("Failed to remove domain");
        }
      };
    }}
  >
    <input type="hidden" name="id" value={domain.id} />
    <input type="hidden" name="domain" value={domain.domain} />
    <Button
      type="submit"
      variant="ghost"
      size="icon"
      class="h-8 w-8 rounded-full text-muted-foreground hover:text-red-600"
    >
      <Trash class="h-4 w-4" />
    </Button>
  </form>
</div>
