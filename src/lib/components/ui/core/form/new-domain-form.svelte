<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import * as Select from "$lib/components/ui/select";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { windowSize } from "$lib/window-size";
  import { AlertCircleIcon } from "lucide-svelte";
  import { initKeyboardShortcuts, type Shortcut } from "$lib/keyboard";
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { domainSchema } from "$lib/schema/domain";

  interface Props {
    user_id: string;
    data: any; // Replace with proper type from your schema
    show?: boolean;
    onOpenChange?: (open: boolean) => void;
  }

  let { data, user_id, show = false, onOpenChange }: Props = $props();
  let isSubmitting = $state(false);

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(domainSchema),
    onResult: async ({ result }) => {
      isSubmitting = false;
      if (result.type === "success") {
        toast.success("Domain added successfully!");
        onOpenChange?.(false);
      } else {
        toast.error(result.data?.message);
      }
    },
  });

  const { form: formData, enhance } = form;

  // window size
  let size = windowSize.getSize();
  const isDesktop = $derived($size.width > 768);

  const shortcuts: Shortcut[] = [
    {
      key: "Escape",
      handler: (e) => {
        if (show) {
          e.preventDefault();
          onOpenChange?.(false);
        }
      },
    },
    {
      key: "Enter",
      ctrl: true,
      handler: async (e) => {
        if (show && !isSubmitting) {
          e.preventDefault();
          isSubmitting = true;
          try {
            await document
              .querySelector("form#new-domain-form")
              ?.dispatchEvent(new Event("submit", { cancelable: true }));
          } finally {
            isSubmitting = false;
          }
        }
      },
    },
  ];

  $effect(() => {
    if (show) {
      return initKeyboardShortcuts(shortcuts);
    }
  });
</script>

{#if isDesktop}
  <Dialog.Root open={show} {onOpenChange}>
    <Dialog.Content class="rounded-4xl max-w-md bg-white p-6">
      <form
        id="new-domain-form"
        method="POST"
        action="?/add"
        use:enhance={() => {
          isSubmitting = true;
          return {};
        }}
        class="space-y-6"
      >
        <Dialog.Header>
          <Dialog.Title class="text-2xl font-medium"
            >Add new domain</Dialog.Title
          >
        </Dialog.Header>

        <!-- Domain Name -->
        <Form.Field {form} name="domain">
          <Form.Control let:attrs>
            <div class="flex items-center">
              <Form.Label class="flex items-center text-muted-foreground">
                Domain name <span class="text-destructive">*</span>
              </Form.Label>
              <Tooltip.Root openDelay={200}>
                <Tooltip.Trigger>
                  <AlertCircleIcon class="ml-2 size-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Enter your domain name (e.g., example.com)</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
            <Input
              {...attrs}
              bind:value={$formData.domain}
              type="text"
              placeholder="example.com"
              required
              class="h-12 rounded-2xl bg-input/20"
            />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Verification Method -->
        <Form.Field {form} name="verification_method">
          <Form.Control let:attrs>
            <div class="flex items-center">
              <Form.Label class="flex items-center text-muted-foreground">
                Verification method <span class="text-destructive">*</span>
              </Form.Label>
              <Tooltip.Root openDelay={200}>
                <Tooltip.Trigger>
                  <AlertCircleIcon class="ml-2 size-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Choose how you want to verify your domain ownership</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
            <Select.Root
              bind:value={$formData.verification_method}
              class="h-12 rounded-2xl bg-input/20"
            >
              <Select.Trigger class="h-12 w-full rounded-2xl bg-input/20">
                <Select.Value placeholder="Select verification method" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="dns">DNS TXT Record</Select.Item>
                <Select.Item value="file">File Upload</Select.Item>
              </Select.Content>
            </Select.Root>
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <input type="hidden" name="user_id" value={user_id} />

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onclick={() => onOpenChange?.(false)}
            class="rounded-2xl"
          >
            Cancel
          </Button>
          <Button type="submit" class="rounded-2xl" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add domain"}
          </Button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root open={show} {onOpenChange}>
    <Drawer.Portal>
      <Drawer.Content
        class="fixed inset-x-0 bottom-0 h-[70%] rounded-t-3xl bg-white p-6"
      >
        <form
          id="new-domain-form"
          method="POST"
          action="?/add"
          use:enhance={() => {
            isSubmitting = true;
            return {};
          }}
          class="space-y-6"
        >
          <!-- Same form content as desktop version -->
          <!-- ... -->
        </form>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{/if}
