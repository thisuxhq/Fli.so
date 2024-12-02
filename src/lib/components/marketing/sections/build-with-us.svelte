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
      description: "Deploy and run in just minutes",
      icon: {
        color: "bg-orange-500",
        name: EasySetup,
      },
    },
    {
      name: "Open to ideas",
      description: "Deploy your own instance easily in minutes",
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

<section class="flex w-full flex-col gap-8">
  <div class="flex flex-col gap-4">
    <h2
      class="text-5xl font-semibold tracking-tighter text-[#552A1B] duration-300 animate-in slide-in-from-bottom-60"
    >
      Build with us
    </h2>

    <p class="text-xl text-[#6B4D3D] duration-300 animate-in slide-in-from-bottom-60">
      We believe great tools get better when built together. fli.so is
      open-source and ready for your ideas. Have one in mind? We'd love to hear
      about it.
    </p>
  </div>

  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
    {#each buildFeatures as feature}
      <div
        class="flex flex-col gap-3 rounded-3xl bg-white p-5 md:p-8 duration-300 animate-in slide-in-from-bottom-60"
      >
        <div
          class={cn(
            "flex h-12 w-12 items-center justify-center text-balance rounded-2xl",
          )}
        >
          <feature.icon.name />
        </div>
        <h3 class="text-balance text-2xl font-semibold text-[#4A2410]">
          {feature.name}
        </h3>
        <p class="text-lg text-[#6B4D3D]">{feature.description}</p>
      </div>
    {/each}
  </div>
</section>
