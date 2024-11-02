<script lang="ts">
  import type { TagsResponse } from "$lib/types";

  let { tags, selectedTags = [] } = $props<{
    tags: TagsResponse[];
    selectedTags?: string[];
  }>();

  function toggleTag(tagId: string) {
    const index = selectedTags.indexOf(tagId);
    if (index === -1) {
      selectedTags = [...selectedTags, tagId];
    } else {
      selectedTags = selectedTags.filter((id: string) => id !== tagId);
    }
  }
</script>

<div class="space-y-2">
  <div class="flex flex-wrap gap-2">
    {#each tags as tag}
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors"
        style="background-color: {tag.color}20; color: {tag.color}; border: 1px solid {tag.color}40;"
        class:opacity-40={!selectedTags.includes(tag.id)}
        onclick={() => toggleTag(tag.id)}
      >
        <span>{tag.name}</span>
        {#if selectedTags.includes(tag.id)}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        {/if}
      </button>
    {/each}
  </div>

  {#each selectedTags as tagId}
    <input type="hidden" name="tags" value={tagId} />
  {/each}
</div>
