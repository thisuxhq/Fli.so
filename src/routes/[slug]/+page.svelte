<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Eye, EyeOff, Lock } from "lucide-svelte";
  import { KbdShortcut } from "$lib/components/ui/core/misc";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";

  interface PageData {
    url_id?: string;
    meta?: {
      title?: string;
      description?: string;
      url: string;
      image?: string;
    };
    isProtected?: boolean;
  }

  let { data }: { data: PageData } = $props();
  let password = $state("");
  let showPassword = $state(false);

  onMount(() => {
    if (data.meta?.url && !data.isProtected) {
      // add a delay to allow the page to load
      setTimeout(() => {
        if (data.meta?.url) {
          window.location.href = data.meta.url;
        }
      }, 1000);
    }
  });
</script>

<svelte:head>
  {#if data.meta?.title}
    <title>{data.meta.title}</title>
  {/if}

  {#if data.meta?.title}
    <meta property="og:title" content={data.meta.title} />
  {/if}

  {#if data.meta?.description}
    <meta name="description" content={data.meta.description} />
  {/if}

  {#if data.meta?.image}
    <meta property="og:image" content={data.meta.image} />
  {/if}

  {#if data.meta?.url}
    <meta property="og:url" content={data.meta.url} />
  {/if}
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  {#if data.meta?.title}
    <meta name="twitter:title" content={data.meta.title} />
  {/if}
  {#if data.meta?.description}
    <meta name="twitter:description" content={data.meta.description} />
  {/if}
  {#if data.meta?.image}
    <meta name="twitter:image" content={data.meta.image} />
  {/if}
</svelte:head>

{#if data.isProtected}
  <div class="flex h-screen flex-col items-center justify-center p-4">
    <div class="w-full max-w-md rounded-3xl bg-card/40 p-2 pt-8">
      <div class="mb-8 flex flex-col items-center gap-2 text-center">
        <div class="rounded-full border border-input bg-input/20 p-4">
          <Lock class="h-6 w-6" />
        </div>
        <h1 class="text-2xl font-medium">Password protected</h1>
        <p class="text-base text-muted-foreground">
          Please enter password to continue
        </p>
      </div>

      <form
        method="POST"
        action="?/verify_password"
        class="flex flex-col gap-4 rounded-3xl bg-white p-4"
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === "failure") {
              if (result.status === 401) {
                toast.error("Password is incorrect");
                password = "";
              } else if (result.status === 404) {
                toast.error("URL not found");
              } else {
                toast.error("An error occurred");
              }
            }

            update();
          };
        }}
      >
        <div class="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            bind:value={password}
            class="pr-10"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onclick={() => (showPassword = !showPassword)}
          >
            {#if showPassword}
              <EyeOff class="h-4 w-4" />
            {:else}
              <Eye class="h-4 w-4" />
            {/if}
          </button>
        </div>
        <input name="url_id" type="hidden" value={data.url_id} />
        <Button
          type="submit"
          class="w-full gap-2 rounded-2xl"
          variant="default"
        >
          Open link
          <KbdShortcut shortcut="⌘O" />
        </Button>
      </form>
    </div>
  </div>
{/if}
