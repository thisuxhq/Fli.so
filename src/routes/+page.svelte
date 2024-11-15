<script lang="ts">
  import { onMount } from "svelte";
  import { pb } from "$lib/pocketbase";
  import { toast } from "svelte-sonner";
  import { UrlList, NewUrlForm } from "$lib/components/ui/core";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { CircleHelp, Search, X, Plus } from "lucide-svelte";
  import type {
    UrlsResponseWithTags,
    UsersResponse,
    TagsResponse,
  } from "$lib/types";
  import { type UrlSchema } from "$lib/schema/url";
  import type { Infer, SuperValidated } from "sveltekit-superforms";

  interface PageData {
    form: SuperValidated<Infer<UrlSchema>>;
    urls: UrlsResponseWithTags[] | [];
    user: UsersResponse;
    tags: TagsResponse[] | [];
  }

  let {
    data,
  }: {
    data: PageData;
  } = $props();
  let showAddForm = $state(false);
  let searchQuery = $state("");
  let searchInput = $state<HTMLInputElement | null>(null);

  let updatedUrls = $state<UrlsResponseWithTags[]>(data.urls);

  // Reference for the long URL input
  let longUrlInput = $state<HTMLInputElement | null>(null);

  let hoveredUrl = $state<string | null>(null);

  // Modify the derived URLs to work with realtime updates
  let urls = $state(data.urls);

  // Add new state for deletion confirmation
  let deletingId = $state<string | null>(null);

  // Keyboard shortcuts
  function handleKeyboard(event: KeyboardEvent) {
    const isInputFocused = document.activeElement?.tagName === "INPUT";

    // Global shortcuts (work even when input is focused)
    if (event.key === "Escape") {
      if (showAddForm) {
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
        searchInput?.focus();
      } else if (event.key === " " && showAddForm) {
        // Spacebar to suggest new slug (only when add form is open)
        event.preventDefault();
      } else if (event.key === "e" && hoveredUrl) {
        // 'e' to edit hovered URL
        event.preventDefault();
        const url = urls.find((u) => u.id === hoveredUrl);
        if (url) onEdit(url);
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
    try {
      // Add keyboard event listener
      window.addEventListener("keydown", handleKeyboard);

      // Await the subscription setup
      await pb.collection("urls").subscribe("*", async (e) => {
        switch (e.action) {
          case "create": {
            console.log("create", e.record);
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
          case "update": {
            console.log("update", e.record);
            updatedUrls = updatedUrls.map((url) =>
              url.id === e.record.id ? (e.record as UrlsResponseWithTags) : url,
            );

            // Fetch the tags from the server
            const tags = await fetch("/api/tags", {
              method: "POST",
              body: JSON.stringify({ tags_ids: e?.record?.tags }),
            });

            const data = await tags.json();

            updatedUrls = updatedUrls.map((url) =>
              url.id === e.record.id ? { ...url, expand: { tags: data } } : url,
            );

            console.log("update", e.record);

            break;
          }
          case "delete":
            console.log("delete", e.record);
            urls = urls.filter((url) => url.id !== e.record.id);
            break;
        }
      });
    } catch (error) {
      console.error("Failed to setup realtime subscription:", error);
      toast.error("Failed to setup realtime subscription");
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
  class="min-h-screen w-full bg-gradient-to-br dark:from-gray-900 dark:to-black"
>
  <div class="mx-auto w-full p-6">
    <!-- Header -->
    <div class="mb-12 flex items-center justify-between">
      <div>
        <h1
          class="text-4xl font-medium tracking-tight text-gray-900 dark:text-white"
        >
          fli
        </h1>
      </div>

      <div class="relative">
        <Input
          type="text"
          bind:this={searchInput}
          bind:value={searchQuery}
          placeholder="Search URLs by URL, slug, or tag"
          onkeydown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur();
            }
          }}
          class="bg-input-foreground w-full rounded-full py-3 pl-9 pr-16 text-sm backdrop-blur-sm placeholder:text-muted-foreground"
        />
        <kbd
          class="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-light text-slate-400 dark:border-slate-700 dark:text-slate-500 sm:inline-block"
        >
          /
        </kbd>
        <Search
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground"
        />
      </div>

      <div class="flex items-center gap-3">
        <!-- Add URL Button -->
        <Button
          class="rounded-2xl"
          onclick={() => (showAddForm = !showAddForm)}
        >
          {#if showAddForm}
            <X class="h-4 w-4" />
          {:else}
            <Plus class="h-4 w-4" />
          {/if}

          <span>{showAddForm ? "Cancel" : "New link"}</span>
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
        </Button>
      </div>
    </div>

    <NewUrlForm
      data={data.form}
      show={showAddForm}
      user_id={data.user.id}
      onOpenChange={(open) => {
        showAddForm = open;
      }}
    />

    <UrlList
      urls={updatedUrls}
      onEdit={() => {}}
      onDelete={() => {}}
      showAddForm={true}
      setShowAddForm={() => {}}
      {searchQuery}
    />

    <!-- Add a keyboard shortcuts help dialog -->
    <div class="fixed bottom-4 right-4">
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full bg-white text-muted-foreground"
        onclick={() => {}}
      >
        <CircleHelp class="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
