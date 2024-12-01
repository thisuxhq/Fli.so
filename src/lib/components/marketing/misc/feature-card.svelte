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
	class="border-1 col-span-2 flex w-full flex-col gap-0 overflow-clip rounded-2xl border-white bg-white shadow-lg sm:col-span-1 md:col-span-1"
>
	<img src={feature.image.src} alt={feature.image.alt} />

	<div class="gap-1/2 flex w-full flex-col p-4 leading-tight">
		<p class="text-lg font-semibold text-black">{feature.name}</p>
		<p class="text-md text-slate-600">{feature.description}</p>
	</div>
</div>
