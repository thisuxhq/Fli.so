<script lang="ts">
  interface Props {
    feature: {
      name: string;
      description: string;
      image: {
        src: string;
        alt: string;
      };
    };
  }
  let { feature }: Props = $props();
</script>

<div
  class="border-1 rounded-4xl col-span-2 flex w-full flex-col gap-0 overflow-clip border-white bg-white shadow-lg sm:col-span-1 md:col-span-1"
>
  <img src={feature.image.src} alt={feature.image.alt} />

  <div class="gap-1/2 flex w-full flex-col p-4 leading-tight">
    <p class="text-lg font-medium text-foreground">{feature.name}</p>
    <p class="text-md text-muted-foreground">{feature.description}</p>
  </div>
</div>
