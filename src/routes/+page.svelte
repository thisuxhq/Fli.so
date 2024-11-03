<script lang="ts">
  import { enhance } from "$app/forms";
  import { fade, fly, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { generateSlug } from "$lib";
  import { onMount, onDestroy } from "svelte";
  import { env } from "$env/dynamic/public";
  import { pb } from "$lib/pocketbase";
  import { toast } from "svelte-sonner";
  import type {
    UrlsResponseWithTags,
    UsersResponse,
    TagsResponse,
  } from "$lib/types";
  import TagSelector from "$lib/components/tag-selector.svelte";

  let {
    data,
  }: {
    data: {
      urls: UrlsResponseWithTags[] | [];
      user: UsersResponse;
      tags: TagsResponse[] | [];
    };
  } = $props();
  let longUrl = $state("");
  let customSlug = $state("");
  let shortUrl = $state("");
  let isLoading = $state(false);
  let editingId = $state<string | null>(null);
  let editUrl = $state("");
  let showAddForm = $state(false);
  let searchQuery = $state("");
  let showShortcutsDialog = $state(false);
  let selectedTags = $state<string[]>([]);

  // Add editSlug state
  let editSlug = $state("");

  // Reference for the long URL input
  let longUrlInput: HTMLInputElement;

  let hoveredUrl = $state<string | null>(null);

  // Add state for realtime updates
  let unsubscribe: (() => void) | null = null;

  // Modify the derived URLs to work with realtime updates
  let urls = $state(data.urls);
  let filteredUrls = $derived(
    urls.filter((url) => {
      const searchLower = searchQuery.toLowerCase();
      // Check URL and slug
      const urlMatch = url.url.toLowerCase().includes(searchLower);
      const slugMatch = url.slug.toLowerCase().includes(searchLower);
      // Check tags
      const tagMatch = url.expand?.tags?.some(tag => 
        tag.name.toLowerCase().includes(searchLower)
      );
      
      return urlMatch || slugMatch || tagMatch;
    }),
  );

  // Add new state for deletion confirmation
  let deletingId = $state<string | null>(null);

  let showTagForm = $state(false);
  let tagName = $state("");
  let tagColor = $state("#000000");

  const suggestSlug = () => {
    customSlug = generateSlug();
  };

  const startEdit = (url: any) => {
    editingId = url.id;
    editUrl = url.url;
    editSlug = url.slug;
    selectedTags = url.expand?.tags?.map((t) => t.id) || [];
  };

  const cancelEdit = () => {
    editingId = null;
    editUrl = "";
    editSlug = "";
    selectedTags = [];
  };

  // Keyboard shortcuts
  function handleKeyboard(event: KeyboardEvent) {
    const isInputFocused = document.activeElement?.tagName === "INPUT";

    // Global shortcuts (work even when input is focused)
    if (event.key === "Escape") {
      if (editingId) {
        cancelEdit();
      } else if (showAddForm) {
        showAddForm = false;
      } else if (deletingId) {
        // Cancel deletion
        deletingId = null;
      }
      return;
    }

    // Shortcuts that only work when input is not focused
    if (!isInputFocused) {
      if (event.key === "c" || event.key === "n") {
        // 'c' or 'n' to add new URL
        event.preventDefault();
        showAddForm = !showAddForm;
      } else if (event.key === "/" || (event.key === "f" && event.metaKey)) {
        // '/' or Cmd/Ctrl + F to focus search
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>(
            'input[type="text"][placeholder="Search URLs..."]',
          )
          ?.focus();
      } else if (event.key === " " && showAddForm) {
        // Spacebar to suggest new slug (only when add form is open)
        event.preventDefault();
        suggestSlug();
      } else if (event.key === "e" && hoveredUrl) {
        // 'e' to edit hovered URL
        event.preventDefault();
        const url = urls.find((u) => u.id === hoveredUrl);
        if (url) startEdit(url);
      } else if (event.key === "d" && hoveredUrl) {
        // 'd' to start delete confirmation
        event.preventDefault();
        if (deletingId === hoveredUrl) {
          // If already confirming, submit the delete
          const form = document.querySelector(
            `form[data-delete-id="${hoveredUrl}"]`,
          );
          form?.dispatchEvent(new Event("submit", { cancelable: true }));
          deletingId = null;
        } else {
          // Start confirmation
          deletingId = hoveredUrl;
        }
      }
    }
  }

  // Setup realtime subscription
  onMount(async () => {
    let cleanup: (() => void)[] = [];

    try {
      // Add keyboard event listener
      window.addEventListener("keydown", handleKeyboard);
      cleanup.push(() => window.removeEventListener("keydown", handleKeyboard));

      // Await the subscription setup
      unsubscribe = await pb.collection("urls").subscribe("*", async (e) => {
        switch (e.action) {
          case "create": {
            urls = [...urls, e.record as UrlsResponseWithTags];

            // Fetch the tags from the server
            const tags = await fetch("/api/tags", {
              method: "POST",
              body: JSON.stringify({ tags_ids: e?.record?.tags }),
            });

            const data = await tags.json();

            // Update the urls with the new tags
            urls = urls.map((url) =>
              url.id === e.record.id ? { ...url, expand: { tags: data } } : url,
            );

            break;
          }
          case "update":
            { urls = urls.map((url) =>
              url.id === e.record.id ? (e.record as UrlsResponseWithTags) : url,
            );

            // Fetch the tags from the server
            const tags = await fetch("/api/tags", {
              method: "POST",
              body: JSON.stringify({ tags_ids: e?.record?.tags }),
            });

            const data = await tags.json();

            urls = urls.map((url) =>
              url.id === e.record.id ? { ...url, expand: { tags: data } } : url,
            );

            console.log("update", e.record);

            break; }
          case "delete":
            urls = urls.filter((url) => url.id !== e.record.id);
            break;
        }
      });
      cleanup.push(() => unsubscribe?.());

    } catch (error) {
      console.error("Failed to setup realtime subscription:", error);
    }

    // Return cleanup function
    return () => cleanup.forEach(fn => fn());
  });

  // Add timeout to hide shortUrl
  $effect(() => {
    if (shortUrl) {
      const timer = setTimeout(() => {
        shortUrl = "";
      }, 5000);
      return () => clearTimeout(timer);
    }
  });

  // Update showAddForm to focus input when form opens
  $effect(() => {
    if (showAddForm) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => longUrlInput?.focus(), 50);
    }
  });
