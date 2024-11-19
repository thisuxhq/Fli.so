<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { KbdShortcut } from "$lib/components/ui/core";

  interface PageData {
    session_id: string;
  }
  let { data }: { data: PageData } = $props();
</script>

<div
  class="mx-auto flex h-screen max-w-md flex-col items-start justify-center gap-4 text-start"
>
  <div class="flex flex-col gap-2">
    <h1 class="w-full text-start text-2xl font-medium">Payment Successful!</h1>
    <p class="w-full text-start text-xl">
      We look forward to giving you best experience.
    </p>
  </div>
  <Button class="mt-4 rounded-2xl" href="/">
    Go to dashboard
    <KbdShortcut shortcut="H" />
  </Button>
</div>
