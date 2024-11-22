<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { env } from "$env/dynamic/public";
  import { urlSchema, type UrlSchema } from "$lib/schema/url";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Switch } from "$lib/components/ui/switch";
  import { Textarea } from "$lib/components/ui/textarea";
  import { browser } from "$app/environment";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { TagsSelector } from "$lib/components/ui/core/misc";
  import { windowSize } from "$lib/window-size";
  import type { TagsResponse, UrlsResponseWithTags } from "$lib/types";
  import { AlertCircle } from "lucide-svelte";
  import SuperDebug, { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  interface Props {
    url: UrlsResponseWithTags | null;
    show?: boolean;
    onOpenChange?: (open: boolean) => void;
    tags: TagsResponse[];
  }

  let { url, show = false, onOpenChange, tags }: Props = $props();
  
  // Initialize form only when url is available
  const form = superForm({
    id: "edit-url-form",
    data: {
      url: url?.url || "",
      slug: url?.slug || "",
      password_hash: url?.password_hash || "",
      expiration: url?.expiration || "",
      expiration_url: url?.expiration_url || "",
      tags: url?.expand?.tags_id?.map(t => t.id) || [],
      meta_title: url?.meta_title || "",
      meta_description: url?.meta_description || "",
      meta_image_url: url?.meta_image_url || "",
      created_by: url?.created_by || ""
    },
    validators: zodClient(urlSchema),
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("URL updated successfully!");
        onOpenChange?.(false);
      }
    },
  });

  const { form: formData, enhance } = form;

  let metaDataEnabled = $state(
    !!(url?.meta_title || url?.meta_description || url?.meta_image_url)
  );

  // window size
  let size = windowSize.getSize();
  const isDesktop = $derived($size.width > 768);

  function handleTagsSelect(tags: string[]) {
    $formData.tags = tags;
  }
</script>

{#if url && isDesktop}
  <Dialog.Root open={show} {onOpenChange}>
    <Dialog.Content class="max-w-2xl space-y-6 rounded-3xl p-6">
      <Dialog.Header>
        <Dialog.Title>Edit link</Dialog.Title>
      </Dialog.Header>

      <form
        method="POST"
        action="?/update"
        use:enhance
        class="space-y-6"
      >
        <input type="hidden" name="id" value={url.id} />

        <!-- URL -->
        <Form.Field {form} name="url">
          <Form.Control let:attrs>
            <Form.Label>Destination URL</Form.Label>
            <Input {...attrs} bind:value={$formData.url} type="url" required />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Slug -->
        <Form.Field {form} name="slug">
          <Form.Control let:attrs>
            <Form.Label>Custom URL</Form.Label>
            <div class="flex rounded-md">
              <span class="inline-flex items-center rounded-l-md border border-r-0 px-3 text-gray-500">
                {env.PUBLIC_APPLICATION_NAME}/
              </span>
              <Input {...attrs} bind:value={$formData.slug} class="rounded-l-none" />
            </div>
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Tags -->
        <Form.Field {form} name="tags">
          <Form.Control>
            <Form.Label>Tags</Form.Label>
            <TagsSelector 
              {tags} 
              onSelect={handleTagsSelect}
              selectedTags={url.expand?.tags_id?.map(t => t.id) || []}
            />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Meta Data Toggle -->
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Meta data</span>
          <Switch
            checked={metaDataEnabled}
            onCheckedChange={(e) => {
              metaDataEnabled = e;
            }}
          />
        </div>

        {#if metaDataEnabled}
          <div class="space-y-4">
            <Form.Field {form} name="meta_title">
              <Form.Control let:attrs>
                <Form.Label>Title</Form.Label>
                <Input {...attrs} bind:value={$formData.meta_title} />
              </Form.Control>
            </Form.Field>

            <Form.Field {form} name="meta_description">
              <Form.Control let:attrs>
                <Form.Label>Description</Form.Label>
                <Textarea {...attrs} bind:value={$formData.meta_description} />
              </Form.Control>
            </Form.Field>

            <Form.Field {form} name="meta_image_url">
              <Form.Control let:attrs>
                <Form.Label>Image URL</Form.Label>
                <Input {...attrs} bind:value={$formData.meta_image_url} type="url" />
              </Form.Control>
            </Form.Field>
          </div>
        {/if}

        <div class="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onclick={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            Save changes
          </Button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{:else if url}
  <Drawer.Root open={show} {onOpenChange}>
    <Drawer.Content class="px-4 pb-4">
      <Drawer.Header>
        <Drawer.Title>Edit link</Drawer.Title>
      </Drawer.Header>

      <!-- Same form content as above -->
    </Drawer.Content>
  </Drawer.Root>
{/if}