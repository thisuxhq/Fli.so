<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Hourglass } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";

  let isLoading = $state(false);
  let email = $state("");
  let message = $state("");
</script>

<svelte:head>
  <title>Join Waitlist - Fli.so Paid Content Links</title>
  <meta
    name="description"
    content="Get early access to Fli.so's paid content features. Share and sell your images, videos, PDFs, and more."
  />
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center p-4">
  <div class="w-full max-w-md rounded-4xl bg-card/40 p-2 pt-8">
    <div class="mb-8 flex flex-col items-center gap-2 text-center">
      <div class="rounded-full border border-input bg-input/20 p-4">
        <Hourglass class="h-6 w-6" />
      </div>
      <h1 class="text-2xl font-medium">Join the Waitlist</h1>
      <p class="text-base text-muted-foreground">
        Get early access to paid content features
      </p>
    </div>

    <form
      method="POST"
      class="flex flex-col gap-4 rounded-4xl bg-white p-4"
      use:enhance={() => {
        isLoading = true;
        return async ({ result }) => {
          isLoading = false;
          if (result.type === "error") {
            toast.error(result.error);
          } else if (result.type === "success") {
            toast.success("You've been added to the waitlist!");
            email = "";
            message = "";
          } else {
            toast.error("You're already on the waitlist!");
          }
        };
      }}
    >
      <Input
        name="email"
        type="email"
        placeholder="Your email"
        bind:value={email}
        required
      />

      <Textarea
        name="message"
        placeholder="Tell us how you plan to use paid content links (optional)"
        bind:value={message}
        rows={4}
      />

      <Button
        type="submit"
        class="w-full gap-2 rounded-2xl"
        variant="default"
        disabled={isLoading}
      >
        {#if isLoading}
          <div
            class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          ></div>
        {/if}
        Join Waitlist
      </Button>

      <p class="text-center text-sm text-muted-foreground">
        We'll notify you when paid content features are ready
      </p>
    </form>
  </div>
</div>
