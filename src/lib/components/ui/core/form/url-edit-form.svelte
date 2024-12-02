<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { env } from "$env/dynamic/public";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Tabs from "$lib/components/ui/tabs";
  import { Switch } from "$lib/components/ui/switch";
  import { Textarea } from "$lib/components/ui/textarea";
  import { windowSize } from "$lib/window-size";
  import { Label } from "$lib/components/ui/label";
  import { Shuffle, Copy, Eye, EyeOff, AlertCircleIcon } from "lucide-svelte";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { TagsSelector, QRCode } from "$lib/components/ui/core/misc";
  import type { TagsResponse, UrlsResponseWithTags } from "$lib/types";
  import { toast } from "svelte-sonner";
  import {
    convertExpirationToDate,
    convertExpirationToHumanReadable,
  } from "$lib/utils/datetime";
  import { initKeyboardShortcuts, type Shortcut } from "$lib/keyboard";
  import { generateMemorablePassword } from "$lib/utils/password-generator";
  import { generateWordSlug } from "$lib/utils/slug-generator";
  import { scrapeMetadata } from "$lib/utils/index";

  type Tab = "edit-data" | "meta-data";
  let currentTab = $state<Tab>("edit-data");
  let showPassword = $state(false);
  let isSubmitting = $state(false);

  interface Props {
    url: UrlsResponseWithTags | null;
    show?: boolean;
    onOpenChange?: (open: boolean) => void;
    tags: TagsResponse[];
  }

  let { url, show = false, onOpenChange, tags }: Props = $props();

  // Initialize localUrl as null
  let localUrl = $state<UrlsResponseWithTags | null>(null);

  // Update localUrl when url changes, with proper null checking
  $effect(() => {
    if (url) {
      // Create a deep copy manually instead of using structuredClone
      localUrl = {
        ...url,
        expand: url.expand
          ? {
              tags_id: url.expand.tags_id ? [...url.expand.tags_id] : [],
            }
          : { tags_id: [] },
      };
    } else {
      localUrl = null;
    }
  });

  // Update all url references to localUrl with null checks
  let shortUrl = $derived(
    localUrl?.slug ? `${env.PUBLIC_APPLICATION_NAME}/${localUrl.slug}` : "",
  );

  let url_tags = $state<TagsResponse[]>(tags);
  let rawExpirationInput = $state("");
  let expirationDisplay = $state("");

  let expiration_url = $state("");
  let expiration_date = $state("");

  // Add this state to track if password was changed
  let passwordChanged = $state(false);

  async function suggestSlug() {
    if (localUrl) localUrl.slug = generateWordSlug();
  }

  async function suggestPasswordAndCopy() {
    const password = generateMemorablePassword();
    console.log("[suggestPasswordAndCopy] Generated memorable password:", password);
    
    try {
      await navigator.clipboard.writeText(password);
      if (localUrl) {
        localUrl.password_hash = password; // Store raw password, server will hash it
        passwordChanged = true;
      }
      toast.success("Password copied to clipboard");
    } catch (err) {
      console.error("[suggestPasswordAndCopy] Error:", err);
      toast.error("Failed to copy password to clipboard");
    }
  }

  $effect(() => {
    if (localUrl?.expiration) {
      expirationDisplay = convertExpirationToHumanReadable(localUrl.expiration);
      rawExpirationInput = expirationDisplay;
    } else {
      expirationDisplay = "";
      rawExpirationInput = "";
    }
  });

  function handleExpirationInput(e: Event) {
    rawExpirationInput = (e.target as HTMLInputElement).value;
  }

  function processExpiration() {
    try {
      if (localUrl && rawExpirationInput) {
        // Convert to ISO and store in localUrl
        localUrl.expiration = convertExpirationToDate(rawExpirationInput);
        // Update display
        expirationDisplay = convertExpirationToHumanReadable(
          localUrl.expiration,
        );
        rawExpirationInput = expirationDisplay;
      } else if (localUrl) {
        // Clear expiration if input is empty
        localUrl.expiration = "";
        expirationDisplay = "";
      }
    } catch (error) {
      console.error("Failed to parse date:", error);
    }
  }

  function handleExpirationBlur() {
    processExpiration();
  }

  let errors = $state<Record<string, string>>({});
  let metaDataEnabled = $state(
    show ||
      !!(
        localUrl?.meta_title ||
        localUrl?.meta_description ||
        localUrl?.meta_image_url
      ),
  );

  // window size
  let size = windowSize.getSize();
  const isDesktop = $derived($size.width > 768);

  // Modify the password input handler to track changes
  function handlePasswordChange(e: Event) {
    console.log("Password changed:", (e.target as HTMLInputElement).value);
    passwordChanged = true;
    if (localUrl) {
      localUrl.password_hash = (e.target as HTMLInputElement).value;
    }
  }

  // Update the handleSubmit function
  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!localUrl?.id) return;

    isSubmitting = true;
    console.log("Password changed flag:", passwordChanged);
    console.log("Current password value:", localUrl.password_hash);
    
    try {
      const payload = {
        id: localUrl.id,
        url: localUrl.url,
        slug: localUrl.slug,
        password_hash: passwordChanged ? (localUrl.password_hash || null) : undefined,
        expiration: expiration_date || null,
        expiration_url: expiration_url || null,
        meta_title: localUrl.meta_title || null,
        meta_description: localUrl.meta_description || null,
        meta_image_url: localUrl.meta_image_url || null,
        tags_id: localUrl.tags_id || [],
      };
      
      console.log("Sending payload:", payload);

      const response = await fetch(`/api/url`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update URL");
      }

      toast.success("URL updated successfully");
      onOpenChange?.(false);
    } catch (error) {
      console.error("Error updating URL:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update URL",
      );
    } finally {
      isSubmitting = false;
    }
  }

  function handleTagsSelect(tags: string[]) {
    if (localUrl) localUrl.tags_id = tags;
  }

  // Add keyboard shortcuts
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
            await handleSubmit(new Event("submit", { cancelable: true }));
          } finally {
            isSubmitting = false;
          }
        }
      },
    },
  ];

  // Add effect for keyboard shortcuts
  $effect(() => {
    if (show) {
      return initKeyboardShortcuts(shortcuts);
    }
  });

  $effect(() => {
    if (localUrl) {
      expiration_url = localUrl.expiration_url || "";
      expiration_date = localUrl.expiration
        ? convertExpirationToHumanReadable(localUrl.expiration)
        : "";
    }
  });

  // Update localUrl whenever the original url changes
  $effect(() => {
    if (url) {
      localUrl = structuredClone(url);
    }
  });

  async function handleMetaFetch() {
    if (!localUrl) return;

    const response = await scrapeMetadata(localUrl.url);

    if (response) {
      metaDataEnabled = true;
      localUrl.meta_title = response.title;
      localUrl.meta_description = response.description;
      localUrl.meta_image_url = response.imageUrl;
    }
  }

  // Watch for dialog close and reset localUrl to original url state
  $effect(() => {
    if (!show && url) {
      // Reset to original state when dialog closes
      localUrl = {
        ...url,
        expand: url.expand
          ? {
              tags_id: url.expand.tags_id ? [...url.expand.tags_id] : [],
            }
          : { tags_id: [] },
      };
      passwordChanged = false; // Reset the password changed flag
    }
  });
