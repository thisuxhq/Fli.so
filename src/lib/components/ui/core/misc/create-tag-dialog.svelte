<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { toast } from "svelte-sonner";
  import * as Select from "$lib/components/ui/select";

  interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialName?: string;
    onSuccess?: () => void;
  }

  let { open, onOpenChange, initialName = "", onSuccess }: Props = $props();
  
  let name = $state(initialName);
  let color = $state<string>("slate");

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

  async function handleSubmit() {
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
        throw new Error("Failed to create tag");
      }

      toast.success("Tag created successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create tag");
      console.error(error);
    }
  }
</script>

<Dialog.Root {open} {onOpenChange}>
  <Dialog.Content class="max-w-md">
    <Dialog.Header>
      <Dialog.Title>Create new tag</Dialog.Title>
    </Dialog.Header>

    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="name">Name</Label>
        <Input
          id="name"
          bind:value={name}
          placeholder="Enter tag name"
          required
          class="h-12 rounded-2xl"
        />
      </div>

      <div class="space-y-2">
        <Label for="color">Color</Label>
        <Select.Root bind:value={color}>
          <Select.Trigger class="h-12 rounded-2xl">
            <Select.Value placeholder="Select a color">
              <div class="flex items-center gap-2">
                <div class={`h-4 w-4 rounded-full ${tailwindColors[color]}`} />
                <span class="capitalize">{color}</span>
              </div>
            </Select.Value>
          </Select.Trigger>
          <Select.Content>
            {#each Object.entries(tailwindColors) as [colorName, colorClass]}
              <Select.Item value={colorName} class="flex items-center gap-2">
                <div class={`h-4 w-4 rounded-full ${colorClass}`} />
                <span class="capitalize">{colorName}</span>
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <div class="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onclick={() => onOpenChange(false)}
          class="rounded-2xl"
        >
          Cancel
        </Button>
        <Button type="submit" class="rounded-2xl">Create tag</Button>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root> 