<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<section id="hero" class="mt-3 flex w-full flex-col gap-8">
  <div
    class="flex w-full flex-col items-start justify-center gap-5 sm:items-center"
  >
    <h1
      class="leading-tighter text-balance text-start text-7xl font-semibold tracking-tighter text-[#712C05] duration-300 animate-in slide-in-from-bottom-60 sm:text-center"
    >
      Shorten, Brand, Track. All in One with
      <span class="text-[#552A1B]">Fli.so</span>
    </h1>

    <p
      class="max-w-md text-balance text-start text-lg text-[#552A1B] duration-300 animate-in slide-in-from-bottom-60 sm:text-center"
    >
      Fli.so makes link management simple. Shorten your links, brand them with
      your name, and track how they perform—all in one place. No hassle, just
      smarter links.
    </p>

    <Button
      href="/app/login"
      class="w-fit duration-400 animate-in slide-in-from-bottom-60"
      >Get started – it's FREE</Button
    >
  </div>

  <img
    src="/images/features/home.png"
    alt="hero"
    class="aspect-auto h-full rounded-3xl duration-500 animate-in slide-in-from-bottom-60"
  />
</section>
