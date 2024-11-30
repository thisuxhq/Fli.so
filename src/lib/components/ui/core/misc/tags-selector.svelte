<script lang="ts">
  import Check from "lucide-svelte/icons/check";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import type { TagsResponse } from "$lib/types";
  import { tick } from "svelte";
  import { CreateTagDialog } from "$lib/components/ui/core/misc";

  interface Props {
    tags: TagsResponse[];
    onSelect: (tags: string[]) => void;
    selectedTags: string[];
    onRefreshTags?: () => void;
  }

  let { tags, onSelect, selectedTags, onRefreshTags }: Props = $props();

  let open = $state(false);
  let selectedValues = $state<string[]>(selectedTags);

  let selectedLabels = $derived(
    tags
      .filter((tag: TagsResponse) => selectedValues.includes(tag.id))
      .map((tag: TagsResponse) => tag.name),
  );

  let displayText = $derived(
    selectedLabels.length > 0 ? selectedLabels.join(", ") : "Choose tags...",
  );

  let searchQuery = $state("");
  let selectedCount = $derived(selectedValues.length);

  let showCreateTagDialog = $state(false);
  let newTagName = $state("");
  let isCreatingTag = $state(false);

  function toggleValue(value: string) {
    const index = selectedValues.indexOf(value);
    if (index === -1) {
      selectedValues = [...selectedValues, value];
    } else {
      selectedValues = selectedValues.filter((v) => v !== value);
    }
  }

  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild let:builder>
    <Button
      builders={[builder]}
      variant="outline"
      role="combobox"
      aria-expanded={open}
      disabled={isCreatingTag}
      class="h-12 w-full justify-between rounded-2xl bg-input/20"
    >
      <div class="flex items-center gap-2">
        <span
          class="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white"
        >
          {selectedCount}
        </span>
        <span class="truncate">{displayText}</span>
      </div>
      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0">
    <Command.Root>
      <Command.Input placeholder="Search tags..." bind:value={searchQuery} />
      <Command.Empty>
        <div class="flex flex-col items-center gap-2 p-4">
          <p class="text-sm text-muted-foreground">No tag found.</p>
          <Button
            variant="outline"
            class="w-full rounded-2xl"
            disabled={isCreatingTag}
            on:click={() => {
              showCreateTagDialog = true;
              newTagName = searchQuery;
            }}
          >
            <span class="truncate">+ Create "{searchQuery}" tag</span>
          </Button>
        </div>
      </Command.Empty>
      <Command.List>
        <Command.Group>
          {#each tags.filter(tag => 
            tag.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) as tag}
            <Command.Item
              value={tag.name}
              onSelect={() => {
                toggleValue(tag.id);
                if (selectedValues.length === 0) {
                  closeAndFocusTrigger(ids.trigger);
                }
                onSelect(selectedValues);
              }}
            >
              <Check
                class={cn(
                  "mr-2 h-4 w-4",
                  !selectedValues.includes(tag.id) && "text-transparent",
                )}
              />
              {tag.name}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>

<CreateTagDialog
  open={showCreateTagDialog}
  onOpenChange={(open) => (showCreateTagDialog = open)}
  initialName={newTagName}
  loading={isCreatingTag}
  onSuccess={(newTag) => {
    tags = [...tags, newTag];
    onRefreshTags?.();
  }}
/>
