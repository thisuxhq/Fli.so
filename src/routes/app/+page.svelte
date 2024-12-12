<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { NewUrlForm, UrlEditForm } from "$lib/components/ui/core";
  import { UrlList } from "$lib/components/ui/core/misc";
  import {
    KeyboardShortcutsDialog,
    KbdShortcut,
  } from "$lib/components/ui/core/misc";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { CircleHelp, Search, X, Plus } from "lucide-svelte";
  import type {
    UrlsResponseWithTags,
    UsersResponse,
    SubscriptionsResponse,
    TagsResponse,
    SubscriptionsStatusOptions,
  } from "$lib/types";
  import { type UrlSchema } from "$lib/schema/url";
  import type { Infer, SuperValidated } from "sveltekit-superforms";
  import { initKeyboardShortcuts, type Shortcut } from "$lib/keyboard";
  import Logo from "$lib/components/ui/core/misc/logo.svelte";
  import SettingsMenu from "$lib/components/ui/core/misc/settings-menu.svelte";
  import { env } from "$env/dynamic/public";
  import UpgradeDialog from "$lib/components/ui/core/misc/upgrade-dialog.svelte";
  import { pbClient } from "../../hooks.client";

  // Defining the structure of the page data
  interface PageData {
    form: SuperValidated<Infer<UrlSchema>>;
    urls: UrlsResponseWithTags[] | [];
    user: UsersResponse;
    userWithSubscription: SubscriptionsResponse[];
    tags: TagsResponse[] | [];
    totalUrls: number;
  }

  // Initializing the page data
  let {
    data,
  }: {
    data: PageData;
  } = $props();

  // State for the add form
  let showAddForm = $state(false);

  // State for the search query
  let searchQuery = $state("");

  // State for the URLs
  let updatedUrls = $state<UrlsResponseWithTags[]>(data.urls);

  // URL limit from env
  const URL_LIMIT = parseInt(env.PUBLIC_FREE_URL_LIMIT ?? "10");
  const isPremium = $derived(
    data?.userWithSubscription[0]?.status === "active",
  );
  const isAtLimit = $derived(updatedUrls.length >= URL_LIMIT && !isPremium);

  // State for the search input
  let searchInput = $state<HTMLInputElement | null>(null);

  // Reference for the long URL input
  let longUrlInput = $state<HTMLInputElement | null>(null);

  // State for the hovered URL
  let hoveredUrl = $state<string | null>(null);

  // Modify the derived URLs to work with realtime updates
  let urls = $state(data.urls);

  // Add new state for deletion confirmation
  let deletingId = $state<string | null>(null);

  // Add state for dialog
  let showKeyboardShortcuts = $state(false);

  // Add state for editing URL
  let editingUrl = $state<UrlsResponseWithTags | null>(null);

  // Add state for edit form
  let showEditForm = $state(false);

  // Add these state variables at the top with other state declarations
  let isAnyDialogOpen = $derived(showAddForm || showEditForm);

  // Add state for upgrade dialog
  let showUpgradeDialog = $state(false);

  // Helper function to check if input is focused
  const isInputFocused = () => {
    const active = document.activeElement;
    return (
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement
    );
  };

  // Move keyboard shortcuts setup into onMount
  onMount(async () => {
    try {
      // Use the singleton pb instance for realtime
      pbClient.authStore.loadFromCookie(document.cookie); //get cookie pb_auth
      pbClient.authStore.onChange(() => {
        document.cookie = pbClient.authStore.exportToCookie({
          httpOnly: false,
        });
      });

      // Subscribe to the 'urls' collection
      await pbClient.collection("urls").subscribe("*", async (e) => {
        try {
          switch (e.action) {
            case "create": {
              updatedUrls = [e.record as UrlsResponseWithTags, ...updatedUrls];

              // Only fetch tags if they exist
              if (e.record.tags_id?.length) {
                const tags = await fetch("/api/tags/by_ids", {
                  method: "POST",
                  body: JSON.stringify({ tags_ids: e.record.tags_id }),
                });
                const data = await tags.json();
                console.log("[CREATE] Received tags data:", data);
                updatedUrls = updatedUrls.map((url) =>
                  url.id === e.record.id
                    ? { ...url, expand: { tags_id: data } }
                    : url,
                );
              }
              break;
            }
            case "update": {
              // First update the basic URL data
              updatedUrls = updatedUrls.map((url: UrlsResponseWithTags) =>
                url.id === e.record.id
                  ? {
                      ...url,
                      ...e.record,
                      // Clear tags if none exist
                      expand: {
                        tags_id: e.record.tags_id?.length
                          ? url.expand?.tags_id
                          : [],
                      },
                    }
                  : url,
              );

              // Only fetch tags if they exist
              if (e.record.tags_id?.length) {
                const tags = await fetch("/api/tags/by_ids", {
                  method: "POST",
                  body: JSON.stringify({ tags_ids: e.record.tags_id }),
                });
                const data = await tags.json();

                updatedUrls = updatedUrls.map((url) =>
                  url.id === e.record.id
                    ? { ...url, expand: { tags_id: data } }
                    : url,
                );
              }

              break;
            }
            case "delete":
              updatedUrls = updatedUrls.filter((url) => url.id !== e.record.id);
              break;
          }
        } catch (error) {
          console.error("Error processing realtime event:", error);
        }
      });
    } catch (error) {
      console.error("Failed to setup realtime subscription:", error);
      toast.error("Failed to setup realtime subscription");
    }
  });

  // Shortcuts
  const shortcuts: Shortcut[] = [
    {
      key: "Escape",
      handler: (e) => {
        if (isInputFocused()) {
          e.preventDefault();
          // find the search input
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            searchInput.blur();
          }
        }
      },
    },
    {
      key: "n",
      handler: (e) => {
        if (!isInputFocused()) {
          e.preventDefault();
          if (isAtLimit) {
            showUpgradeDialog = true;
            return;
          }
          showAddForm = !showAddForm;
        }
      },
    },
    {
      key: "/",
      handler: (e) => {
        if (!isAnyDialogOpen && !showAddForm && !isInputFocused()) {
          e.preventDefault();
          e.stopPropagation();

          // find the search input
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            searchInput.focus();
          }
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

  // Initialize keyboard shortcuts
  $effect(() => {
    return initKeyboardShortcuts(shortcuts);
  });

  // Function to handle editing a URL
  async function handleEdit(url: UrlsResponseWithTags) {
    editingUrl = url;
    showEditForm = true;
  }

  // Function to handle deleting a URL!
  async function handleDelete(id: string) {
    const data = await fetch(`/api/url/`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    const res = await data.json();
    console.log(res);

    if (res.success) {
      toast.success("URL deleted");
      showAddForm = false;
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

  // Update totalUrls whenever updatedUrls changes
  $effect(() => {
    data.totalUrls = updatedUrls.length;
  });

  const defaultMeta = {
    title: "Fli.so – Shorten, Brand, Track. All in One.",
    description:
      "Shorten, customize, and track your links with Fli.so. The easiest way to manage your links, all in one platform.",
    image: "https://fli.so/og-image.png",
    url: "https://fli.so",
    keywords:
      "link management, URL shortener, custom links, branded links, track links, link tracker, link analytics, link shortening, Fli.so",
    author: "THISUX PRIVATE LIMITED",
  };
</script>

<svelte:head>
  <!-- Title -->
  <title>{defaultMeta.title}</title>

  <!-- Meta Description -->
  <meta name="description" content={defaultMeta.description} />

  <!-- Meta Keywords -->
  <meta name="keywords" content={defaultMeta.keywords} />

  <!-- Open Graph -->
  <meta property="og:title" content={defaultMeta.title} />
  <meta name="og:description" content={defaultMeta.description} />
  <meta property="og:image" content={defaultMeta.image} />
  <meta property="og:url" content={defaultMeta.url} />
  <meta property="og:type" content="website" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={defaultMeta.title} />
  <meta name="twitter:description" content={defaultMeta.description} />
  <meta name="twitter:image" content={defaultMeta.image} />
  <meta name="keywords" content={defaultMeta.keywords} />
  <meta name="author" content={defaultMeta.author} />
  <link rel="canonical" href={defaultMeta.url} />
  <meta name="theme-color" content="#DCD5C7" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="Fli.so" />
  <link rel="manifest" href="/site.webmanifest" />

  <!-- Canonical Link -->
  <link rel="canonical" href="https://fli.so/" />

  <!-- Additional Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="author" content="THISUX PRIVATE LIMITED" />
</svelte:head>

<!-- Main page layout -->
<div
  class="min-h-screen w-full bg-gradient-to-br dark:from-gray-900 dark:to-black"
>
  <div class="mx-auto w-full p-6">
    <!-- Header -->
    <div class="mb-9 flex items-center justify-between">
      <div>
        <Logo />
      </div>

      <div class="relative hidden w-full max-w-sm md:block">
        <Input
          id="search-input"
          type="text"
          bind:this={searchInput!}
          bind:value={searchQuery}
          on:focus={() => {
            console.log("focusing search input");
          }}
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
          href={isAtLimit ? "/app/billing" : undefined}
          onclick={() => {
            if (!isAtLimit) {
              showAddForm = !showAddForm;
            }
          }}
        >
          {#if isAtLimit}
            <span class="flex items-center gap-2">
              Upgrade now
              <span class="text-xs opacity-75">$9/m</span>

              <KbdShortcut shortcut="u" />
            </span>
          {:else}
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
          {/if}
        </Button>

        <SettingsMenu
          name={data.user.name}
          email={data.user.email}
          avatar={data.user.avatar}
          showUpgrade={data?.userWithSubscription[0]?.status !==
            ("active" as SubscriptionsStatusOptions)}
        />
      </div>
    </div>

    <!-- search input -->
    <div class="relative mb-6 block md:hidden">
      <Input
        id="search-input"
        type="text"
        bind:value={searchQuery}
        placeholder="Search URLs by URL, slug, or tag"
        class="w-full rounded-full bg-input-foreground py-3 pl-9 pr-4 text-sm backdrop-blur-sm placeholder:text-muted-foreground"
      />

      <Search
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground"
      />
    </div>

    <!--Url list-->
    <UrlList
      urls={updatedUrls}
      onEdit={(url: UrlsResponseWithTags) => {
        handleEdit(url);
      }}
      onDelete={(id: string) => {
        handleDelete(id);
      }}
      {showAddForm}
      setShowAddForm={(show: boolean) => {
        showAddForm = show;
      }}
      {searchQuery}
    />

    <!-- Update the help button -->
    <div class="hidden md:fixed md:bottom-4 md:right-4 md:block">
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full bg-white text-muted-foreground"
        onclick={() => (showKeyboardShortcuts = true)}
      >
        <CircleHelp class="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>

<!-- New URL form -->
<NewUrlForm
  data={data.form}
  show={showAddForm && !isAtLimit}
  user_id={data.user.id}
  onOpenChange={(open) => {
    if (isAtLimit) {
      toast.error(
        `You've reached the ${URL_LIMIT} URL limit. Please upgrade to premium for unlimited URLs.`,
      );
      return;
    }
    showAddForm = open;
  }}
  tags={data.tags}
/>

<!-- URL edit form -->
<UrlEditForm
  url={editingUrl}
  show={showEditForm}
  onOpenChange={(open) => {
    showEditForm = open;
  }}
  tags={data.tags}
/>

<!-- Keyboard shortcuts dialog -->
<KeyboardShortcutsDialog
  open={showKeyboardShortcuts}
  onOpenChange={(open: boolean) => {
    showKeyboardShortcuts = open;
  }}
/>

<!-- Add this before the closing </div> -->
<UpgradeDialog
  open={showUpgradeDialog}
  onOpenChange={(open) => (showUpgradeDialog = open)}
/>
