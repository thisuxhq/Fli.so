<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { env } from "$env/dynamic/public";
  import { urlSchema, type UrlSchema } from "$lib/schema/url";
  import { generateSlug, generatePassword } from "$lib";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Switch } from "$lib/components/ui/switch";
  import { Textarea } from "$lib/components/ui/textarea";
  import { browser } from "$app/environment";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { scrapeMetadata } from "$lib/utils/index";
  import { TagsSelector } from "$lib/components/ui/core/misc";

  import SuperDebug, {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { Shuffle, Copy, Eye, EyeOff, AlertCircleIcon } from "lucide-svelte";
  import * as chrono from "chrono-node";
  import { Label } from "$lib/components/ui/label";
  import type { TagsResponse } from "$lib/types";

  interface Props {
    user_id: string;
    data: SuperValidated<Infer<UrlSchema>>;
    show?: boolean;
    onOpenChange?: (open: boolean) => void;
    tags: TagsResponse[];
  }

  let { data, user_id, show = false, onOpenChange, tags }: Props = $props();

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(urlSchema),
    onResult: ({ result }) => {
      if (result.type === "success") {
        toast.success("URL shortened successfully!");
        onOpenChange?.(false);
      }
    },
  });

  const { form: formData, enhance } = form;

  let longUrlInput: HTMLInputElement | null = null;
  let showPassword = $state(false);
  let metaDataEnabled = $state(false);

  // Focus input when form opens
  $effect(() => {
    if (show) {
      setTimeout(() => longUrlInput?.focus(), 50);
      $formData.created_by = user_id;
    }
  });

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

  async function handleMetaFetch() {
    const response = await scrapeMetadata($formData.url);

    if (response) {
      metaDataEnabled = true;
      $formData.meta_title = response.title;
      $formData.meta_description = response.description;
      $formData.meta_image_url = response.imageUrl;
    }
  }

  async function suggestSlug() {
    console.log("Generating slug");
    $formData.slug = generateSlug();
  }

  async function suggestPasswordAndCopy() {
    const password = generatePassword();
    $formData.password_hash = password;
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard");
    } catch (err) {
      console.error("Failed to copy password:", err);
      toast.error("Failed to copy password to clipboard");
    }
  }

  function handleTagsSelect(tags: string[]) {
    $formData.tags = tags;
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
      <form
        id="new-url-form"
        method="POST"
        action="?/shorten"
        use:enhance
        class="space-y-6"
      >
        <Dialog.Header>
          <Dialog.Title class="text-2xl font-medium">New link</Dialog.Title>
        </Dialog.Header>

        <!-- Destination URL -->
        <Form.Field {form} name="url">
          <Form.Control let:attrs>
            <div class="flex items-center">
              <Form.Label class="flex items-center text-muted-foreground">
                Destination URL <span class="text-destructive">*</span>
              </Form.Label>
              <Tooltip.Root openDelay={200}>
                <Tooltip.Trigger>
                  <AlertCircleIcon class="ml-2 size-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Enter the URL you want to shorten</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
            <Input
              {...attrs}
              bind:value={$formData.url}
              bind:this={longUrlInput}
              type="url"
              placeholder="https://www.example.com/path-to-destination"
              required
              on:input={handleMetaFetch}
              on:keydown={(e) => {
                if (e.key === "/") {
                  e.stopPropagation();
                }
              }}
            />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>

        <!-- Custom URL -->
        <Form.Field {form} name="slug">
          <Form.Control let:attrs>
            <Form.Label class="flex items-center text-muted-foreground">
              Custom URL
              <Tooltip.Root openDelay={200}>
                <Tooltip.Trigger>
                  <AlertCircleIcon class="ml-2 size-4 " />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Enter a custom URL</p>
                </Tooltip.Content>
              </Tooltip.Root>
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
                  placeholder="work"
                  pattern="[a-zA-Z0-9-]+"
                  class="h-12 rounded-none border-none bg-input/20"
                  on:keydown={(e) => {
                    if (e.key === "/") {
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                on:click={suggestSlug}
                class="h-12 w-12 rounded-l-none rounded-r-2xl bg-input/20"
              >
                <Shuffle class="h-4 w-4" />
              </Button>
            </div>
          </Form.Control>
        </Form.Field>

        <!-- Password -->
        <Form.Field {form} name="password_hash">
          <Form.Control let:attrs>
            <Form.Label class="flex items-center text-muted-foreground">
              Password
              <Tooltip.Root openDelay={200}>
                <Tooltip.Trigger>
                  <AlertCircleIcon class="ml-2 size-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Enter a password to protect your link</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </Form.Label>
            <div class="flex">
              <Input
                {...attrs}
                type={showPassword ? "text" : "password"}
                bind:value={$formData.password_hash}
                placeholder="••••••••"
                class="h-12 rounded-r-none bg-input/20"
                on:keydown={(e) => {
                  if (e.key === "/") {
                    e.stopPropagation();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                on:click={() => {
                  showPassword = !showPassword;
                }}
                class="h-12 w-16 rounded-none border-l-0 bg-input/20"
              >
                {#if showPassword}
                  <EyeOff class="h-4 w-4" />
                {:else}
                  <Eye class="h-4 w-4" />
                {/if}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                on:click={suggestPasswordAndCopy}
                class="h-12 w-16 rounded-none border-l-0 border-r-0 bg-input/20"
              >
                <Shuffle class="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                on:click={async () => {
                  if ($formData.password_hash) {
                    await navigator.clipboard.writeText(
                      $formData.password_hash,
                    );
                    toast.success("Password copied to clipboard");
                  }
                }}
                class="h-12 w-16 rounded-l-none rounded-r-2xl bg-input/20"
              >
                <Copy class="h-4 w-4" />
              </Button>
            </div>
          </Form.Control>
        </Form.Field>

        <!-- Expiration -->
        <div class="grid grid-cols-2 gap-4">
          <Form.Field {form} name="expiration">
            <Form.Control let:attrs>
              <Form.Label class="flex items-center text-muted-foreground"
                >Expiration date
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
                placeholder="tomorrow at 5pm"
                class="h-12 rounded-2xl bg-input/20"
                on:input={handleExpirationInput}
                on:blur={handleExpirationBlur}
                on:keydown={(e) => {
                  if (e.key === "/") {
                    e.stopPropagation();
                  }
                }}
              />
            </Form.Control>
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
                    <p>
                      Enter an expiration link for your link. When the link is
                      visited, it will redirect to the secondary URL.
                    </p>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Form.Label>
              <Input
                {...attrs}
                type="text"
                placeholder="Secondary-URL"
                class="h-12 rounded-2xl bg-input/20"
                on:keydown={(e) => {
                  if (e.key === "/") {
                    e.stopPropagation();
                  }
                }}
              />
            </Form.Control>
          </Form.Field>
        </div>

        <!-- Tags -->
        <Form.Field {form} name="tags">
          <Form.Control>
            <Form.Label class="text-muted-foreground">Tags</Form.Label>
            <TagsSelector {tags} onSelect={handleTagsSelect} />
          </Form.Control>
          <Form.FieldErrors />
          <input type="hidden" bind:value={$formData.tags} name="tags" />
        </Form.Field>

        <!-- Created by -->
        <Form.Field {form} name="created_by">
          <Form.Control let:attrs>
            <input {...attrs} type="hidden" value={user_id} />
          </Form.Control>
        </Form.Field>

        <!-- Meta data title -->
        <Form.Field {form} name="meta_title">
          <Form.Control let:attrs>
            <input {...attrs} type="hidden" value={$formData.meta_title} />
          </Form.Control>
        </Form.Field>

        <!-- Meta data description -->
        <Form.Field {form} name="meta_description">
          <Form.Control let:attrs>
            <input
              {...attrs}
              type="hidden"
              value={$formData.meta_description}
            />
          </Form.Control>
        </Form.Field>

        <!-- Meta data image URL -->
        <Form.Field {form} name="meta_image_url">
          <Form.Control let:attrs>
            <input {...attrs} type="hidden" value={$formData.meta_image_url} />
          </Form.Control>
        </Form.Field>

        <div class="flex justify-end">
          <!-- Create link button -->
          <Button type="submit" class="rounded-2xl">
            Create link
            <kbd
              class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
            >
              C
            </kbd>
          </Button>
        </div>

        {#if !browser}
          <SuperDebug data={$formData} />
        {/if}
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
          Need short link to generate QR
        </p>
      </div>
      <div class="flex w-full items-center justify-between">
        <span class="text-sm font-medium text-amber-900">Meta data</span>

        <Switch
          checked={metaDataEnabled}
          onCheckedChange={(e) => {
            metaDataEnabled = e;
          }}
        />
      </div>

      {#if metaDataEnabled}
        <div class="mt-3 flex w-full flex-col space-y-4 text-amber-900">
          <div class="flex flex-col items-start justify-start gap-2">
            <Label class="text-sm font-medium text-amber-900">Title</Label>
            <Input
              name="meta_title"
              bind:value={$formData.meta_title}
              placeholder="Title"
              class="h-12 rounded-2xl border-preview-border bg-preview-foreground"
              on:keydown={(e) => {
                if (e.key === "/") {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          <div class="flex flex-col items-start justify-start gap-2">
            <Label class="text-sm font-medium text-amber-900">Description</Label
            >
            <Textarea
              name="meta_description"
              bind:value={$formData.meta_description}
              placeholder="Description"
              class="h-12 rounded-2xl border-preview-border bg-preview-foreground"
              on:keydown={(e) => {
                if (e.key === "/") {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          <div class="flex flex-col items-start justify-start gap-2">
            <Label class="text-sm font-medium text-amber-900">Image URL</Label>
            <Input
              name="meta_image_url"
              bind:value={$formData.meta_image_url}
              placeholder="Meta Image URL"
              class="h-12 rounded-2xl border-preview-border bg-preview-foreground"
              on:keydown={(e) => {
                if (e.key === "/") {
                  e.stopPropagation();
                }
              }}
            />
          </div>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
