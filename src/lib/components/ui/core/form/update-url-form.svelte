<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { env } from "$env/dynamic/public";
  import { urlSchema } from "$lib/schema/url";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Switch } from "$lib/components/ui/switch";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { TagsSelector } from "$lib/components/ui/core/misc";
  import type { TagsResponse, UrlsResponseWithTags } from "$lib/types";
  import { superForm } from "sveltekit-superforms/client";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { Eye, EyeOff, AlertCircleIcon } from "lucide-svelte";
  import * as chrono from "chrono-node";
  import { Label } from "$lib/components/ui/label";
  import type { SuperValidated, Infer } from "sveltekit-superforms";
  import { type UrlSchema } from "$lib/schema/url";

  interface Props {
    url: UrlsResponseWithTags;
    data: SuperValidated<Infer<UrlSchema>>;

    show?: boolean;
    onOpenChange?: (open: boolean) => void;
    tags: TagsResponse[];
  }

  let { url, show = false, onOpenChange, tags }: Props = $props();

  const form = superForm({
    id: "update-url",
    dataType: "json",
    validators: zodClient(urlSchema),
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("URL updated successfully!");
        onOpenChange?.(false);
      }
    },
  });

  const { form: formData, enhance } = form;

  let showPassword = $state(false);
  let metaDataEnabled = $state(
    !!url?.meta_title || !!url?.meta_description || !!url?.meta_image_url,
  );

  function handleExpirationInput(e: Event) {
    const input = (e.target as HTMLInputElement).value;
    const parsed = chrono.parseDate(input);
    if (parsed) {
      $formData.expiration = parsed.toISOString().slice(0, 16);
    }
  }

  function handleExpirationBlur(e: Event) {
    const input = e.target as HTMLInputElement;
    if ($formData.expiration) {
      const date = new Date($formData.expiration);
      input.value = date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  }

  function handleTagsSelect(selectedTags: string[]) {
    $formData.tags_id = selectedTags;
  }
</script>

<Dialog.Root open={show} {onOpenChange}>
  <Dialog.Content
    class="-gap-4 grid max-w-5xl grid-cols-[3fr,2fr] overflow-scroll rounded-3xl border-2 border-white bg-[#ffd78d] p-0"
  >
    <div
      id="left-section"
      class="z-10 space-y-6 rounded-2xl bg-white p-8 shadow-right"
    >
      <form method="POST" action="?/update" use:enhance class="space-y-6">
        <Dialog.Header>
          <Dialog.Title class="text-2xl font-medium">Update link</Dialog.Title>
        </Dialog.Header>

        <!-- Hidden ID field -->
        <input type="hidden" name="id" value={url.id} />

        <!-- URL Field -->
        <Form.Field {form} name="url">
          <Form.Control let:attrs>
            <Form.Label class="flex items-center text-muted-foreground">
              URL <span class="text-destructive">*</span>
            </Form.Label>
            <Input {...attrs} bind:value={$formData.url} type="url" required />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Slug Field -->
        <Form.Field {form} name="slug">
          <Form.Control let:attrs>
            <Form.Label class="flex items-center text-muted-foreground">
              Custom URL
            </Form.Label>
            <div class="flex rounded-2xl">
              <div
                class="relative flex flex-1 rounded-l-2xl border bg-input/20"
              >
                <span
                  class="flex items-center rounded-l-2xl bg-transparent px-3 py-2 pl-3 font-mono text-sm text-muted-foreground"
                >
                  {env.PUBLIC_APPLICATION_NAME}/
                </span>
                <Input
                  {...attrs}
                  bind:value={$formData.slug}
                  class="h-12 rounded-none border-none bg-input/20"
                />
              </div>
            </div>
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Password Field -->
        <Form.Field {form} name="password_hash">
          <Form.Control let:attrs>
            <Form.Label class="flex items-center text-muted-foreground"
              >Password</Form.Label
            >
            <div class="flex">
              <Input
                {...attrs}
                type={showPassword ? "text" : "password"}
                bind:value={$formData.password_hash}
                class="h-12 rounded-r-none bg-input/20"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                on:click={() => (showPassword = !showPassword)}
                class="h-12 w-16 rounded-l-none rounded-r-2xl bg-input/20"
              >
                {#if showPassword}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </Button>
            </div>
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Expiration Fields -->
        <div class="grid grid-cols-2 gap-4">
          <Form.Field {form} name="expiration">
            <Form.Control let:attrs>
              <Form.Label class="flex items-center text-muted-foreground">
                Expiration date
                <Tooltip.Root openDelay={200}>
                  <Tooltip.Trigger>
                    <AlertCircleIcon class="ml-2 size-4" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>Enter an expiration date for your link.</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Form.Label>
              <Input
                {...attrs}
                type="text"
                class="h-12 rounded-2xl bg-input/20"
                on:input={handleExpirationInput}
                on:blur={handleExpirationBlur}
              />
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>

          <Form.Field {form} name="expiration_url">
            <Form.Control let:attrs>
              <Form.Label class="flex items-center text-muted-foreground">
                Expiration link
                <Tooltip.Root openDelay={200}>
                  <Tooltip.Trigger>
                    <AlertCircleIcon class="ml-2 size-4" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>Enter a URL to redirect to after expiration.</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Form.Label>
              <Input
                {...attrs}
                type="url"
                bind:value={$formData.expiration_url}
                class="h-12 rounded-2xl bg-input/20"
              />
            </Form.Control>
            <Form.FieldErrors />
          </Form.Field>
        </div>

        <!-- Tags Field -->
        <Form.Field {form} name="tags_id">
          <Form.Control>
            <Form.Label class="text-muted-foreground">Tags</Form.Label>
            <TagsSelector
              {tags}
              onSelect={handleTagsSelect}
              selectedTags={$formData.tags_id}
            />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Metadata Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <Label class="text-muted-foreground">Meta data</Label>
            <Switch
              checked={metaDataEnabled}
              onCheckedChange={(checked) => (metaDataEnabled = checked)}
            />
          </div>

          {#if metaDataEnabled}
            <Form.Field {form} name="meta_title">
              <Form.Control let:attrs>
                <Form.Label class="text-muted-foreground">Title</Form.Label>
                <Input
                  {...attrs}
                  bind:value={$formData.meta_title}
                  class="h-12 rounded-2xl bg-input/20"
                />
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="meta_description">
              <Form.Control let:attrs>
                <Form.Label class="text-muted-foreground"
                  >Description</Form.Label
                >
                <Textarea
                  {...attrs}
                  bind:value={$formData.meta_description}
                  class="rounded-2xl bg-input/20"
                />
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Form.Field {form} name="meta_image_url">
              <Form.Control let:attrs>
                <Form.Label class="text-muted-foreground">Image URL</Form.Label>
                <Input
                  {...attrs}
                  bind:value={$formData.meta_image_url}
                  type="url"
                  class="h-12 rounded-2xl bg-input/20"
                />
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
          {/if}
        </div>

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            class="rounded-2xl"
            on:click={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button type="submit" class="rounded-2xl">Update link</Button>
        </div>
      </form>
    </div>

    <!-- QR Code Section -->
    <div
      id="qr-code-section"
      class="flex flex-col items-center justify-start rounded-r-3xl bg-preview p-8"
    >
      <h2 class="mb-4 text-lg text-amber-900">QR Code</h2>
      <div
        class="mb-8 flex h-48 w-48 items-center justify-center rounded-lg bg-preview-foreground"
      >
        <p class="text-balance text-center text-sm text-amber-900">
          QR code will be generated for: {env.PUBLIC_APPLICATION_NAME}/{$formData.slug}
        </p>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
