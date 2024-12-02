<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<section
  class="flex w-full flex-col items-center justify-between gap-8 rounded-3xl border-2 border-white bg-amber-400/80 p-8 md:flex-row md:p-16"
>
  <h2
    class="max-w-xl text-center text-3xl font-medium tracking-tighter text-[#552A1B] md:text-left md:text-5xl"
  >
    Shorten your links with fli.so and level up your branding!
  </h2>

  <div
    class="flex w-full max-w-[20rem] flex-col items-center justify-center gap-4"
  >
    <Button href="/app/login" class="w-full">Try for FREE</Button>

    <span class="w-full text-center text-base text-[#552A1B]/60">
      No credit card required
    </span>
  </div>
</section>
