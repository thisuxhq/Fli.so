<script lang="ts">
  import { Check, Loader2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import * as Tabs from "$lib/components/ui/tabs";
  import { KbdShortcut } from "$lib/components/ui/core/misc";
  import type Stripe from "stripe";
  import type { SubscriptionsResponse } from "$lib/types";
  import { convertExpirationToHumanReadable } from "$lib/utils/datetime";

  interface PageData {
    plans?: Stripe.Price[];
    subscription?: SubscriptionsResponse;
    tab?: "monthly" | "yearly";
    hasSubscription: boolean;
  }

  let { data } = $props<{ data: PageData }>();

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

  async function handleBillingPortal() {
    try {
      isLoading = true;

      const response = await fetch("/api/create-billing-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tab: currentTab,
        }),
      });

      const result = await response.json();

      if (response.ok && result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Failed to start billing portal process");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to start billing portal process");
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
  {#if data.hasSubscription}
    <div class="mx-auto w-full max-w-lg">
      <div
        class="rounded-3xl bg-white/80 p-6 backdrop-blur-sm hover:bg-white hover:shadow-mild dark:bg-slate-800/80"
      >
        <h2 class="mb-4 text-xl font-medium">
          Your {data.subscription.plan_name} PRO plan expires on
        </h2>
        <div class="space-y-4">
          <h5 class="text-3xl font-medium">
            {convertExpirationToHumanReadable(
              data.subscription.current_period_end,
            )}
          </h5>
          <p class="text-base font-medium text-muted-foreground">
            You will be automatically charged <span class="text-amber-950">
              {data.subscription.plan_name === "monthly"
                ? "$9.99/month"
                : "$99/year"}</span
            >. To switch plans, cancel your current subscription and purchase
            new.
          </p>
          <Button
            class="w-full rounded-2xl"
            on:click={() => {
              handleBillingPortal();
            }}
          >
            {#if isLoading}
              <Loader2 class="mr-2 size-4 animate-spin" />
            {/if}
            
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  {:else}
    <Tabs.Root
      value={currentTab}
      class="mx-auto flex w-full  max-w-md flex-col items-center justify-center gap-4"
      onValueChange={(e) => handleTabChange(e as "monthly" | "yearly")}
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
            {data.plans &&
              `Only $${data.plans[1].unit_amount! / 100} for monthly access`}
          </h1>
          <ul class="mb-6">
            {#if data.plans}
              {#each JSON.parse(data.plans[1].metadata.features
                  .replace(/\n/g, "")
                  .trim()) as feature}
                <li class="mb-1 flex items-center">
                  <Check class="mr-2 h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              {/each}
            {/if}
          </ul>
          {#if data.plans}
            <Button
              class="w-full rounded-2xl"
              on:click={() => handleSubscribe(data.plans![1])}
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
          {/if}
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
            {data.plans &&
              `Only $${data.plans[0].unit_amount! / 100} for yearly access`}
          </h1>
          <ul class="mb-6">
            {#if data.plans}
              {#each JSON.parse(data.plans[0].metadata.features) as feature}
                <li class="mb-1 flex items-center">
                  <Check class="mr-2 h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              {/each}
            {/if}
          </ul>
          {#if data.plans}
            <Button
              class="w-full rounded-2xl"
              on:click={() => handleSubscribe(data.plans![0])}
            >
              {#if isLoading}
                <Loader2 class="mr-2 size-4 animate-spin" />
              {/if}
              Ready to pay?
              <KbdShortcut shortcut="P" />
            </Button>
          {/if}
          <p class="mt-4 text-center text-xs text-gray-500">
            By clicking the button, you agree to our terms & conditions
          </p>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  {/if}
</div>
