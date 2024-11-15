<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { Link } from "lucide-svelte";
  import type { UrlsResponseWithTags } from "$lib/types";
  import { UrlListCard } from "$lib/components/ui/core";

  interface Props {
    urls: UrlsResponseWithTags[];
    onEdit: (url: UrlsResponseWithTags) => void;
    onDelete: (id: string) => void;
    showAddForm: boolean;
    setShowAddForm: (show: boolean) => void;
    searchQuery: string;
  }

  let { urls, onEdit, onDelete, searchQuery }: Props = $props();

  let filteredUrls = $derived(
    urls.filter((url) => {
      const searchLower = searchQuery.toLowerCase();
      // Check URL and slug
      const urlMatch = url.url.toLowerCase().includes(searchLower);
      const slugMatch = url.slug.toLowerCase().includes(searchLower);
      // Check tags
      const tagMatch = url.expand?.tags?.some((tag) =>
        tag.name.toLowerCase().includes(searchLower),
      );

      return urlMatch || slugMatch || tagMatch;
    }),
  );
</script>

<div
  id="urls"
  class="space-y-4"
  in:fly|local={{ y: 20, duration: 200 }}
  out:fly|local={{ y: 20, duration: 150 }}
>
  {#if urls.length === 0}
    <div
      class="rounded-2xl bg-white/80 px-8 py-12 text-center ring-1 ring-slate-200/50 backdrop-blur-sm dark:bg-slate-800/80 dark:ring-slate-700/50"
      in:fly|local={{ y: 10, duration: 200, easing: quintOut }}
      out:fade|local={{ duration: 150 }}
    >
      <div class="mx-auto max-w-md">
        <Link class="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />

        <h3 class="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          Start Shortening URLs
        </h3>

        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Create your first shortened URL and make sharing links easier than
          ever.
        </p>

        <button
          class="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          onclick={() => (showAddForm = true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Create Your First Short URL</span>
          <kbd
            class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm dark:bg-black/20 sm:inline-block"
          >
            C
          </kbd>
        </button>
      </div>
    </div>
  {:else if filteredUrls.length > 0}
    <div class="grid auto-rows-fr gap-4 sm:grid-cols-2 md:grid-cols-3">
      {#each filteredUrls as url (url.id)}
        <UrlListCard {url} {onEdit} {onDelete} />
      {/each}
    </div>
  {:else}
    <div
      class="rounded-2xl bg-white/80 px-8 py-12 text-center shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm dark:bg-slate-800/80 dark:ring-slate-700/50"
      in:fly|local={{ y: 10, duration: 200, easing: quintOut }}
      out:fade|local={{ duration: 150 }}
    >
      <div class="mx-auto max-w-md">
        <Link class="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />

        <h3 class="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          No URLs match your search
        </h3>

        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Try adjusting your search terms or clear the search to see all your
          URLs.
        </p>
      </div>
    </div>
  {/if}
</div>