</script>

{#if localUrl && isDesktop}
  <Dialog.Root open={show} {onOpenChange}>
    <Dialog.Content
      class="-gap-4 grid max-w-5xl grid-cols-[3fr,2fr] overflow-scroll rounded-3xl border-2 border-white bg-[#ffd78d] p-0"
    >
      <div
        id="left-section"
        class="z-10 space-y-6 rounded-2xl bg-white p-8 shadow-right"
      >
        <form onsubmit={handleSubmit} class="space-y-6">
          <Dialog.Header>
            <Dialog.Title class="text-2xl font-medium">Edit link</Dialog.Title>
          </Dialog.Header>

          <input type="hidden" name="id" value={localUrl.id} />

          <!-- URL -->
          <div class="space-y-2">
            <div class="flex items-center">
              <Label for="url" class="flex items-center text-muted-foreground">
                Destination URL <span class="text-destructive">*</span>
              </Label>
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
              id="url"
              name="url"
              bind:value={localUrl.url}
              type="url"
              required
              class="h-12 rounded-2xl bg-input/20"
              on:input={handleMetaFetch}
              disabled={isSubmitting}
            />
            {#if errors.url}<p class="text-sm text-destructive">
                {errors.url}
              </p>{/if}
          </div>

          <!-- Slug -->
          <div class="space-y-2">
            <div class="flex items-center">
              <Label for="slug" class="flex items-center text-muted-foreground"
                >Custom URL</Label
              >
              <Tooltip.Root openDelay={200}>
                <Tooltip.Trigger>
                  <AlertCircleIcon class="ml-2 size-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Enter a custom URL</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
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
                  name="slug"
                  id="slug"
                  bind:value={localUrl.slug}
                  pattern="[a-zA-Z0-9-]+"
                  class="h-12 rounded-none border-none bg-input/20"
                  on:input={(e) => {
                    // Replace spaces with hyphens and remove other special characters
                    e.currentTarget.value = e.currentTarget.value
                      .replace(/\s+/g, "-") // Replace one or more spaces with single hyphen
                      .replace(/[^a-zA-Z0-9-]/g, ""); // Remove remaining special chars
                    localUrl.slug = e.currentTarget.value;
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
                class="h-12 w-12 rounded-l-none rounded-r-2xl bg-input/20"
                on:click={suggestSlug}
              >
                <Shuffle class="h-4 w-4" />
              </Button>
            </div>
            {#if errors.slug}<p class="text-sm text-destructive">
                {errors.slug}
              </p>{/if}
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <div class="flex items-center">
              <Label class="flex items-center text-muted-foreground"
                >Password</Label
              >
              <Tooltip.Root openDelay={200}>
                <Tooltip.Trigger>
                  <AlertCircleIcon class="ml-2 size-4" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Enter a password to protect your link</p>
                </Tooltip.Content>
              </Tooltip.Root>
            </div>
            <div class="flex">
              <Input
                name="password_hash"
                type={showPassword ? "text" : "password"}
                value={localUrl.password_hash}
                placeholder="••••••••"
                class="h-12 rounded-r-none bg-input/20"
                on:input={handlePasswordChange}
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
                class="h-12 w-16 rounded-none border-l-0 border-r-0 bg-input/20"
                on:click={suggestPasswordAndCopy}
              >
                <Shuffle class="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                class="h-12 w-16 rounded-l-none rounded-r-2xl bg-input/20"
                on:click={() => {
                  if (localUrl)
                    navigator.clipboard
                      .writeText(localUrl.password_hash)
                      .then(() => {
                        toast.success("Password copied to clipboard");
                      });
                }}
              >
                <Copy class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Expiration -->
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex items-center">
                <Label class="flex items-center text-muted-foreground"
                  >Expiration date</Label
                >
                <Tooltip.Root openDelay={200}>
                  <Tooltip.Trigger>
                    <AlertCircleIcon class="ml-2 size-4" />
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>Enter an expiration date for your link.</p>
                  </Tooltip.Content>
                </Tooltip.Root>
              </div>
              <Input
                type="text"
                name="expiration"
                bind:value={rawExpirationInput}
                placeholder="tomorrow at 5pm"
                class="h-12 rounded-2xl bg-input/20"
                on:input={handleExpirationInput}
                on:blur={handleExpirationBlur}
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-center">
                <Label class="flex items-center text-muted-foreground"
                  >Expiration link</Label
                >
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
              </div>
              <Input
                type="text"
                name="expiration_url"
                bind:value={expiration_url}
                placeholder="Secondary-URL"
                class="h-12 rounded-2xl bg-input/20"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="space-y-2">
            <Label class="text-muted-foreground">Tags</Label>
            <TagsSelector
              {tags}
              onSelect={handleTagsSelect}
              selectedTags={localUrl.tags_id}
              onRefreshTags={async () => {
                console.log("Refreshing tags");
                const response = await fetch("/api/tags");
                console.log("response from fetch", response);
                url_tags = await response.json();
                console.log("tags", url_tags);
              }}
            />
          </div>

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
              {#if isSubmitting}
                Updating...
              {:else}
                Save changes <kbd
                  class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
                >
                  ⏎
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
                bind:value={localUrl.meta_title}
                placeholder="Title"
                class="h-12 rounded-2xl border-preview-border bg-preview-foreground"
              />
            </div>
            <div class="flex flex-col items-start justify-start gap-2">
              <Label class="text-sm font-medium text-amber-900"
                >Description</Label
              >
              <Textarea
                name="meta_description"
                bind:value={localUrl.meta_description}
                placeholder="Description"
                class="rounded-2xl border-preview-border bg-preview-foreground"
              />
            </div>
            <div class="flex flex-col items-start justify-start gap-2">
              <Label class="text-sm font-medium text-amber-900">Image URL</Label
              >
              <Input
                name="meta_image_url"
                bind:value={localUrl.meta_image_url}
                placeholder="Meta Image URL"
                class="h-12 rounded-2xl border-preview-border bg-preview-foreground"
              />
            </div>
          </div>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{:else if localUrl}
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
                <form onsubmit={handleSubmit} class="space-y-6">
                  <Dialog.Header>
                    <Dialog.Title class="w-full text-start text-2xl font-medium"
                      >Edit link</Dialog.Title
                    >
                  </Dialog.Header>

                  <input type="hidden" name="id" value={localUrl.id} />

                  <!-- URL -->
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <Label
                        for="url"
                        class="flex items-center text-muted-foreground"
                      >
                        Destination URL <span class="text-destructive">*</span>
                      </Label>
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
                      id="url"
                      name="url"
                      bind:value={localUrl.url}
                      type="url"
                      required
                      class="h-12 rounded-2xl bg-input/20"
                      on:input={handleMetaFetch}
                      disabled={isSubmitting}
                    />
                    {#if errors.url}<p class="text-sm text-destructive">
                        {errors.url}
                      </p>{/if}
                  </div>

                  <!-- Slug -->
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <Label
                        for="slug"
                        class="flex items-center text-muted-foreground"
                        >Custom URL</Label
                      >
                      <Tooltip.Root openDelay={200}>
                        <Tooltip.Trigger>
                          <AlertCircleIcon class="ml-2 size-4" />
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>Enter a custom URL</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </div>
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
                          name="slug"
                          id="slug"
                          bind:value={localUrl.slug}
                          pattern="[a-zA-Z0-9-]+"
                          class="h-12 rounded-none border-none bg-input/20"
                          on:input={(e) => {
                            // Replace spaces with hyphens and remove other special characters
                            e.currentTarget.value = e.currentTarget.value
                              .replace(/\s+/g, "-") // Replace one or more spaces with single hyphen
                              .replace(/[^a-zA-Z0-9-]/g, ""); // Remove remaining special chars
                            localUrl.slug = e.currentTarget.value;
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
                        class="h-12 w-12 rounded-l-none rounded-r-2xl bg-input/20"
                        onclick={suggestSlug}
                      >
                        <Shuffle class="h-4 w-4" />
                      </Button>
                    </div>
                    {#if errors.slug}<p class="text-sm text-destructive">
                        {errors.slug}
                      </p>{/if}
                  </div>

                  <!-- Password -->
                  <div class="space-y-2">
                    <div class="flex items-center">
                      <Label class="flex items-center text-muted-foreground"
                        >Password</Label
                      >
                      <Tooltip.Root openDelay={200}>
                        <Tooltip.Trigger>
                          <AlertCircleIcon class="ml-2 size-4" />
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p>Enter a password to protect your link</p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    </div>
                    <div class="flex">
                      <Input
                        name="password_hash"
                        type={showPassword ? "text" : "password"}
                        value={localUrl.password_hash}
                        placeholder="••••••••"
                        class="h-12 rounded-r-none bg-input/20"
                        on:input={handlePasswordChange}
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
                        class="h-12 w-16 rounded-none border-l-0 border-r-0 bg-input/20"
                        on:click={suggestPasswordAndCopy}
                      >
                        <Shuffle class="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        class="h-12 w-16 rounded-l-none rounded-r-2xl bg-input/20"
                        on:click={() => {
                          if (localUrl)
                            navigator.clipboard
                              .writeText(localUrl.password_hash)
                              .then(() => {
                                toast.success("Password copied to clipboard");
                              });
                        }}
                      >
                        <Copy class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <!-- Expiration -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <div class="flex items-center">
                        <Label class="flex items-center text-muted-foreground"
                          >Expiration date</Label
                        >
                        <Tooltip.Root openDelay={200}>
                          <Tooltip.Trigger>
                            <AlertCircleIcon class="ml-2 size-4" />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <p>Enter an expiration date for your link.</p>
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </div>
                      <Input
                        type="text"
                        name="expiration"
                        bind:value={rawExpirationInput}
                        placeholder="tomorrow at 5pm"
                        class="h-12 rounded-2xl bg-input/20"
                        on:input={handleExpirationInput}
                        on:blur={handleExpirationBlur}
                      />
                    </div>

                    <div class="space-y-2">
                      <div class="flex items-center">
                        <Label class="flex items-center text-muted-foreground"
                          >Expiration link</Label
                        >
                        <Tooltip.Root openDelay={200}>
                          <Tooltip.Trigger>
                            <AlertCircleIcon class="ml-2 size-4" />
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <p>
                              Enter an expiration link for your link. When the
                              link is visited, it will redirect to the secondary
                              URL.
                            </p>
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </div>
                      <Input
                        type="text"
                        name="expiration_url"
                        bind:value={expiration_url}
                        placeholder="Secondary-URL"
                        class="h-12 rounded-2xl bg-input/20"
                      />
                    </div>
                  </div>

                  <!-- Tags -->
                  <div class="space-y-2">
                    <Label class="text-muted-foreground">Tags</Label>
                    <TagsSelector
                      {tags}
                      onSelect={handleTagsSelect}
                      selectedTags={localUrl.tags_id}
                      onRefreshTags={async () => {
                        console.log("Refreshing tags");
                        const response = await fetch("/api/tags");
                        console.log("response from fetch", response);
                        url_tags = await response.json();
                        console.log("tags", url_tags);
                      }}
                    />
                  </div>

                  <div class="flex justify-end">
                    <Button
                      type="submit"
                      class="w-full rounded-2xl"
                      disabled={isSubmitting}
                    >
                      {#if isSubmitting}
                        Updating...
                      {:else}
                        Update Link
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
                    <!-- Meta title -->
                    <div class="flex flex-col items-start justify-start gap-2">
                      <Label class="text-muted-foreground">Title</Label>
                      <Input
                        name="meta_title"
                        bind:value={localUrl.meta_title}
                        placeholder="Title"
                        class="h-12 rounded-2xl bg-input/20"
                      />
                    </div>

                    <!-- Meta description -->
                    <div class="flex flex-col items-start justify-start gap-2">
                      <Label class="text-muted-foreground">Description</Label>
                      <Textarea
                        name="meta_description"
                        bind:value={localUrl.meta_description}
                        placeholder="Description"
                        class="h-12 rounded-2xl bg-input/20"
                      />
                    </div>

                    <!-- Meta image URL -->
                    <div class="flex flex-col items-start justify-start gap-2">
                      <Label class="text-muted-foreground">Image URL</Label>
                      <Input
                        name="meta_image_url"
                        bind:value={localUrl.meta_image_url}
                        placeholder="Meta Image URL"
                        class="h-12 rounded-2xl bg-input/20"
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