</script>

<div
  class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black"
>
  <div class="mx-auto max-w-3xl p-6">
    <!-- Header -->
    <div class="mb-12 flex items-center justify-between">
      <div>
        <h1
          class="text-4xl font-medium tracking-tight text-gray-900 dark:text-white"
        >
          Blink
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <!-- Logout Button -->
        <form action="?/logout" method="POST" use:enhance>
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/50 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>Logout</span>
          </button>
        </form>

        <!-- Add URL Button -->
        <button
          class="group relative inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          onclick={() => (showAddForm = !showAddForm)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {#if showAddForm}
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            {:else}
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              />
            {/if}
          </svg>
          <span>{showAddForm ? "Cancel" : "Add URL"}</span>
          {#if showAddForm}
            <kbd
              class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
            >
              Esc
            </kbd>
          {:else}
            <kbd
              class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
            >
              C
            </kbd>
          {/if}
        </button>
      </div>
    </div>

    <!-- URL Form -->
    {#if showAddForm}
      <div
        in:fly={{ y: -10, duration: 150, easing: quintOut }}
        out:fly={{ y: -10, duration: 100, easing: quintOut }}
        class="mb-8"
      >
        <form
          method="post"
          action="?/shorten"
          id="add-url"
          use:enhance={() => {
            isLoading = true;
            return async ({ result, update }) => {
              await update();
              isLoading = false;
              if (result.type === "success") {
                shortUrl = result.data?.shortUrl as string;
                longUrl = "";
                customSlug = "";
                showAddForm = false;

                toast.success("URL shortened successfully!");
              }
            };
          }}
          class="overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-gray-200 backdrop-blur-sm dark:bg-gray-800/80 dark:ring-gray-700"
        >
          <input type="hidden" name="created_by" value={data.user.id} />
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label
                  for="url"
                  class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >Long URL</label
                >
                <input
                  id="url"
                  name="url"
                  type="url"
                  bind:value={longUrl}
                  bind:this={longUrlInput}
                  placeholder="https://your-long-url.com"
                  class="w-full rounded-lg border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
                  required
                />
              </div>

              <div>
                <label
                  for="slug"
                  class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Custom URL (optional)
                </label>
                <div
                  class="relative flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700/50 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-800"
                >
                  <span
                    class="flex items-center pl-4 text-sm text-slate-600 dark:text-slate-400"
                  >
                    {env.PUBLIC_APPLICATION_NAME}/
                  </span>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    bind:value={customSlug}
                    placeholder="custom-name"
                    class="ml-2 flex-1 border border-gray-200 bg-white/50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
                    pattern="[a-zA-Z0-9-]+"
                    title="Only letters, numbers, and hyphens are allowed"
                  />
                  <button
                    type="button"
                    class="flex items-center gap-2 px-4 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    onclick={suggestSlug}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="hidden sm:inline">Suggest</span>
                    <kbd
                      class="ml-1 hidden rounded-md bg-gray-200/50 px-1.5 py-0.5 text-xs font-light text-gray-500 sm:inline-block dark:bg-gray-600/50 dark:text-gray-400"
                    >
                      Space
                    </kbd>
                  </button>
                </div>
              </div>

              <div>
                <label
                  for="tags"
                  class="mb-2 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Tags (optional)
                  <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    onclick={() => (showTagForm = !showTagForm)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    New Tag
                  </button>
                </label>
                {#if showTagForm}
                  <div class="mb-3">
                    <form
                      method="POST"
                      action="?/createTag"
                      use:enhance={() => {
                        return async ({ result, update }) => {
                          await update();
                          if (result.type === "success") {
                            showTagForm = false;
                            tagName = "";
                            tagColor = "#000000";
                            toast.success("Tag created successfully");
                          }
                        };
                      }}
                      transition:fly={{
                        y: -10,
                        duration: 150,
                        easing: quintOut,
                      }}
                    >
                      <div
                        class="space-y-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                      >
                        <div class="flex items-center gap-3">
                          <div class="flex-1">
                            <input
                              type="text"
                              name="name"
                              bind:value={tagName}
                              placeholder="Tag name"
                              class="w-full rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
                              required
                            />
                          </div>
                          <div class="flex-shrink-0">
                            <input
                              type="color"
                              name="color"
                              bind:value={tagColor}
                              class="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-white/50 p-0.5 dark:border-slate-600 dark:bg-slate-700/50"
                              title="Choose tag color"
                            />
                          </div>
                        </div>

                        <div class="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            class="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-700/50"
                            onclick={() => {
                              showTagForm = false;
                              tagName = "";
                              tagColor = "#000000";
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            class="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                          >
                            Create Tag
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                {/if}

                <TagSelector tags={data.tags} {selectedTags} />
              </div>
            </div>
          </div>

          <div
            class="flex items-center justify-between gap-4 border-t border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-slate-700/50 dark:bg-slate-800/50"
          >
            <p
              class="hidden text-sm text-slate-600 md:block dark:text-slate-400"
            >
              Create your custom short URL in seconds
            </p>
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 disabled:bg-gray-400 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              disabled={isLoading}
            >
              {#if isLoading}
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="none"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Shortening...</span>
              {:else}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Shorten URL</span>
                <kbd
                  class="ml-1 hidden rounded-md bg-white/20 px-1.5 py-0.5 text-xs font-light backdrop-blur-sm sm:inline-block"
                >
                  ↵
                </kbd>
              {/if}
            </button>
          </div>
        </form>
      </div>
    {/if}

    <!-- Success Message -->
    {#if shortUrl}
      <div
        class="mb-8 overflow-hidden rounded-xl bg-white/50 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur-sm transition-all dark:bg-slate-800/50 dark:ring-white/5"
        transition:scale={{ duration: 150, easing: quintOut }}
      >
        <div class="flex items-center justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <svg
                class="h-4 w-4 text-emerald-500 dark:text-emerald-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <p
                class="text-sm font-medium text-emerald-600 dark:text-emerald-400"
              >
                URL shortened successfully
              </p>
            </div>
            <a
              href={shortUrl}
              target="_blank"
              class="mt-1 block truncate text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {shortUrl}
            </a>
          </div>
          <button
            class="group rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700/50 dark:hover:text-slate-300"
            onclick={() => {
              navigator.clipboard.writeText(shortUrl);
              toast.success("Copied to clipboard");
            }}
            aria-label="Copy to clipboard"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path
                d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12 14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h1.586a1 1 0 00.707-.293l.121-.121A2 2 0 017.828 3h2.344a2 2 0 011.414.586l.121.121c.187.187.441.293.707.293H14a1 1 0 011 1v14z"
              />
            </svg>
          </button>
        </div>
      </div>
    {/if}

    <div
      id="urls"
      class="space-y-4"
      in:fly|local={{ y: 20, duration: 200 }}
      out:fly|local={{ y: 20, duration: 150 }}
    >
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <h2 class="text-lg font-medium text-slate-900 dark:text-slate-100">
          Your URLs
        </h2>
        <div class="relative">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search URLs by URL, slug, or tag"
            onkeydown={(e) => {
              if (e.key === "Escape") {
                e.currentTarget.blur();
              }
            }}
            class="w-full rounded-full border border-slate-200 bg-white/80 py-2 pl-9 pr-16 text-sm backdrop-blur-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          />
          <kbd
            class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400 sm:inline-block dark:border-slate-700 dark:text-slate-500"
          >
            /
          </kbd>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      {#if urls.length === 0}
        <div
          class="rounded-2xl bg-white/80 px-8 py-12 text-center shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm dark:bg-slate-800/80 dark:ring-slate-700/50"
          in:fly|local={{ y: 10, duration: 200, easing: quintOut }}
          out:fade|local={{ duration: 150 }}
        >
          <div class="mx-auto max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>

            <h3
              class="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100"
            >
              Start Shortening URLs
            </h3>

            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Create your first shortened URL and make sharing links easier than
              ever.
            </p>

            <button
              class="mt-6 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              onclick={() => (showAddForm = true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>Create Your First Short URL</span>
              <kbd
                class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block dark:bg-black/20"
              >
                C
              </kbd>
            </button>
          </div>
        </div>
      {:else if filteredUrls.length > 0}
        <div class="grid auto-rows-fr gap-4 sm:grid-cols-2">
          {#each filteredUrls as url (url.id)}
            <div
              class="group overflow-hidden rounded-3xl bg-white/80 p-4 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-200 hover:translate-y-[-2px] hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 dark:bg-slate-800/80 dark:shadow-slate-900/50 dark:ring-slate-700/50 dark:hover:bg-slate-800 dark:hover:shadow-slate-900/50 {editingId ===
              url.id
                ? 'row-span-2'
                : ''}"
              in:fly|local={{ y: 10, duration: 200, delay: 50 }}
              out:fade|local={{ duration: 150 }}
              onmouseenter={() => (hoveredUrl = url.id)}
              onmouseleave={() => (hoveredUrl = null)}
              aria-label={`${url.url} (${url.clicks} clicks)`}
              role="article"
            >
              {#if editingId === url.id}
                <form
                  method="POST"
                  action="?/update"
                  class="space-y-4"
                  use:enhance={() => {
                    return async ({ result, update }) => {
                      await update();
                      if (result.type === "success") {
                        editingId = null;
                        editUrl = "";
                        editSlug = "";
                        selectedTags = [];
                        toast.success("URL updated successfully");
                      }
                    };
                  }}
                >
                  <input type="hidden" name="created_by" value={data.user.id} />
                  <input type="hidden" name="id" value={url.id} />

                  <!-- URL Input -->
                  <div>
                    <label
                      for="edit-url-{url.id}"
                      class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Long URL
                    </label>
                    <input
                      id="edit-url-{url.id}"
                      type="url"
                      name="url"
                      bind:value={editUrl}
                      class="w-full rounded-full border border-slate-200 bg-white/50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
                      required
                    />
                  </div>

                  <!-- Slug Input -->
                  <div>
                    <label
                      for="edit-slug-{url.id}"
                      class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Short URL
                    </label>
                    <div
                      class="relative flex overflow-hidden rounded-full border border-slate-200 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-700/50"
                    >
                      <span
                        class="flex items-center pl-3 text-sm text-slate-600 dark:text-slate-400"
                      >
                        {env.PUBLIC_APPLICATION_NAME}/
                      </span>
                      <input
                        id="edit-slug-{url.id}"
                        type="text"
                        name="slug"
                        bind:value={editSlug}
                        class="ml-2 flex-1 rounded-r-full border border-gray-200 bg-white/50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
                        pattern="[a-zA-Z0-9-]+"
                        title="Only letters, numbers, and hyphens are allowed"
                        required
                      />
                    </div>
                  </div>

                  <!-- Tags Input -->
                  <div>
                    <label
                      for="edit-tags-{url.id}"
                      class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Tags
                    </label>
                    <TagSelector tags={data.tags} {selectedTags} />
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      class="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      onclick={cancelEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="inline-flex items-center justify-center rounded-full bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              {:else}
                <div class="space-y-3">
                  <!-- Short URL -->
                  <div class="flex items-start justify-between gap-4">
                    <a
                      href={`${env.PUBLIC_APPLICATION_URL}/${url.slug}`}
                      target="_blank"
                      class="group/link flex items-center gap-2 font-medium text-slate-900 hover:text-red-600 dark:text-slate-100 dark:hover:text-gray-900"
                    >
                      {env.PUBLIC_APPLICATION_NAME}/{url.slug}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 opacity-0 transition-opacity group-hover/link:opacity-100"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"
                        />
                        <path
                          d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"
                        />
                      </svg>
                    </a>
                    <span
                      class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fill-rule="evenodd"
                          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {url.clicks} clicks
                    </span>
                  </div>

                  <!-- Original URL -->
                  <p
                    class="truncate text-sm text-slate-500 dark:text-slate-400"
                    title={url.url}
                  >
                    {url.url}
                  </p>

                  <!-- Add Tags Display Here -->
                  {#if url.expand?.tags}
                    <div class="flex flex-wrap gap-1.5">
                      {#each url.expand.tags as tag}
                        <span
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                          style="background-color: {tag.color}20; color: {tag.color}; border: 1px solid {tag.color}40;"
                        >
                          {tag.name}
                        </span>
                      {/each}
                    </div>
                  {/if}

                  <!-- Actions -->
                  <div class="flex items-center justify-end gap-2 pt-2">
                    <button
                      onclick={() => startEdit(url)}
                      class="group/btn relative rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      title="Edit URL"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                        />
                      </svg>
                      {#if hoveredUrl === url.id}
                        <kbd
                          class="absolute -top-8 right-0 hidden rounded-md border border-gray-200 px-1.5 py-0.5 text-xs font-light text-gray-400 group-hover/btn:inline-block dark:border-gray-700 dark:text-gray-500"
                        >
                          E
                        </kbd>
                      {/if}
                    </button>

                    {#if deletingId === url.id}
                      <!-- Delete Confirmation -->
                      <div
                        class="flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 dark:bg-red-950/50"
                        transition:fly={{ x: 10, duration: 150 }}
                      >
                        <span
                          class="text-sm font-medium text-red-600 dark:text-red-400"
                        >
                          Delete URL?
                        </span>
                        <form
                          method="POST"
                          action="?/delete"
                          use:enhance={() => {
                            return async ({ result, update }) => {
                              await update();
                              if (result.type === "success") {
                                toast.success("URL deleted successfully");
                              }
                            };
                          }}
                          data-delete-id={url.id}
                          class="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="created_by"
                            value={data.user.id}
                          />
                          <input type="hidden" name="id" value={url.id} />
                          <button
                            type="submit"
                            class="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            class="rounded-full px-3 py-1 text-sm font-medium text-red-600/75 hover:bg-red-100 dark:text-red-400/75 dark:hover:bg-red-900/50"
                            onclick={() => (deletingId = null)}
                          >
                            No
                          </button>
                        </form>
                      </div>
                    {:else}
                      <!-- Delete Button -->
                      <button
                        class="group/btn relative rounded-full p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                        onclick={() => (deletingId = url.id)}
                        title="Delete URL"
                        aria-label="Delete URL"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        {#if hoveredUrl === url.id}
                          <kbd
                            class="absolute -top-8 right-0 hidden rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400 group-hover/btn:inline-block dark:border-slate-700 dark:text-slate-500"
                          >
                            D
                          </kbd>
                        {/if}
                      </button>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <div
          class="rounded-2xl bg-white/80 px-8 py-12 text-center shadow-xl ring-1 ring-slate-200/50 backdrop-blur-sm dark:bg-slate-800/80 dark:ring-slate-700/50"
          in:fly|local={{ y: 10, duration: 200, easing: quintOut }}
          out:fade|local={{ duration: 150 }}
        >
          <div class="mx-auto max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <h3
              class="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100"
            >
              No URLs match your search
            </h3>

            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Try adjusting your search terms or clear the search to see all
              your URLs.
            </p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Add a keyboard shortcuts help dialog -->
    <div class="fixed bottom-4 right-4">
      <button
        class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
        onclick={() => (showShortcutsDialog = true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clip-rule="evenodd"
          />
        </svg>
        <span>Keyboard Shortcuts</span>
        <kbd
          class="rounded-md border border-gray-200 px-1.5 py-0.5 text-xs font-light text-gray-400 dark:border-gray-700 dark:text-gray-500"
          >?</kbd
        >
      </button>
    </div>

    <!-- Keyboard shortcuts dialog -->
    {#if showShortcutsDialog}
      <button
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        aria-label="Close keyboard shortcuts dialog"
        onclick={(ev) => (ev.stopPropagation(), (showShortcutsDialog = false))}
        transition:fade={{ duration: 200 }}
      >
        <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <h2 class="mb-4 text-lg font-medium text-slate-900">
            Keyboard Shortcuts
          </h2>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Add new URL</span>
              <div class="flex gap-2">
                <kbd
                  class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
                  >C</kbd
                >
                <span class="text-xs text-slate-400">or</span>
                <kbd
                  class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
                  >N</kbd
                >
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Search URLs</span>
              <kbd
                class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
                >/</kbd
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Suggest new slug</span>
              <kbd
                class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
                >Space</kbd
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Cancel/Close</span>
              <kbd
                class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
                >Esc</kbd
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Shorten URL</span>
              <kbd
                class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
                >↵</kbd
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Edit URL</span>
              <kbd
                class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
                >E</kbd
              >
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-600">Delete URL</span>
              <kbd
                class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
                >D</kbd
              >
            </div>
          </div>
        </div>
      </button>
    {/if}

    <!-- Footer -->
    <footer
      class="mt-16 border-t border-slate-200/50 pt-8 dark:border-slate-700/50"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">
          <a
            href="https://thisux.com"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-slate-700 underline decoration-slate-300 decoration-wavy underline-offset-4 hover:text-indigo-600 dark:text-slate-300 dark:decoration-slate-700 dark:hover:text-indigo-400"
          >
            ThisUX
          </a>
          , a forward-thinking product studio
        </p>
        <p class="mt-2 text-sm text-slate-500 sm:mt-0 dark:text-slate-400">
          © {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</div>

<style>
  .input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .btn:disabled {
    background-color: #ccc;
  }

  .btn:hover:not(:disabled) {
    background-color: #0056b3;
  }
</style>
