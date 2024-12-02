<script lang="ts">
  import * as Form from "$lib/components/ui/form/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { env } from "$env/dynamic/public";
  import { urlSchema, type UrlSchema } from "$lib/schema/url";
  import { generateSlug, generatePassword } from "$lib";
  import { toast } from "svelte-sonner";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { Switch } from "$lib/components/ui/switch";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { scrapeMetadata } from "$lib/utils/index";
  import { TagsSelector, QRCode } from "$lib/components/ui/core/misc";
  import { windowSize } from "$lib/window-size";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { Shuffle, Copy, Eye, EyeOff, AlertCircleIcon } from "lucide-svelte";
  import {
    convertExpirationToDate,
    convertExpirationToHumanReadable,
  } from "$lib/utils/datetime";
  import { Label } from "$lib/components/ui/label";
  import type { TagsResponse } from "$lib/types";
  import { initKeyboardShortcuts, type Shortcut } from "$lib/keyboard";

  interface Props {
    user_id: string;
    data: SuperValidated<Infer<UrlSchema>>;
    show?: boolean;
    onOpenChange?: (open: boolean) => void;
    tags: TagsResponse[];
  }

  type Tab = "edit-data" | "meta-data";

  let currentTab = $state<Tab>("edit-data");
  let { data, user_id, show = false, onOpenChange, tags }: Props = $props();
  let url_tags = $state<TagsResponse[]>(tags);
  let isSubmitting = $state(false);

  $effect(() => {
    url_tags = tags;
  });

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(urlSchema),
    onResult: async ({ result }) => {
      isSubmitting = false;
      if (result.type === "success") {
        toast.success("URL shortened successfully!");
        onOpenChange?.(false);
      } else {
        toast.error(result.data?.message || "Failed to create URL");
      }
    },
  });

  const { form: formData, enhance } = form;

  let longUrlInput = $state<HTMLInputElement | null>(null);
  let showPassword = $state(false);
  let metaDataEnabled = $state(false);

  // window size
  let size = windowSize.getSize();

  // check if the window size is greater than 768px
  const isDesktop = $derived($size.width > 768);

  // QR code
  let shortUrl = $derived(
    $formData.slug ? `${env.PUBLIC_APPLICATION_NAME}/${$formData.slug}` : "",
  );
  // Focus input when form opens
  $effect(() => {
    if (show) {
      setTimeout(() => longUrlInput?.focus(), 50);
      $formData.created_by = user_id;
    }
  });

  let rawExpirationInput = $state<string>("");
  let expirationDisplay = $state<string>("");

  function handleExpirationInput(e: Event) {
    rawExpirationInput = (e.target as HTMLInputElement).value;
  }

  function processExpiration() {
    try {
      if (rawExpirationInput) {
        // Convert to ISO and store in formData
        $formData.expiration = convertExpirationToDate(rawExpirationInput);
        // Update display
        expirationDisplay = convertExpirationToHumanReadable(
          $formData.expiration,
        );
        rawExpirationInput = expirationDisplay;
      } else {
        // Clear expiration if input is empty
        $formData.expiration = "";
        expirationDisplay = "";
      }
    } catch (error) {
      console.error("Failed to parse date:", error);
    }
  }

  function handleExpirationBlur() {
    processExpiration();
  }

  async function handleMetaFetch() {
    if (!$formData.url || isSubmitting) return;

    try {
      const response = await scrapeMetadata($formData.url);
      if (response) {
        metaDataEnabled = true;
        $formData.meta_title = response.title || "";
        $formData.meta_description = response.description || "";

        if (response.imageUrl) {
          let imageUrl = response.imageUrl;

          // Handle relative paths by adding base URL
          if (imageUrl.startsWith("/")) {
            try {
              const baseUrl = new URL($formData.url);
              imageUrl = `${baseUrl.origin}${imageUrl}`;
            } catch (e) {
              console.warn("Invalid base URL:", $formData.url);
            }
          }

          // Validate final URL
          try {
            new URL(imageUrl);
            $formData.meta_image_url = imageUrl;
          } catch (e) {
            console.warn("Invalid meta image URL:", imageUrl);
            $formData.meta_image_url = "";
          }
        } else {
          $formData.meta_image_url = "";
        }
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("Failed to fetch metadata");
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
              .querySelector("form#new-url-form")
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
          use:enhance={() => {
            isSubmitting = true;
            return {};
          }}
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
                disabled={isSubmitting}
                class={isSubmitting ? "opacity-50" : ""}
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
                    on:input={(e) => {
                      // Replace spaces with hyphens and remove other special characters
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/\s+/g, "-") // Replace one or more spaces with single hyphen
                        .replace(/[^a-zA-Z0-9-]/g, ""); // Remove remaining special chars
                      $formData.slug = e.currentTarget.value;
                    }}
                    on:keydown={(e) => {
                      if (e.key === "/") {
                        e.preventDefault();
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
            <Form.FieldErrors />
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
                  bind:value={rawExpirationInput}
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
                  bind:value={$formData.expiration_url}
                  class="h-12 rounded-2xl bg-input/20"
                  on:keydown={(e) => {
                    if (e.key === "/") {
                      e.stopPropagation();
                    }
                  }}
                />
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
          </div>

          <!-- Tags -->
          <Form.Field {form} name="tags">
            <Form.Control>
              <Form.Label class="text-muted-foreground">Tags</Form.Label>
              <TagsSelector
                {tags}
                onSelect={handleTagsSelect}
                selectedTags={[]}
                onRefreshTags={async () => {
                  console.log("Refreshing tags");
                  const response = await fetch("/api/tags");
                  console.log("response from fetch", response);
                  url_tags = await response.json();
                  console.log("tags", url_tags);
                }}
              />
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
              <input
                {...attrs}
                type="hidden"
                value={$formData.meta_image_url}
              />
            </Form.Control>
          </Form.Field>

          <div class="flex justify-end">
            <!-- Create link button -->
            <Button type="submit" class="rounded-2xl" disabled={isSubmitting}>
              {#if isSubmitting}
                <div
                  class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                />
                Creating...
              {:else}
                Create Link
                <kbd
                  class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
                >
                  C
                </kbd>
              {/if}
            </Button>
          </div>
        </form>
      </div>

      <!-- QR Code Section -->
      <div
        id="qr-code-section"
        class="flex flex-col items-center justify-start rounded-r-3xl bg-preview p-8"
      >
        <h2 class="mb-4 text-lg text-amber-900">QR Code</h2>
        {#if shortUrl}
          <QRCode url={shortUrl} size={200} />
        {:else}
          <div
            class="mb-8 flex h-48 w-48 items-center justify-center rounded-lg bg-preview-foreground"
          >
            <p class="text-balance text-center text-sm text-amber-900">
              Need short link to generate QR
            </p>
          </div>
        {/if}
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
              <Label class="text-sm font-medium text-amber-900"
                >Description</Label
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
              <Label class="text-sm font-medium text-amber-900">Image URL</Label
              >
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
{:else}
  <Drawer.Root open={show} {onOpenChange}>
    <Drawer.Portal>
      <Drawer.Content
        class="fixed inset-x-0 bottom-0 h-[97%] rounded-t-3xl bg-white"
      >
        <div class="h-full overflow-y-auto">
          <Tabs.Root
            value={currentTab}
            onValueChange={(e) => {
              currentTab = e as Tab;
              // Scroll to top when switching tabs
              const drawerContent = document.querySelector(".drawer-content");
              if (drawerContent) {
                drawerContent.scrollTop = 0;
              }
            }}
            class="flex w-full flex-col items-center justify-center"
          >
            <Tabs.List class="mt-4 w-fit rounded-2xl bg-input/20">
              <Tabs.Trigger value="edit-data" class="rounded-xl"
                >Edit</Tabs.Trigger
              >
              <Tabs.Trigger value="meta-data" class="rounded-xl"
                >Meta data</Tabs.Trigger
              >
            </Tabs.List>

            <div class="h-auto w-full p-5">
              <Tabs.Content value="edit-data" class="h-auto w-full space-y-6">
                <form
                  method="POST"
                  action="?/shorten"
                  use:enhance={() => {
                    isSubmitting = true;
                    return {};
                  }}
                  class="space-y-6"
                >
                  <Dialog.Header>
                    <Dialog.Title class="w-full text-start text-2xl font-medium"
                      >New link</Dialog.Title
                    >
                  </Dialog.Header>

                  <!-- Destination URL -->
                  <Form.Field {form} name="url">
                    <Form.Control let:attrs>
                      <div class="flex items-center">
                        <Form.Label
                          class="flex items-center text-muted-foreground"
                        >
                          Destination URL <span class="text-destructive">*</span
                          >
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
                        disabled={isSubmitting}
                        class={isSubmitting ? "opacity-50" : ""}
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
                      <Form.Label
                        class="flex items-center text-muted-foreground"
                      >
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
                            on:input={(e) => {
                              // Replace spaces with hyphens and remove other special characters
                              e.currentTarget.value = e.currentTarget.value
                                .replace(/\s+/g, "-") // Replace one or more spaces with single hyphen
                                .replace(/[^a-zA-Z0-9-]/g, ""); // Remove remaining special chars
                              $formData.slug = e.currentTarget.value;
                            }}
                            on:keydown={(e) => {
                              if (e.key === "/" || e.key === " ") {
                                e.preventDefault();
                              }
                              // Remove space prevention since we now handle it
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
                      <Form.Label
                        class="flex items-center text-muted-foreground"
                      >
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
                        <Form.Label
                          class="flex items-center text-muted-foreground"
                          >Expiration date
                          <Tooltip.Root openDelay={200}>
                            <Tooltip.Trigger>
                              <AlertCircleIcon class="ml-2 size-4" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>
                                Enter an expiration date for your link. You can
                                use relative dates like "tomorrow at 5pm" or "10
                                minutes from now" or "Next week" or absolute
                                dates like "2024-01-01".
                              </p>
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Form.Label>

                        <Input
                          {...attrs}
                          type="text"
                          placeholder="tomorrow at 5pm"
                          class="h-12 rounded-2xl bg-input/20"
                          bind:value={rawExpirationInput}
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
                        <Form.Label
                          class="flex items-center text-muted-foreground"
                        >
                          Expiration link
                          <Tooltip.Root openDelay={200}>
                            <Tooltip.Trigger>
                              <AlertCircleIcon class="ml-2 size-4" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>
                                Enter an expiration link for your link. When the
                                link is expired and visited, it will redirect to
                                the secondary URL.
                              </p>
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Form.Label>
                        <Input
                          {...attrs}
                          type="text"
                          placeholder="Secondary-URL"
                          bind:value={$formData.expiration_url}
                          class="h-12 rounded-2xl bg-input/20"
                          on:keydown={(e) => {
                            if (e.key === "/") {
                              e.stopPropagation();
                            }
                          }}
                        />
                      </Form.Control>
                      <Form.FieldErrors />
                    </Form.Field>
                  </div>

                  <!-- Tags -->
                  <Form.Field {form} name="tags">
                    <Form.Control>
                      <Form.Label class="text-muted-foreground">Tags</Form.Label
                      >
                      <TagsSelector
                        {tags}
                        selectedTags={$formData.tags || []}
                        onSelect={handleTagsSelect}
                      />
                    </Form.Control>
                    <Form.FieldErrors />
                    <input
                      type="hidden"
                      bind:value={$formData.tags}
                      name="tags"
                    />
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
                      <input
                        {...attrs}
                        type="hidden"
                        value={$formData.meta_title}
                      />
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
                      <input
                        {...attrs}
                        type="hidden"
                        value={$formData.meta_image_url}
                      />
                    </Form.Control>
                  </Form.Field>

                  <div class="flex justify-end">
                    <!-- Create link button -->
                    <Button
                      type="submit"
                      class="w-full rounded-2xl"
                      disabled={isSubmitting}
                    >
                      {#if isSubmitting}
                        <div
                          class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        />
                        Creating...
                      {:else}
                        Create Link
                        <kbd
                          class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
                        >
                          C
                        </kbd>
                      {/if}
                    </Button>
                  </div>
                </form>
              </Tabs.Content>

              <Tabs.Content value="meta-data" class="h-auto w-full space-y-6">
                <h2 class="mb-4 text-lg">QR Code</h2>
                {#if shortUrl}
                  <QRCode url={shortUrl} size={200} />
                {:else}
                  <div
                    class="mb-8 flex h-48 w-48 items-center justify-center rounded-lg bg-input/20"
                  >
                    <p
                      class="text-balance text-center text-sm text-muted-foreground"
                    >
                      Need short link to generate QR
                    </p>
                  </div>
                {/if}
                <div class="flex w-full items-center justify-between">
                  <span class="text-sm font-medium text-muted-foreground"
                    >Meta data</span
                  >
                  <Switch
                    checked={metaDataEnabled}
                    onCheckedChange={(e) => {
                      metaDataEnabled = e;
                    }}
                    class="data-[state=unchecked]:bg-input/60"
                  />
                </div>

                {#if metaDataEnabled}
                  <div class="mt-3 flex w-full flex-col space-y-4">
                    <!-- Meta data title -->
                    <div class="flex flex-col items-start justify-start gap-2">
                      <Label class="text-muted-foreground">Title</Label>
                      <Input
                        name="meta_title"
                        bind:value={$formData.meta_title}
                        placeholder="Title"
                        class="h-12 rounded-2xl bg-input/20"
                        on:keydown={(e) => {
                          if (e.key === "/") {
                            e.stopPropagation();
                          }
                        }}
                      />
                    </div>

                    <!-- Meta data description -->
                    <div class="flex flex-col items-start justify-start gap-2">
                      <Label class="text-muted-foreground">Description</Label>
                      <Textarea
                        name="meta_description"
                        bind:value={$formData.meta_description}
                        placeholder="Description"
                        class="h-12 rounded-2xl bg-input/20"
                        on:keydown={(e) => {
                          if (e.key === "/") {
                            e.stopPropagation();
                          }
                        }}
                      />
                    </div>

                    <!-- Meta data image URL -->
                    <div class="flex flex-col items-start justify-start gap-2">
                      <Label class="text-muted-foreground">Image URL</Label>
                      <Input
                        name="meta_image_url"
                        bind:value={$formData.meta_image_url}
                        placeholder="Meta Image URL"
                        class="h-12 rounded-2xl bg-input/20"
                        on:keydown={(e) => {
                          if (e.key === "/") {
                            e.stopPropagation();
                          }
                        }}
                      />
                    </div>
                  </div>
                {/if}
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{/if}
