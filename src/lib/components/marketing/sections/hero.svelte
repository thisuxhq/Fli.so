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

  <div class="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl duration-500 animate-in slide-in-from-bottom-60">
    <!-- {/* Browser Toolbar */} -->
    <div class="flex h-12 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4">
      <!-- {/* Traffic Lights */} -->
      <div class="flex gap-2">
        <div class="h-3 w-3 rounded-full bg-[#FF5F57]" />
        <div class="h-3 w-3 rounded-full bg-[#FFBD2E]" />
        <div class="h-3 w-3 rounded-full bg-[#28C840]" />
      </div>
      
      <!-- {/* URL Bar */} -->
      <div class="ml-4 flex h-8 flex-1 items-center rounded-md bg-white px-3 shadow-sm ring-1 ring-zinc-200">
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm2-1.645A3.502 3.502 0 0012 6.5a3.501 3.501 0 00-3.433 2.813l1.962.393A1.5 1.5 0 1112 11.5a1 1 0 00-1 1V14h2v-.645z" fill="currentColor"/>
          </svg>
          <span class="text-sm text-zinc-600">fli.so</span>
        </div>
      </div>
    </div>

    <!-- {/* Video Container */} -->
    <div style="position: relative; padding-top: 79.17888563049853%;">
      <iframe
        src="https://customer-ww5ktj2newryx9x7.cloudflarestream.com/a1104e0e7c15edcb4531bfd7b98b9952/iframe?poster=https%3A%2F%2Fcustomer-ww5ktj2newryx9x7.cloudflarestream.com%2Fa1104e0e7c15edcb4531bfd7b98b9952%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600&title=Fli.so+%E2%80%93+Shorten%2C+Brand%2C+Track.+All+in+One.&logo=https%3A%2F%2Ffli.so%2Fog-image.png"
        loading="lazy"
        class="absolute inset-0 h-full w-full border-none"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        title="Fli.so – Shorten, Brand, Track. All in One."
      />
    </div>
  </div>
</section>
