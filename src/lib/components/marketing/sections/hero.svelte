<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<section id="hero" class="mt-3 flex w-full flex-col gap-8">
  <div class="flex w-full flex-col items-start sm:items-center justify-center gap-5">
    <h1
      class="leading-tighter text-balance text-start text-7xl font-semibold tracking-tighter text-[#712C05] sm:text-center"
    >
      Your links, <span class="text-[#552A1B]"
        >but shorter,<br /> smarter, and simpler</span
      >
    </h1>

    <p class="text-balance text-start text-lg text-gray-700 sm:text-center max-w-md">
      Create, customize, and track your shortened links with powerful features
      designed for modern web sharing
    </p>

    <Button href="/login" class="w-fit">Get started it's FREE</Button>
  </div>

  <img
    src="/images/features/home.png"
    alt="hero"
    class="aspect-auto h-full rounded-3xl"
  />
</section>
