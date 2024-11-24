<script lang="ts">
  import Check from "lucide-svelte/icons/check";
  import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";
  import type { TagsResponse } from "$lib/types";
  import { tick } from "svelte";

  interface Props {
    tags: TagsResponse[];
    onSelect: (tags: string[]) => void;
    selectedTags: string[];
  }

  let { tags, onSelect, selectedTags }: Props = $props();

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

  let selectedCount = $derived(selectedValues.length);

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
      <Command.Input placeholder="Search tags..." />
      <Command.Empty>No tag found.</Command.Empty>
      <Command.List>
        <Command.Group>
          {#each tags as tag}
            <Command.Item
              value={tag.id}
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
