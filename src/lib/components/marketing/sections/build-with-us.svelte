<script lang="ts">
  import { cn } from "$lib/utils";
  import {
    Docs,
    EasySetup,
    Ideas,
    Support,
  } from "$lib/components/marketing/icons/build";
  interface BuildFeature {
    name: string;
    description: string;
    icon: {
      color: string;
      name: any;
    };
  }

  const buildFeatures: BuildFeature[] = [
    {
      name: "Clear Documentation",
      description: "Find everything you need to start & get going",
      icon: {
        color: "bg-blue-500",
        name: Docs,
      },
    },
    {
      name: "Easy Setup",
      description: "Setup your links in just minutes",
      icon: {
        color: "bg-orange-500",
        name: EasySetup,
      },
    },
    {
      name: "Open to ideas",
      description: "We're open to ideas and suggestions",
      icon: {
        color: "bg-rose-400",
        name: Ideas,
      },
    },
    {
      name: "Live Support",
      description: "Get help or share thoughts directly with us",
      icon: {
        color: "bg-green-500",
        name: Support,
      },
    },
  ];
</script>

<section class="flex w-full flex-col gap-10">
  <h2
    id="build-with-us-title"
    class="leading-tighter text-balance text-start text-7xl font-medium tracking-tighter text-[#712C05] duration-300 animate-in slide-in-from-bottom-60 sm:text-center"
  >
    Join us in <br class="hidden sm:block" />
    building together
  </h2>

  <div class="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
    {#each buildFeatures as feature}
      <div
        class="rounded-4xl flex flex-col gap-3 bg-white p-5 duration-300 animate-in slide-in-from-bottom-60 md:p-8"
      >
        <div
          class={cn(
            "flex h-12 w-12 items-center justify-center text-balance rounded-2xl",
          )}
        >
          <feature.icon.name />
        </div>

        <div class="flex flex-col gap-1">
          <h3 class="text-balance text-2xl font-medium text-[#4A2410]">
            {feature.name}
          </h3>
          <p class="text-lg text-[#6B4D3D]">{feature.description}</p>
        </div>
      </div>
    {/each}
  </div>
</section>
