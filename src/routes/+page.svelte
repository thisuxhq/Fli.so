<script lang="ts">
  import { enhance } from "$app/forms";
  import { fade, fly, scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { generateSlug } from "$lib";
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";

  let { data } = $props();
  let longUrl = $state("");
  let customSlug = $state("");
  let shortUrl = $state("");
  let isLoading = $state(false);
  let editingId = $state<string | null>(null);
  let editUrl = $state("");
  let showAddForm = $state(false);
  let searchQuery = $state("");
  let showShortcutsDialog = $state(false);

  // Add new state for theme
  let isDark = $state(false);

  // Add editSlug state
  let editSlug = $state("");

  // Reference for the long URL input
  let longUrlInput: HTMLInputElement;

  const suggestSlug = () => {
    customSlug = generateSlug();
  };

  const startEdit = (url: any) => {
    editingId = url.id;
    editUrl = url.url;
    editSlug = url.slug;
  };

  const cancelEdit = () => {
    editingId = null;
    editUrl = "";
    editSlug = "";
  };

  let filteredUrls = $derived(
    data.urls.filter(
      (url) =>
        url.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        url.slug.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  // Keyboard shortcuts
  function handleKeyboard(event: KeyboardEvent) {
    const isInputFocused = document.activeElement?.tagName === "INPUT";

    // Global shortcuts (work even when input is focused)
    if (event.key === "Escape") {
      if (editingId) {
        cancelEdit();
      } else if (showAddForm) {
        showAddForm = false;
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
      }
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
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
  class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 transition-colors duration-300 dark:from-slate-900 dark:to-slate-800"
>
  <div class="mx-auto max-w-3xl p-6 transition-all duration-150 ease-in-out">
    <!-- Header -->
    <div class="mb-12 flex items-center justify-between">
      <div class="space-y-1">
        <h1
          class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent"
          in:fly={{ y: -20, duration: 150, delay: 100 }}
        >
          Blink
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Shorten links with style
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-700/50"
          onclick={() => (isDark = !isDark)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {#if isDark}
              <path
                fill-rule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clip-rule="evenodd"
              />
            {:else}
              <path
                d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
              />
            {/if}
          </svg>
        </button>
        <button
          class="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:translate-y-[-1px] hover:shadow-indigo-500/40 active:translate-y-[1px]"
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
          <kbd
            class="ml-2 hidden rounded-md bg-white/20 px-2 py-0.5 text-xs font-light text-white/80 backdrop-blur-sm sm:inline-block"
          >
            C
          </kbd>
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
              }
            };
          }}
          class="overflow-hidden rounded-2xl bg-white/80 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50 backdrop-blur-sm dark:bg-slate-800/80 dark:shadow-slate-900/50 dark:ring-slate-700/50"
        >
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
                    class="flex-1 bg-white/50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500"
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
                      class="ml-1 hidden rounded-md bg-slate-200/50 px-1.5 py-0.5 text-xs font-light text-slate-500 sm:inline-block dark:bg-slate-600/50 dark:text-slate-400"
                    >
                      Space
                    </kbd>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            class="flex items-center justify-between gap-4 border-t border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-slate-700/50 dark:bg-slate-800/50"
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Create your custom short URL in seconds
            </p>
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:translate-y-[-1px] hover:shadow-indigo-500/40 active:translate-y-[1px] disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:hover:translate-y-0"
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
        class="mb-8 overflow-hidden rounded-2xl bg-emerald-50/80 shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500/25 backdrop-blur-sm dark:bg-emerald-950/80 dark:ring-emerald-500/25"
        transition:scale={{ duration: 150, easing: quintOut }}
      >
        <div class="p-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-medium text-emerald-800 dark:text-emerald-300">
                URL shortened successfully!
              </p>
              <a
                href={shortUrl}
                target="_blank"
                class="mt-1 block text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {shortUrl}
              </a>
            </div>
            <button
              class="rounded-lg bg-emerald-100/80 p-2 text-emerald-700 transition-colors hover:bg-emerald-200/80 dark:bg-emerald-900/80 dark:text-emerald-400 dark:hover:bg-emerald-800/80"
              onclick={() => navigator.clipboard.writeText(shortUrl)}
              aria-label="Copy to clipboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path
                  d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    {/if}

    {#if data.urls.length > 0 && !isLoading}
      <div
        id="urls"
        class="space-y-4"
        in:fly|local={{ y: 20, duration: 200 }}
        out:fly|local={{ y: 20, duration: 150 }}
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-slate-900 dark:text-slate-100">
            Your URLs
          </h2>
          <div class="relative">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search URLs..."
              class="rounded-lg border border-slate-200 bg-white/80 py-2 pl-9 pr-16 text-sm backdrop-blur-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
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

        {#if filteredUrls.length > 0}
          <div class="grid gap-4 sm:grid-cols-2">
            {#each filteredUrls as url (url.id)}
              <div
                class="group overflow-hidden rounded-xl bg-white/80 p-4 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200/50 backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:shadow-slate-200/50 dark:bg-slate-800/80 dark:shadow-slate-900/50 dark:ring-slate-700/50 dark:hover:shadow-slate-900/50"
                in:fly|local={{ y: 10, duration: 200, delay: 50 }}
                out:fade|local={{ duration: 150 }}
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
                        }
                      };
                    }}
                  >
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
                        class="w-full rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
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
                        class="relative flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 dark:border-slate-600 dark:bg-slate-700/50"
                      >
                        <span
                          class="flex items-center pl-3 text-sm text-slate-600 dark:text-slate-400"
                        >
                          dun.sh/
                        </span>
                        <input
                          id="edit-slug-{url.id}"
                          type="text"
                          name="slug"
                          bind:value={editSlug}
                          class="flex-1 bg-white/50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-indigo-800"
                          pattern="[a-zA-Z0-9-]+"
                          title="Only letters, numbers, and hyphens are allowed"
                          required
                        />
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        onclick={cancelEdit}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        class="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/25 transition-all hover:translate-y-[-1px] hover:shadow-indigo-500/40 active:translate-y-[1px]"
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
                        href={`https://dun.sh/${url.slug}`}
                        target="_blank"
                        class="group/link flex items-center gap-2 font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                      >
                        dun.sh/{url.slug}
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

                    <!-- Actions -->
                    <div class="flex items-center justify-end gap-2 pt-2">
                      <button
                        onclick={() => startEdit(url)}
                        class="group/btn relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-300"
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
                        <kbd
                          class="absolute -bottom-8 right-0 hidden rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400 group-hover/btn:inline-block dark:border-slate-700 dark:text-slate-500"
                        >
                          E
                        </kbd>
                      </button>
                      <form method="POST" action="?/delete" use:enhance>
                        <input type="hidden" name="id" value={url.id} />
                        <button
                          type="submit"
                          class="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
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
                        </button>
                      </form>
                    </div>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <div
            class="rounded-lg bg-white/50 px-4 py-8 text-center backdrop-blur-sm dark:bg-slate-800/50"
            in:fly|local={{ y: 10, duration: 200, easing: quintOut }}
            out:fade|local={{ duration: 150 }}
          >
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {searchQuery ? "No URLs match your search" : "No URLs yet"}
            </p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Add a keyboard shortcuts help dialog -->
    <div class="fixed bottom-4 right-4">
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
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
          class="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-light text-slate-400"
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
          </div>
        </div>
      </button>
    {/if}
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
