<script lang="ts">
  import { NotFound, KbdShortcut } from "$lib/components/ui/core";
  import { Button } from "$lib/components/ui/button";
</script>

<div
  class="mx-auto flex h-screen w-full max-w-md flex-col items-center justify-center gap-8"
>
  <div class="flex flex-col gap-6">
    <NotFound />
    <p class="text-center text-gray-500 dark:text-gray-400">
      Oops, The page you are looking for does not exist.
    </p>
  </div>

  <Button href="/" class="rounded-2xl">
    Take me home
    <KbdShortcut shortcut="H" />
  </Button>
</div>
