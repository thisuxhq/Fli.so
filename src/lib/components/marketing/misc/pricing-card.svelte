<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import { Github } from "lucide-svelte";

  interface Props {
    details: {
      plan: string;
      price: string;
      benefits: string[];
    };
    showMessage?: boolean;
    class?: string;
  }

  let { details, showMessage = false, class: className = "" }: Props = $props();
</script>

<div
  class={cn(
    "flex flex-col overflow-hidden rounded-3xl border-2 border-white/40 backdrop-blur-sm",
    details.plan === "PRO"
      ? "border-[#FFD47C]/40 bg-amber-400/70"
      : "bg-gradient-to-br from-white/80 to-white/40",
    showMessage && "sm:w-1/2",
    className,
  )}
>
  <div class={cn("flex flex-col p-8", details.plan === "Free forever & Open source" && "h-full")}>
    <!-- Header -->
    <div class="space-y-2">
      <p class="text-sm font-medium uppercase tracking-wide text-[#552A1B]/60">
        {details.plan}
      </p>
      <p class="text-3xl font-medium text-[#552A1B]">{details.price}</p>
    </div>

    <!-- Benefits -->
    <div class="mt-8 flex-1 space-y-3">
      {#each details.benefits as benefit}
        <div class="flex items-center gap-3 text-[#6B4D3D]/90">
          <div
            class="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFD47C]/30"
          >
            <span class="text-sm text-[#552A1B]">✓</span>
          </div>
          <span class="text-sm">{benefit}</span>
        </div>
      {/each}
    </div>

    <!-- CTA -->
    <div class="mt-8">
      <Button
        class="w-full"
        href={details.plan === "Self-hosting"
          ? "https://github.com/thisuxhq/fli.so"
          : "/"}
      >
        {#if details.plan === "Self-hosting"}
          <Github class="mr-2 h-4 w-4" />
          View on GitHub
        {:else}
          Get started
        {/if}
      </Button>
    </div>
  </div>
</div>
