<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { toast } from "svelte-sonner";
  import * as Popover from "$lib/components/ui/popover";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import type { TagsResponse } from "$lib/types";
  import { AlertCircleIcon } from "lucide-svelte";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialName?: string;
    loading?: boolean;
    onSuccess?: (newTag: TagsResponse) => void;
  }

  let { open, onOpenChange, initialName = "", loading, onSuccess }: Props =
    $props();

  let name = $state(initialName);
  let color = $state<string>("slate");
  let colorPopoverOpen = $state(false);

  $effect(() => {
    name = initialName;
  });

  const tailwindColors = {
    slate: "bg-slate-500",
    gray: "bg-gray-500",
    zinc: "bg-zinc-500",
    neutral: "bg-neutral-500",
    stone: "bg-stone-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    lime: "bg-lime-500",
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    sky: "bg-sky-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    purple: "bg-purple-500",
    fuchsia: "bg-fuchsia-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
  };

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          color,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`,
        );
      }

      const newTag = await response.json();
      toast.success("Tag created successfully");
      onSuccess?.(newTag);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag. Please try again.");
    }
  }
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="max-w-md rounded-2xl bg-white">
    <Dialog.Header>
      <Dialog.Title class="text-2xl font-medium">Create new tag</Dialog.Title>
    </Dialog.Header>

    <form onsubmit={handleSubmit} class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-center">
          <Label for="name" class="flex items-center text-muted-foreground">
            Name <span class="text-destructive">*</span>
          </Label>
          <Tooltip.Root openDelay={200}>
            <Tooltip.Trigger>
              <AlertCircleIcon class="ml-2 size-4" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Enter a name for your tag</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
        <Input
          id="name"
          bind:value={name}
          placeholder="Enter tag name"
          required
          class="h-12 rounded-2xl bg-input/20"
        />
      </div>

      <div class="space-y-2">
        <div class="flex items-center">
          <Label for="color" class="flex items-center text-muted-foreground">
            Color
          </Label>
          <Tooltip.Root openDelay={200}>
            <Tooltip.Trigger>
              <AlertCircleIcon class="ml-2 size-4" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Choose a color for your tag</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
        <Popover.Root bind:open={colorPopoverOpen}>
          <Popover.Trigger asChild let:builder>
            <Button
              builders={[builder]}
              variant="outline"
              class="h-12 w-full justify-start rounded-2xl bg-input/20"
            >
              <div class="flex items-center gap-2">
                <div
                  class={`h-4 w-4 rounded-full ${tailwindColors[color]}`}
                ></div>
                <span class="capitalize">{color}</span>
              </div>
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-[300px] rounded-2xl bg-white p-2">
            <div class="grid grid-cols-3 gap-2">
              {#each Object.entries(tailwindColors) as [colorName, colorClass]}
                <Button
                  variant="ghost"
                  class="h-8 justify-start p-2"
                  on:click={() => {
                    color = colorName;
                    colorPopoverOpen = false;
                  }}
                >
                  <div class="flex items-center gap-2">
                    <div class={`h-4 w-4 rounded-full ${colorClass}`}></div>
                    <span class="text-xs capitalize">{colorName}</span>
                  </div>
                </Button>
              {/each}
            </div>
          </Popover.Content>
        </Popover.Root>

        <input type="hidden" name="color" value={color} />
      </div>

      <div class="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          on:click={() => onOpenChange(false)}
          class="rounded-2xl"
        >
          Cancel
        </Button>
        <Button type="submit" class="rounded-2xl" disabled={loading}>
          {loading ? 'Creating...' : 'Create tag'}
          <kbd
            class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
          >
            ⏎
          </kbd>
        </Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
