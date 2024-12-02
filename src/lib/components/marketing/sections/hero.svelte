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
      Your links speak before you do. <br />
      Make them <span class="text-[#552A1B]">unforgettable.</span>
    </h1>

    <p
      class="max-w-md text-balance text-start text-lg text-gray-700 duration-300 animate-in slide-in-from-bottom-60 sm:text-center"
    >
      Link management for people who want to do more than just shrink a URL – we
      help you track, brand, and shine.
    </p>

    <Button
      href="/app/login"
      class="duration-400 w-fit animate-in slide-in-from-bottom-60"
      >Get started it's FREE</Button
    >
  </div>

  <img
    src="/images/features/home.png"
    alt="hero"
    class="aspect-auto h-full rounded-3xl duration-500 animate-in slide-in-from-bottom-60"
  />
</section>
