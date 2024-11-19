<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import {
    Link,
    Search,
    Shuffle,
    X,
    Check,
    Copy,
    Pencil,
    Trash,
  } from "lucide-svelte";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }

  let { open, onOpenChange }: Props = $props();

  const shortcuts = [
    {
      icon: Link,
      label: "New link",
      shortcut: "N",
    },
    {
      icon: Search,
      label: "Search links",
      shortcut: "/",
    },
    {
      icon: Shuffle,
      label: "Suggest slugs",
      shortcut: "⌘",
    },
    {
      icon: X,
      label: "Close/cancel",
      shortcut: "Esc",
    },
    {
      icon: Check,
      label: "Confirm action",
      shortcut: "↵",
    },
    {
      icon: Copy,
      label: "Copy link",
      shortcut: "C",
    },
    {
      icon: Pencil,
      label: "Edit link",
      shortcut: "E",
    },
    {
      icon: Trash,
      label: "Delete link",
      shortcut: "D",
    },
  ];
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="max-w-md border-white bg-gray-100">
    <Dialog.Header>
      <Dialog.Title class="text-lg font-medium">Keyboard shortcuts</Dialog.Title
      >
    </Dialog.Header>
    <div class="grid grid-cols-2 gap-4">
      {#each shortcuts as { icon: Icon, label, shortcut }}
        <div
          class="flex items-start justify-between gap-3 rounded-lg bg-white p-4"
        >
          <div class="flex flex-col items-start justify-start gap-2">
            <Icon class="h-5 w-5" />
            <span class="text-sm font-medium">{label}</span>
          </div>

          <kbd
            class="rounded-md bg-muted/20 px-2 py-1 text-xs text-muted-foreground"
            >{shortcut}</kbd
          >
        </div>
      {/each}
    </div>
  </Dialog.Content>
</Dialog.Root>
