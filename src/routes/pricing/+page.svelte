<script lang="ts">
  import { Check, Loader2 } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";
  import { Earth } from "lucide-svelte";

  interface Plan {
    name: string;
    price: number;
    features: string[];
    interval: string;
    stripe_price_id: string;
  }

  let { data }: { data: { plans: Record<string, Plan> } } = $props();
  let isLoading = $state<boolean>(false);

  const benefits = [
    "Shorten unlimited URLs",
    "Track URL analytics",
    "Customizable URLs",
    "Easily manage your links",
    "Bulk URL shortening",
    "Integrates with popular platforms",
    "Export shortened URLs",
  ];

  const features: Record<string, string[]> = {
    "FLI PRO": [
      "Up to 10 team members",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "API access",
    ],
    "FLI ENTERPRISE": [
      "Unlimited team members",
      "Enterprise analytics",
      "24/7 dedicated support",
      "Custom development",
      "SLA guarantee",
      "Advanced security",
    ],
  };

  async function handleSubscribe(plan: Plan) {
    try {
      isLoading = true;

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
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
</script>

<div class="py-24 sm:py-32">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class="mx-auto max-w-2xl sm:text-center">
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Simple, transparent pricing
      </h2>
      <p class="mt-6 text-lg leading-8 text-muted-foreground">
        Choose the plan that's right for you
      </p>
    </div>
    <div
      class="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-2"
    >
      {#each Object.entries(data.plans) as [key, plan]}
        <div
          class="flex flex-col justify-between rounded-3xl bg-card p-8 ring-1 ring-gray-200 xl:p-10"
        >
          <div>
            <div class="flex items-center justify-between gap-x-4">
              <h3 class="text-lg font-semibold leading-8">{plan.name}</h3>
              {#if key === "FLI ENTERPRISE"}
                <p
                  class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary"
                >
                  Most popular
                </p>
              {/if}
            </div>
            <p class="mt-6 flex items-baseline gap-x-1">
              <span class="text-4xl font-bold tracking-tight"
                >${plan.price}</span
              >
              <span
                class="text-sm font-semibold leading-6 text-muted-foreground"
                >/{plan.interval}</span
              >
            </p>
            <ul role="list" class="mt-8 space-y-3 text-sm leading-6">
              {#each features[key] as feature}
                <li class="flex gap-x-3">
                  <Check class="h-6 w-5 flex-none text-primary" />
                  <span>{feature}</span>
                </li>
              {/each}
            </ul>
          </div>
          <Button
            variant={key === "FLI ENTERPRISE" ? "default" : "outline"}
            class="mt-8"
            disabled={isLoading}
            on:click={() => handleSubscribe(plan)}
          >
            {#if isLoading}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {/if}
            Get started
          </Button>
        </div>
      {/each}
    </div>
  </div>
</div>

<div class="flex min-h-screen flex-col items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="mb-8 flex justify-center">
      <Earth class="size-10" />
    </div>
    <div class="relative rounded-3xl bg-white p-6">
      <div
        class="absolute -top-3 right-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white"
      >
        Limited Offer
      </div>
      <h2 class="mb-2 text-xl font-medium">Do it all</h2>
      <h1 class="mb-4 text-3xl font-medium tracking-tight">
        Only $9 for lifetime access
      </h1>
      <ul class="mb-6">
        {#each benefits as item}
          <li class="mb-1 flex items-center">
            <Check class="mr-2 h-5 w-5 text-green-500" />
            <span>{item}</span>
          </li>
        {/each}
      </ul>
      <Button class="w-full rounded-2xl"
        >Ready to pay? <kbd
          class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
        >
          P
        </kbd>
      </Button>
      <p class="mt-4 text-center text-xs text-gray-500">
        By clicking the button, you agree to our terms & conditions
      </p>
    </div>
  </div>
</div>
