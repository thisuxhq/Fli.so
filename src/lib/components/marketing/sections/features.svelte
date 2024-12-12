<script lang="ts">
  import { FeatureCard } from "$lib/components/marketing";

  let features = [
    {
      name: "Custom URLs",
      description: "Brand your links your own way",
      image: {
        src: "/images/features/custom-url.png",
        alt: "Custom URLs",
      },
    },
    {
      name: "Meta Controls",
      description: "Customize your link’s meta data view",
      image: {
        src: "/images/features/meta-controls.png",
        alt: "Meta controls",
      },
    },
    {
      name: "QR Codes",
      description: "Instantly generate QR codes for any link",
      image: {
        src: "/images/features/qr-codes.png",
        alt: "QR Codes",
      },
    },
    {
      name: "Smart Organization",
      description: "Tag and categorize for easy finding",
      image: {
        src: "/images/features/smart-organization.png",
        alt: "Smart Organization",
      },
    },
    {
      name: "Link Security",
      description: "Secure links with passwords and expiry dates",
      image: {
        src: "/images/features/link-security.png",
        alt: "Link Security",
      },
    },
    {
      name: "Power User Ready",
      description: "Keyboard shortcuts for rapid workflow",
      image: {
        src: "/images/features/power-user-ready.png",
        alt: "Power User Ready",
      },
    },
  ];
</script>

<section id="features" class="flex w-full flex-col gap-8">
  <h2
    class="leading-tighter text-balance text-start text-7xl font-medium tracking-tighter text-[#712C05] duration-300 animate-in slide-in-from-bottom-60 sm:text-center"
  >
    Features that <br class="hidden sm:block" />
    you'll love
  </h2>

  <div
    class="grid grid-cols-2 gap-5 duration-300 animate-in slide-in-from-bottom-60"
  >
    {#each features as feature}
      <FeatureCard {feature} />
    {/each}
  </div>
</section>
