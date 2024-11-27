<script lang="ts">
  import QRCode from "qrcode";
  import { Button } from "$lib/components/ui/button";
  import { Download } from "lucide-svelte";

  interface Props {
    url: string;
    size?: number;
  }

  let { url, size = 200 }: Props = $props();
  let canvas = $state<HTMLCanvasElement | null>(null);
  let qrError = $state<string | null>(null);

  $effect(() => {
    if (url && canvas) {
      generateQR();
    }
  });

  async function generateQR() {
    try {
      await QRCode.toCanvas(canvas, url, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      qrError = null;
    } catch (err) {
      qrError = "Failed to generate QR code";
      console.error("Error generating QR code:", err);
    }
  }

  function downloadQR() {
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
</script>

<div class="flex flex-col items-center gap-4">
  {#if qrError}
    <div class="text-sm text-destructive">{qrError}</div>
  {:else}
    <canvas bind:this={canvas} class="rounded-lg bg-white p-2"></canvas>
    <Button
      variant="outline"
      size="sm"
      on:click={downloadQR}
      class="gap-2 rounded-xl"
    >
      <Download class="h-4 w-4" />
      Download QR
    </Button>
  {/if}
</div>
