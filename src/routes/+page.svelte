<script lang="ts">
  import { onMount } from "svelte";
  import { pb } from "$lib/pocketbase";
  import { toast } from "svelte-sonner";
  import { UrlList, NewUrlForm, SettingsMenu } from "$lib/components/ui/core";
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
  import { initKeyboardShortcuts, type Shortcut } from "$lib/keyboard";
  import { KeyboardShortcutsDialog } from "$lib/components/ui/core";

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

  let searchInput: HTMLInputElement | undefined = undefined;

  let updatedUrls = $state<UrlsResponseWithTags[]>(data.urls);

  // Reference for the long URL input
  let longUrlInput = $state<HTMLInputElement | null>(null);

  let hoveredUrl = $state<string | null>(null);

  // Modify the derived URLs to work with realtime updates
  let urls = $state(data.urls);

  // Add new state for deletion confirmation
  let deletingId = $state<string | null>(null);

  // Add state for dialog
  let showKeyboardShortcuts = $state(false);

  // Helper function to check if input is focused
  const isInputFocused = () => {
    const active = document.activeElement;
    return (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement
    );
  };

  // Move keyboard shortcuts setup into onMount
  onMount(() => {
    try {
      // Setup realtime subscription
      pb.collection("urls").subscribe("*", async (e) => {
        switch (e.action) {
          case "create": {
            console.log("create", e.record);
            updatedUrls = [e.record as UrlsResponseWithTags, ...updatedUrls];

            // Fetch the tags from the server
            const tags = await fetch("/api/tags", {
              method: "POST",
              body: JSON.stringify({ tags_ids: e.record.tags_id }),
            });

            const data = await tags.json();

            // Update the urls with the new tags
            updatedUrls = updatedUrls.map((url) =>
              url.id === e.record.id
                ? { ...url, expand: { tags_id: data } }
                : url,
            );

            break;
          }
          case "update": {
            console.log("update", e.record);
            // First update the basic URL data
            updatedUrls = updatedUrls.map((url) =>
              url.id === e.record.id ? { ...url, ...e.record } : url,
            );

            console.log("tags_id", e.record.tags_id);

            // Only fetch tags if they exist
            if (e.record.tags_id?.length) {
              const tags = await fetch("/api/tags", {
                method: "POST",
                body: JSON.stringify({ tags_ids: e.record.tags_id }),
              });

              const data = await tags.json();

              console.log("tags response", data);

              // Update with tags
              updatedUrls = updatedUrls.map((url) =>
                url.id === e.record.id
                  ? { ...url, tags: e.record.tags, expand: { tags_id: data } }
                  : url,
              );
            }
            break;
          }
          case "delete":
            console.log("delete", e.record);
            updatedUrls = updatedUrls.filter((url) => url.id !== e.record.id);
            break;
        }
      });
    } catch (error) {
      console.error("Failed to setup realtime subscription:", error);
      toast.error("Failed to setup realtime subscription");
    }

    // Cleanup both event listeners
    return () => {
      pb.collection("urls").unsubscribe();
    };
  });

  // Shortcuts
  const shortcuts: Shortcut[] = [
    {
      key: "Escape",
      handler: (e) => {
        if (isInputFocused()) {
          e.preventDefault();
          searchInput?.blur();
        }
      },
    },
    {
      key: "n",
      handler: (e) => {
        if (!isInputFocused()) {
          e.preventDefault();
          showAddForm = !showAddForm;
        }
      },
    },
    {
      key: "/",
      handler: (e) => {
        if (!showAddForm) {
          console.log("/ pressed", {
            searchInput,
            activeElement: document.activeElement,
          });
          e.preventDefault();
          e.stopPropagation();
          if (!searchInput) return;
          requestAnimationFrame(() => {
            searchInput?.focus();
          });
        }
      },
    },
    {
      key: "f",
      ctrl: true,
      handler: (e) => {
        if (!isInputFocused()) {
          e.preventDefault();
          searchInput?.focus();
        }
      },
    },
    {
      key: "e",
      handler: (e) => {
        if (!isInputFocused() && hoveredUrl) {
          e.preventDefault();
          const url = urls.find((u) => u.id === hoveredUrl);
          if (url) handleEdit(url);
        }
      },
    },
    {
      key: "d",
      handler: (e) => {
        if (!isInputFocused() && hoveredUrl) {
          e.preventDefault();
          if (deletingId === hoveredUrl) {
            const form = document.querySelector(
              `form[data-delete-id="${hoveredUrl}"]`,
            );
            form?.dispatchEvent(new Event("submit", { cancelable: true }));
            deletingId = null;
          } else {
            deletingId = hoveredUrl;
          }
        }
      },
    },
  ];

  $effect(() => {
    console.log("Search input ref:", searchInput);
    return initKeyboardShortcuts(shortcuts);
  });

  async function handleEdit(url: UrlsResponseWithTags) {
    //TODO: Implement edit functionality
    showAddForm = true;
  }

  async function handleDelete(id: string) {
    const data = await fetch(`/api/url/`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    const res = await data.json();
    console.log(res);

    if (res.success) {
      toast.success("URL deleted");
    } else {
      toast.error(res.error);
    }
  }

  // Update showAddForm to focus input when form opens
  $effect(() => {
    if (showAddForm) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => longUrlInput?.focus(), 50);
    }
  });

  // Add an effect to monitor the input binding
  $effect(() => {
    console.log("searchInput changed:", searchInput);
  });

  // Add this debug effect to verify the binding
  $effect(() => {
    console.log("searchInput ref:", searchInput);
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
          dun
        </h1>
      </div>

      <div class="relative">
        <Input
          type="text"
          bind:this={searchInput}
          bind:value={searchQuery}
          placeholder="Search URLs by URL, slug, or tag"
          class="w-full rounded-full bg-input-foreground py-3 pl-9 pr-16 text-sm backdrop-blur-sm placeholder:text-muted-foreground"
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
              N
            </kbd>
          {/if}
        </Button>

        <SettingsMenu
          name={data.user.name}
          email={data.user.email}
          avatar={data.user.avatar}
        />
      </div>
    </div>

    <NewUrlForm
      data={data.form}
      show={showAddForm}
      user_id={data.user.id}
      onOpenChange={(open) => {
        showAddForm = open;
      }}
      tags={data.tags}
    />

    <UrlList
      urls={updatedUrls}
      onEdit={(url: UrlsResponseWithTags) => {
        showAddForm = true;
        console.log("onEdit", url.url);
        handleEdit(url);
      }}
      onDelete={(id: string) => {
        handleDelete(id);
      }}
      showAddForm={true}
      setShowAddForm={() => {}}
      {searchQuery}
    />

    <!-- Update the help button -->
    <div class="fixed bottom-4 right-4">
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full bg-white text-muted-foreground"
        onclick={() => (showKeyboardShortcuts = true)}
      >
        <CircleHelp class="h-4 w-4" />
      </Button>
    </div>

    <KeyboardShortcutsDialog
      open={showKeyboardShortcuts}
      onOpenChange={(open: boolean) => {
        showKeyboardShortcuts = open;
      }}
    />
  </div>
</div>
