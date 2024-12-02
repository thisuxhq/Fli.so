<script lang="ts">
  import { NotFound, KbdShortcut } from "$lib/components/ui/core";
  import { Button } from "$lib/components/ui/button";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  const isExpired = $page.status === 410;
</script>

<div
  class="mx-auto flex h-screen w-full max-w-md flex-col items-center justify-center gap-8"
>
  <div class="flex flex-col gap-6">
    <NotFound />
    <p class="text-center text-gray-500 dark:text-gray-400">
      {#if isExpired}
        This link has expired and is no longer available.
      {:else}
        Oops, The page you are looking for does not exist.
      {/if}
    </p>
  </div>

  <Button
    href="/app"
    class="rounded-2xl"
    on:keydown={(e) => {
      if (e.key === "h") {
        e.preventDefault();
        e.stopPropagation();
        goto("/app");
      }
    }}
  >
    Take me home
    <KbdShortcut shortcut="H" />
  </Button>
</div>
