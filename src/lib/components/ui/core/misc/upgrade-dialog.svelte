<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { Check, Loader2 } from "lucide-svelte";

  let { open = false, onOpenChange } = $props<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>();

  let isLoading = $state(false);

  const features = [
    "Unlimited URLs",
    "Custom domains",
    "Advanced analytics",
    "Priority support",
    "Password protection",
    "Custom QR codes",
  ];

  async function handleSubscribe() {
    try {
      isLoading = true;

      // Create a checkout session for monthly plan
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tab: "monthly",
        }),
      });

      const result = await response.json();

      // Redirect to the checkout URL if successful
      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Checkout process failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Checkout process failed");
    } finally {
      isLoading = false;
    }
  }
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="p-0 sm:max-w-lg">
    <div
      class="relative rounded-3xl bg-white/80 p-6 shadow-mild backdrop-blur-sm dark:bg-slate-800/80"
    >
      <div
        class="absolute -top-3 left-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white"
      >
        Hurry, Ending Soon
      </div>

      <Dialog.Header class="gap-2">
        <Dialog.Title>
          <p class="text-lg font-medium text-muted-foreground">
            You've reached your limit!
          </p>
          <h1 class="text-2xl font-medium">
            Upgrade to keep creating short links
          </h1>
        </Dialog.Title>
      </Dialog.Header>

      <div class="my-3 space-y-6">
        <div>
          <h3 class="mb-2 text-lg font-medium">
            Unlock Pro features for just $9/month:
          </h3>
          <ul class="space-y-3">
            {#each features as feature}
              <li class="flex items-center">
                <Check class="mr-2 h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </li>
            {/each}
          </ul>
        </div>
      </div>

      <Dialog.Footer class="flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          class="w-full rounded-2xl sm:w-auto"
          onclick={() => onOpenChange(false)}
        >
          Maybe later
        </Button>
        <Button
          class="w-full rounded-2xl sm:w-auto"
          onclick={handleSubscribe}
          disabled={isLoading}
        >
          {#if isLoading}
            <Loader2 class="mr-2 size-4 animate-spin" />
            Processing...
          {:else}
            Upgrade to Pro
            <kbd
              class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
            >
              P
            </kbd>
          {/if}
        </Button>
      </Dialog.Footer>
    </div>
  </Dialog.Content>
</Dialog.Root>
