<script lang="ts">
  import { Check, Loader2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import * as Tabs from "$lib/components/ui/tabs";
  import { KbdShortcut } from "$lib/components/ui/core/misc";
  import type Stripe from "stripe";

  interface PageData {
    plans: Stripe.Price[];
    tab: "monthly" | "yearly";
  }

  let { data }: { data: PageData } = $props();

  let currentTab = $state<"monthly" | "yearly">("monthly");

  let isLoading = $state<boolean>(false);

  async function handleSubscribe(plan: Stripe.Price) {
    try {
      isLoading = true;

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.id,
          tab: currentTab,
        }),
      });

      const result = await response.json();

      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Failed to start checkout process");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to start checkout process");
    } finally {
      isLoading = false;
    }
  }

  function handleTabChange(value: "monthly" | "yearly") {
    currentTab = value;
  }

  $effect(() => {
    if (data.tab) {
      currentTab = data.tab;
    }
  });
</script>

<div class="flex h-screen flex-col items-center justify-center p-4">
  <Tabs.Root
    value={currentTab}
    class="mx-auto flex w-full  max-w-md flex-col items-center justify-center gap-4"
    onValueChange={(e) => handleTabChange(e)}
  >
    <Tabs.List class="flex justify-center rounded-xl p-1">
      <Tabs.Trigger value="monthly" class="rounded-xl">Monthly</Tabs.Trigger>
      <Tabs.Trigger value="yearly" class="rounded-xl">Yearly</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="monthly" class="mx-auto w-full max-w-lg">
      <div
        class="relative rounded-3xl bg-white/80 p-6 shadow-mild backdrop-blur-sm transition-all duration-200 hover:translate-y-[-2px] hover:cursor-pointer hover:bg-white hover:shadow-subtle dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:hover:shadow-slate-900/50"
      >
        <div
          class="absolute -top-3 right-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white"
        >
          Limited Offer
        </div>
        <h2 class="mb-2 text-xl font-medium">Do it all</h2>
        <h1 class="mb-4 text-3xl font-medium tracking-tight">
          {`Only $${data.plans[1].unit_amount! / 100} for monthly access`}
        </h1>
        <ul class="mb-6">
          {#each JSON.parse(data.plans[1].metadata.features
              .replace(/\n/g, "")
              .trim()) as feature}
            <li class="mb-1 flex items-center">
              <Check class="mr-2 h-5 w-5 text-green-500" />
              <span>{feature}</span>
            </li>
          {/each}
        </ul>
        <Button
          class="w-full rounded-2xl"
          on:click={() => handleSubscribe(data.plans[1])}
        >
          {#if isLoading}
            <Loader2 class="mr-2 size-4 animate-spin" />
          {/if}

          Ready to pay?
          <kbd
            class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
          >
            P
          </kbd>
        </Button>
        <p class="mt-4 text-center text-xs text-gray-500">
          By clicking the button, you agree to our terms & conditions
        </p>
      </div>
    </Tabs.Content>
    <Tabs.Content value="yearly" class="mx-auto w-full max-w-lg">
      <div
        class="relative rounded-3xl bg-white/80 p-6 shadow-mild backdrop-blur-sm transition-all duration-200 hover:translate-y-[-2px] hover:cursor-pointer hover:bg-white hover:shadow-subtle dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:hover:shadow-slate-900/50"
      >
        <div
          class="absolute -top-3 right-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white"
        >
          Limited Offer
        </div>
        <h2 class="mb-2 text-xl font-medium">Do it all</h2>
        <h1 class="mb-4 text-3xl font-medium tracking-tight">
          {`Only $${data.plans[0].unit_amount! / 100} for yearly access`}
        </h1>
        <ul class="mb-6">
          {#each JSON.parse(data.plans[0].metadata.features) as feature}
            <li class="mb-1 flex items-center">
              <Check class="mr-2 h-5 w-5 text-green-500" />
              <span>{feature}</span>
            </li>
          {/each}
        </ul>
        <Button
          class="w-full rounded-2xl"
          on:click={() => handleSubscribe(data.plans[0])}
        >
          {#if isLoading}
            <Loader2 class="mr-2 size-4 animate-spin" />
          {/if}
          Ready to pay?
          <KbdShortcut shortcut="P" />
        </Button>
        <p class="mt-4 text-center text-xs text-gray-500">
          By clicking the button, you agree to our terms & conditions
        </p>
      </div>
    </Tabs.Content>
  </Tabs.Root>
</div>
