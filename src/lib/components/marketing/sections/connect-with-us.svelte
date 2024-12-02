<script lang="ts">
  import { Github, Discord, X } from "$lib/components/marketing/icons/social";

  interface ConnectWithUs {
    name: string;
    description: string;
    icon: any;
    href: string;
  }

  const connectWithUs: ConnectWithUs[] = [
    {
      name: "Join & Contribute",
      description: "Find everything you need to start & get going",
      icon: Github,
      href: "https://github.com/thisuxhq/fli.so",
    },
    {
      name: "Join our community",
      description: "Join our Discord community for more updates",
      icon: Discord,
      href: "https://discord.gg/SGkjHvhg",
    },
    {
      name: "Follow for updates",
      description: "Deploy your own instance easily in minutes",
      icon: X,
      href: "https://x.com/flidotso",
    },
  ];
</script>

<section class="flex w-full flex-col gap-8">
  <h2
    class="text-5xl font-semibold tracking-tighter text-[#552A1B] duration-300 animate-in slide-in-from-bottom-60"
  >
    Connect with us for more
  </h2>

  <div
    class="grid grid-cols-1 gap-6 duration-300 animate-in slide-in-from-bottom-60 sm:grid-cols-2"
  >
    {#each connectWithUs as connect}
      <a
        href={connect.href}
        class="flex flex-col gap-3 rounded-3xl border border-white bg-white/80 p-5 transition-shadow duration-300 ease-in-out animate-in slide-in-from-bottom-60 hover:cursor-pointer hover:bg-white hover:shadow-sm md:p-8"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl">
          <connect.icon />
        </div>
        <h3 class="text-balance text-2xl font-semibold text-[#4A2410]">
          {connect.name}
        </h3>
      </a>
    {/each}
  </div>
</section>
