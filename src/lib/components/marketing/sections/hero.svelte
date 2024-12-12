<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
</script>

<section id="hero" class="mt-3 flex w-full flex-col gap-8">
  <div
    class="flex w-full flex-col items-start justify-center gap-5 sm:items-center"
  >
    <h1
      class="leading-tighter text-balance text-start text-8xl font-medium tracking-tighter text-[#712C05] duration-300 animate-in slide-in-from-bottom-60 sm:text-center"
    >
      Home for your <br />
      links, branding <br />
      and tracking
    </h1>

    <p
      class="max-w-sm text-balance text-start text-lg text-[#552A1B] duration-300 animate-in slide-in-from-bottom-60 sm:text-center"
    >
      Create, track, and brand links effortlessly. Stay organized and focused,
      all in one spot with Fli.so.
    </p>

    <Button
      href="/app/login"
      class="w-fit duration-400 animate-in slide-in-from-bottom-60"
      >Get started – it's FREE</Button
    >
  </div>

  <div class="relative w-full overflow-hidden">
    <div
      class="w-full rounded-2xl border-2 border-white bg-white/5 p-[1px] shadow-[0_0_15px_rgba(0,0,0,0.05)] backdrop-blur-sm"
    >
      <div style="position: relative; padding-top: 79.17888563049853%;">
        <iframe
          src="https://customer-ww5ktj2newryx9x7.cloudflarestream.com/a1104e0e7c15edcb4531bfd7b98b9952/iframe?poster=https%3A%2F%2Fcustomer-ww5ktj2newryx9x7.cloudflarestream.com%2Fa1104e0e7c15edcb4531bfd7b98b9952%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600&title=Fli.so+%E2%80%93+Shorten%2C+Brand%2C+Track.+All+in+One.&logo=https%3A%2F%2Ffli.so%2Fog-image.png"
          loading="lazy"
          class="absolute inset-0 h-full w-full rounded-2xl border-none"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          title="Fli.so – Shorten, Brand, Track. All in One."
        ></iframe>
      </div>
    </div>
  </div>
</section>
