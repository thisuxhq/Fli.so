<script lang="ts">
  import { Menu, X } from "lucide-svelte";
  import { cn } from "$lib/utils";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Logo } from "$lib/components/ui/core/misc";
  let isMenuOpen = $state<boolean>(false);

  const links = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "About" },
  ];

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<header
  class={cn(
    "sticky top-4 z-50 w-full bg-white/80 backdrop-blur-lg",
    isMenuOpen ? "rounded-b-none rounded-t-3xl" : "rounded-3xl",
  )}
>
  <div class="container mx-auto flex h-16 items-center justify-between px-4">
    <Logo />

    <!-- Desktop Navigation -->
    <nav class="hidden items-center space-x-8 md:flex">
      {#each links as { href, label }}
        <a
          {href}
          class="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
        >
          {label}
        </a>
      {/each}
      <Button href="/">Try for FREE</Button>
    </nav>

    <!-- Mobile Menu Button -->
    <button
      class={cn("p-2 hover:bg-gray-100 md:hidden", isMenuOpen && "bg-gray-100")}
      onclick={toggleMenu}
      aria-label="Toggle menu"
    >
      {#if isMenuOpen}
        <X class="h-6 w-6" />
      {:else}
        <Menu class="h-6 w-6" />
      {/if}
    </button>
  </div>

  <!-- Mobile Navigation -->
  {#if isMenuOpen}
    <div
      class={cn(
        "absolute left-0 right-0 top-16 border-b bg-white shadow-lg md:hidden",
        isMenuOpen && "block",
        isMenuOpen ? "rounded-b-3xl" : "rounded-3xl",
      )}
    >
      <div class="container mx-auto space-y-4 px-4 py-4">
        {#each links as { href, label }}
          <a
            {href}
            class="block text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            onclick={toggleMenu}
          >
            {label}
          </a>
        {/each}
        <div class="pt-2">
          <Button href="/" class="w-full">Try for FREE</Button>
        </div>
      </div>
    </div>
  {/if}
</header>

<style>
  /* Add smooth transitions */
  :global(.mobile-menu-enter) {
    transform: translateY(-100%);
    transition: transform 0.2s ease-out;
  }
  :global(.mobile-menu-enter-active) {
    transform: translateY(0);
  }
  :global(.mobile-menu-exit) {
    transform: translateY(0);
    transition: transform 0.2s ease-in;
  }
  :global(.mobile-menu-exit-active) {
    transform: translateY(-100%);
  }
</style>
