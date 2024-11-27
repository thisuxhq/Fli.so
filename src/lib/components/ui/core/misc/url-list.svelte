<script lang="ts">
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { Plus } from "lucide-svelte";
  import type { TagsResponse, UrlsResponseWithTags } from "$lib/types";
  import { Button } from "$lib/components/ui/button";
  import { KbdShortcut } from "$lib/components/ui/core/misc";
  import {
    UrlListCard,
    UrlEmptyState,
    EmptySearchResult,
  } from "$lib/components/ui/core";

  interface Props {
    urls: UrlsResponseWithTags[];
    onEdit: (url: UrlsResponseWithTags) => void;
    onDelete: (id: string) => void;
    showAddForm: boolean;
    setShowAddForm: (show: boolean) => void;
    searchQuery: string;
  }

  let { urls, onEdit, onDelete, searchQuery, setShowAddForm }: Props = $props();

  let filteredUrls = $derived(
    urls.filter((url) => {
      const searchLower = searchQuery.toLowerCase();
      // Check URL and slug
      const urlMatch = url.url.toLowerCase().includes(searchLower);
      const slugMatch = url.slug.toLowerCase().includes(searchLower);
      // Check tags
      const tagMatch = url.expand?.tags_id?.some((tag: TagsResponse) =>
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
      class="rounded-2xl px-8 py-12 text-center"
      in:fly|local={{ y: 10, duration: 200, easing: quintOut }}
      out:fade|local={{ duration: 150 }}
    >
      <div
        class="mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-6"
      >
        <div class="flex flex-col items-center justify-center gap-1">
          <UrlEmptyState />

          <h3
            class="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100"
          >
            Hmmm... Seems like you don't have any links. Let's create one!
          </h3>
        </div>

        <Button class="rounded-2xl" onclick={() => setShowAddForm(true)}>
          <span class="flex flex-row items-center justify-center gap-2">
            <Plus class="size-5" />

            New link</span
          >
          <KbdShortcut shortcut="N" />
        </Button>
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
      class="rounded-2xl px-8 py-12 text-center"
      in:fly|local={{ y: 10, duration: 200, easing: quintOut }}
      out:fade|local={{ duration: 150 }}
    >
      <div
        class="mx-auto flex w-full max-w-sm flex-col items-center justify-center"
      >
        <EmptySearchResult />

        <h3 class="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">
          No such link exists :(
        </h3>
      </div>
    </div>
  {/if}
</div>
