<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import QRCode from "./qr-code.svelte";
  import { Button } from "$lib/components/ui/button";
  import { ArrowLeft, Copy } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    url: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { url, open, onOpenChange }: Props = $props();

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy URL");
      console.error("Error copying URL:", err);
    }
  }
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="rounded-4xl max-w-sm bg-white p-6 sm:max-w-md">
    <div class="flex flex-col gap-6">
      <!-- QR Code -->
      <div class="flex flex-col items-center justify-center gap-4">
        <QRCode {url} size={250} />
        <p class="text-sm text-muted-foreground">
          Scan this QR code to access the URL
        </p>
      </div>

      <!-- URL Display -->
      <div class="flex items-center justify-center gap-2">
        <span class="line-clamp-1 break-all text-center text-sm font-medium">
          {url}
        </span>
        <Button
          variant="ghost"
          size="icon"
          class="shrink-0 rounded-full"
          on:click={copyUrl}
        >
          <Copy class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
