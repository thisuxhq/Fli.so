<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { env } from "$env/dynamic/public";
  import {
    Pencil,
    Trash,
    ExternalLink,
    MousePointerClick,
    Earth,
  } from "lucide-svelte";
  import type { UrlsResponseWithTags } from "$lib/types";
  import { Button } from "$lib/components/ui/button";
  import { initKeyboardShortcuts } from "$lib/keyboard";
  import { cn } from "$lib/utils";
  import { getTagStyles } from "$lib/utils";
  import { toast } from "svelte-sonner";

  interface Props {
    url: UrlsResponseWithTags;
    onEdit: (url: UrlsResponseWithTags) => void;
    onDelete: (id: string) => void;
    
  }

  let { url, onEdit, onDelete }: Props = $props();
  let hoveredUrl = $state<string | null>(null);
  let showDeleteConfirm = $state(false);

  // Handle keyboard shortcuts when card is hovered
  $effect(() => {
    if (hoveredUrl === url.id) {
      return initKeyboardShortcuts([
        { key: "e", handler: () => !showDeleteConfirm && onEdit(url) },
        {
          key: "d",
          handler: () => !showDeleteConfirm && (showDeleteConfirm = true),
        },
        { key: "Escape", handler: () => (showDeleteConfirm = false) },
        {
          key: "c",
          handler: () =>
            navigator.clipboard
              .writeText(`${env.PUBLIC_APPLICATION_URL}/${url.slug}`)
              .then(() => toast.success("Copied to clipboard")),
        },
      ]);
    }
  });

  function handleDelete() {
    showDeleteConfirm = false;
    onDelete(url.id);
  }

  function handleEdit() {
    // showEditForm = true;
  }
</script>

<div
  class="group relative overflow-hidden rounded-3xl bg-white/80 p-4 shadow-mild backdrop-blur-sm transition-all duration-200 hover:translate-y-[-2px] hover:cursor-pointer hover:bg-white hover:shadow-subtle dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:hover:shadow-slate-900/50"
  in:fly|local={{ y: 10, duration: 200, delay: 50 }}
  out:fade|local={{ duration: 150 }}
  onmouseenter={() => (hoveredUrl = url.id)}
  onmouseleave={() => {
    hoveredUrl = null;
    showDeleteConfirm = false;
  }}
  aria-label={`${url.url} (${url.clicks} clicks)`}
  role="article"
>
  <div class="space-y-3">
    <!-- URL Info -->
    <div class="flex items-center justify-between gap-2">
      <div
        class="group flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors duration-200 group-hover:bg-amber-50 group-hover:text-amber-950"
      >
        <Earth class="size-5" />
      </div>
      <span
        class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
      >
        <MousePointerClick class="size-3" />

        {url.clicks} clicks
      </span>
    </div>

    <!-- Short URL -->
    <div class="group/link flex items-start justify-between gap-4">
      <a
        href={`${env.PUBLIC_APPLICATION_URL}/${url.slug}`}
        target="_blank"
        class="group/link flex items-center gap-2 font-medium text-slate-900 group-hover/link:text-amber-600 dark:text-slate-100 dark:group-hover/link:text-gray-900"
      >
        {env.PUBLIC_APPLICATION_NAME}/{url.slug}

        <ExternalLink
          class="h-4 w-4 opacity-0 transition-opacity group-hover/link:opacity-100"
        />
      </a>
    </div>

    <!-- Original URL -->
    <p
      class="truncate text-sm text-slate-500 dark:text-slate-400"
      title={url.url}
    >
      {url.url}
    </p>

    <!-- Tags and Actions -->
    <div class="relative flex items-center justify-end gap-2">
      <!-- Tags -->
      {#if url.expand?.tags_id}
        <div
          class="group/tags relative min-w-0 flex-1 transition-all duration-300 ease-out"
          class:translate-x-[-150%]={showDeleteConfirm}
          class:opacity-0={showDeleteConfirm}
        >
          <!-- When not hovered, show all tags -->
          <div
            class="flex items-center gap-x-1 transition-opacity duration-200 group-hover:opacity-0"
          >
            {#each url.expand.tags_id as tag}
              {@const styles = getTagStyles(
                tag.color as keyof typeof tailwindColors,
              )}
              <span
                class={cn(
                  "inline-flex max-w-[150px] items-center gap-1 rounded-full border-[0.5px] border-gray-200  px-2 py-0.5 text-xs first:ml-0 hover:z-10",
                  styles.text,
                )}
              >
                <span class={cn("h-2 w-2 shrink-0 rounded-full", styles.dot)}
                ></span>
                <span class="truncate">{tag.name}</span>
              </span>
            {/each}
          </div>

          <!-- When hovered, show only first tag + count -->
          <div
            class="absolute inset-0 flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            {#if url.expand.tags_id.length > 0}
              {@const styles = getTagStyles(
                url.expand.tags_id[0].color as keyof typeof tailwindColors,
              )}
              <span
                class={cn(
                  "inline-flex max-w-[150px] items-center gap-1 rounded-full border-[0.5px] border-gray-200  px-2 py-0.5 text-xs",
                  styles.text,
                )}
              >
                <span class={cn("h-2 w-2 shrink-0 rounded-full", styles.dot)}
                ></span>
                <span class="truncate">{url.expand.tags_id[0].name}</span>
                {#if url.expand.tags_id.length > 1}
                  <span class="ml-1 shrink-0 text-slate-500"
                    >+{url.expand.tags_id.length - 1}</span
                  >
                {/if}
              </span>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div
        class="ml-auto flex items-center gap-2 transition-all duration-300 ease-out"
        class:translate-x-[-150%]={showDeleteConfirm}
        class:opacity-0={showDeleteConfirm}
        class:invisible={showDeleteConfirm}
      >
        <Button
          id={`edit-${url.id}`}
          onclick={() => onEdit(url)}
          class="group/btn relative rounded-full p-2 text-gray-600 opacity-0 transition-opacity duration-200 hover:bg-gray-100 group-hover:opacity-100 dark:text-gray-400 dark:hover:bg-gray-800"
          variant="ghost"
          size="icon"
          title="Edit URL (press 'e')"
        >
          <Pencil class="h-4 w-4" />
        </Button>

        <Button
          id={`delete-${url.id}`}
          onclick={() => (showDeleteConfirm = true)}
          class="group/btn relative rounded-full p-2 text-red-500 opacity-0 transition-opacity duration-200 hover:bg-red-50 hover:text-red-700 group-hover:opacity-100 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
          title="Delete URL (press 'd')"
          size="icon"
          variant="ghost"
        >
          <Trash class="h-4 w-4" />
        </Button>
      </div>

      <!-- Delete Confirmation -->
      <div
        class="absolute right-0 flex transform items-center gap-2 transition-all duration-300 ease-out"
        class:translate-x-0={showDeleteConfirm}
        class:translate-x-[150%]={!showDeleteConfirm}
        class:opacity-100={showDeleteConfirm}
        class:opacity-0={!showDeleteConfirm}
        class:pointer-events-none={!showDeleteConfirm}
      >
        <Button
          onclick={() => (showDeleteConfirm = false)}
          variant="ghost"
          size="sm"
          class="text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Cancel (Esc)
        </Button>
        <Button
          onclick={handleDelete}
          variant="destructive"
          size="sm"
          class="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
</div>
