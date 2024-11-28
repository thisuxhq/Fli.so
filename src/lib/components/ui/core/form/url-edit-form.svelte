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
  import { generatePassword, generateSlug } from "$lib";

  type Tab = "edit" | "meta";
  let currentTab = $state<Tab>("edit");
  let showPassword = $state(false);
  let isSubmitting = $state(false);

  interface Props {
    url: UrlsResponseWithTags | null;
    show?: boolean;
    onOpenChange?: (open: boolean) => void;
    tags: TagsResponse[];
  }

  let { url, show = false, onOpenChange, tags }: Props = $props();
  let url_tags = $state<TagsResponse[]>(tags);
  let rawExpirationInput = $state("");
  let expirationDisplay = $state("");

  let expiration_url = $state("");
  let expiration_date = $state("");

  let shortUrl = $derived(
    url?.slug ? `${env.PUBLIC_APPLICATION_NAME}/${url.slug}` : "",
  );

  async function suggestSlug() {
    console.log("Generating slug");
    if (url) url.slug = generateSlug();
  }

  async function suggestPasswordAndCopy() {
    const password = generatePassword();
    if (url) url.password_hash = password;
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard");
    } catch (err) {
      console.error("Failed to copy password:", err);
      toast.error("Failed to copy password to clipboard");
    }
  }

  $effect(() => {
    if (url?.expiration) {
      expirationDisplay = convertExpirationToHumanReadable(url.expiration);
      rawExpirationInput = expirationDisplay;
    } else {
      expirationDisplay = "";
      rawExpirationInput = "";
    }
  });

  function handleExpirationInput(e: Event) {
    // Just update the raw input without processing
    rawExpirationInput = (e.target as HTMLInputElement).value;
  }

  function processExpiration() {
    try {
      if (url) {
        if (rawExpirationInput) {
          // Convert to ISO and store in url
          url.expiration = convertExpirationToDate(rawExpirationInput);
          // Update display
          expirationDisplay = convertExpirationToHumanReadable(url.expiration);
          rawExpirationInput = expirationDisplay;
        } else {
          // Clear expiration if input is empty
          url.expiration = "";
          expirationDisplay = "";
        }
      }
    } catch (error) {
      console.error("Failed to parse date:", error);
    }
  }

  function handleExpirationKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      processExpiration();
    }
  }

  function handleExpirationBlur() {
    processExpiration();
  }

  let errors = $state<Record<string, string>>({});
  let metaDataEnabled = $state(
    show || !!(url?.meta_title || url?.meta_description || url?.meta_image_url),
  );

  // window size
  let size = windowSize.getSize();
  const isDesktop = $derived($size.width > 768);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!url?.id) return;

    try {
      const response = await fetch(`/api/url`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: url.id,
          url: url.url,
          slug: url.slug,
          password_hash: url.password_hash || "",
          expiration: expiration_date,
          expiration_url: expiration_url,
          meta_title: url.meta_title || "",
          meta_description: url.meta_description || "",
          meta_image_url: url.meta_image_url || "",
          tags_id: url.tags_id || [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update URL");
      }

      toast.success("URL updated successfully");
      onOpenChange?.(false);
    } catch (error) {
      console.error("Error updating URL:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update URL",
      );
    }
  }

  function handleTagsSelect(tags: string[]) {
    if (url) url.tags_id = tags;
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
    if (url) {
      expiration_url = url.expiration_url || "";
      expiration_date = url.expiration
        ? convertExpirationToHumanReadable(url.expiration)
        : "";
    }
  });
</script>

{#if url && isDesktop}
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

          <input type="hidden" name="id" value={url.id} />

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
              bind:value={url.url}
              type="url"
              required
              class="h-12 rounded-2xl bg-input/20"
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
                  bind:value={url.slug}
                  class="h-12 rounded-none border-none bg-input/20"
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
                bind:value={url.password_hash}
                placeholder="••••••••"
                class="h-12 rounded-r-none bg-input/20"
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
                  if (url)
                    navigator.clipboard
                      .writeText(url.password_hash)
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
                bind:value={expiration_date}
                placeholder="tomorrow at 5pm"
                class="h-12 rounded-2xl bg-input/20"
                on:input={handleExpirationInput}
                on:keydown={handleExpirationKeyDown}
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
              selectedTags={url.tags_id}
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
            <Button type="submit" class="rounded-2xl"
              >Save changes <kbd
                class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
              >
                ⏎
              </kbd></Button
            >
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
                bind:value={url.meta_title}
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
                bind:value={url.meta_description}
                placeholder="Description"
                class="rounded-2xl border-preview-border bg-preview-foreground"
              />
            </div>
            <div class="flex flex-col items-start justify-start gap-2">
              <Label class="text-sm font-medium text-amber-900">Image URL</Label
              >
              <Input
                name="meta_image_url"
                bind:value={url.meta_image_url}
                placeholder="Meta Image URL"
                class="h-12 rounded-2xl border-preview-border bg-preview-foreground"
              />
            </div>
          </div>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{:else if url}
  <Drawer.Root open={show} {onOpenChange}>
    <Drawer.Portal class="overflow-auto">
      <Drawer.Content class="h-full max-h-[95%] max-w-full bg-white">
        <Tabs.Root
          value={currentTab}
          onValueChange={(e) => {
            currentTab = e as Tab;
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          class="mt-8 flex w-full flex-col items-center justify-center overflow-auto"
        >
          <Tabs.List class="w-fit rounded-2xl bg-input/20">
            <Tabs.Trigger value="edit" class="rounded-xl">Edit</Tabs.Trigger>
            <Tabs.Trigger value="meta" class="rounded-xl"
              >Meta data</Tabs.Trigger
            >
          </Tabs.List>

          <!-- Mobile version of the form fields -->
          <!-- ... Same fields as desktop but in tabbed layout ... -->
        </Tabs.Root>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
{/if}
