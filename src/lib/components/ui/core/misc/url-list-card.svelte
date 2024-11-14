<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { env } from "$env/dynamic/public";
  import { Pencil, Trash, ExternalLink } from "lucide-svelte";
  import type { UrlsResponseWithTags } from "$lib/types";
  import { Button } from "$lib/components/ui/button";

  interface Props {
    url: UrlsResponseWithTags;
    onEdit: (url: UrlsResponseWithTags) => void;
    onDelete: (id: string) => void;
  }

  let { url, onEdit, onDelete }: Props = $props();
  let hoveredUrl = $state<string | null>(null);
</script>

<div
  class="shadow-mild hover:shadow-subtle group overflow-hidden rounded-3xl bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 hover:translate-y-[-2px] hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:hover:shadow-slate-900/50"
  in:fly|local={{ y: 10, duration: 200, delay: 50 }}
  out:fade|local={{ duration: 150 }}
  onmouseenter={() => (hoveredUrl = url.id)}
  onmouseleave={() => (hoveredUrl = null)}
  aria-label={`${url.url} (${url.clicks} clicks)`}
  role="article"
>
  <div class="space-y-3">
    <!-- URL Info -->
    <div class="flex items-center justify-between gap-2">
      <div class="size-10 rounded-full bg-gray-100"></div>
      <span
        class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path
            fill-rule="evenodd"
            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clip-rule="evenodd"
          />
        </svg>
        {url.clicks} clicks
      </span>
    </div>

    <!-- Short URL -->
    <div class="flex items-start justify-between gap-4">
      <a
        href={`${env.PUBLIC_APPLICATION_URL}/${url.slug}`}
        target="_blank"
        class="group/link flex items-center gap-2 font-medium text-slate-900 hover:text-red-600 dark:text-slate-100 dark:hover:text-gray-900"
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
    <div class="flex items-center justify-between gap-2">
      <!-- Tags -->
      {#if url.expand?.tags}
        <div class="group/tags relative flex-1">
          <div class="ml-3 flex items-center gap-x-4">
            {#each url.expand.tags as tag}
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs first:ml-0 hover:z-10"
                style="background-color: {tag.color}20; color: {tag.color}; border: 1px solid {tag.color}40; margin-left: -8px;"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  style="background-color: {tag.color};"
                ></span>
                {tag.name}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Action Buttons -->
      <div
        class="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <Button
          id={`edit-${url.id}`}
          onclick={() => onEdit(url)}
          class="group/btn relative rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          variant="ghost"
          size="icon"
          title="Edit URL"
        >
          <Pencil class="h-4 w-4" />

          {#if hoveredUrl === url.id}
            <kbd
              class="absolute -top-8 right-0 hidden rounded-md border border-gray-200 px-1.5 py-0.5 text-xs font-light text-gray-400 group-hover/btn:inline-block dark:border-gray-700 dark:text-gray-500"
            >
              E
            </kbd>
          {/if}
        </Button>

        <Button
          id={`delete-${url.id}`}
          onclick={() => onDelete(url.id)}
          class="group/btn relative rounded-full p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
          title="Delete URL"
          size="icon"
          variant="ghost"
        >
          <Trash class="h-4 w-4" />
          {#if hoveredUrl === url.id}
            <kbd
              class="absolute -top-8 right-0 hidden rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400 group-hover/btn:inline-block dark:border-slate-700 dark:text-slate-500"
            >
              D
            </kbd>
          {/if}
        </Button>
      </div>
    </div>
  </div>
</div>
