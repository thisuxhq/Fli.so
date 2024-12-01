<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Eye, EyeOff } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { toast } from "svelte-sonner";

  let email = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let isLogin = $state(true);
  let isLoading = $state(false);
  let showForgotPassword = $state(false);
</script>

<div class="flex h-screen flex-col items-center justify-center p-4">
  <div class="w-full max-w-md rounded-3xl bg-card/40 p-2 pt-8">
    <div class="mb-8 flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-medium">{isLogin ? "Your fli.so awaits" : "Join the fli.so crew"}</h1>
      <p class="text-base text-muted-foreground">
        {isLogin ? "Pick up where you left off" : "Create your account and get started"}
      </p>
    </div>

    <!-- Auth Toggle -->
    <div class="mb-4 flex justify-center gap-2">
      <Button
        variant={isLogin ? "default" : "ghost"}
        class="rounded-full"
        onclick={() => (isLogin = true)}
      >
        Log in
      </Button>
      <Button
        variant={!isLogin ? "default" : "ghost"}
        class="rounded-full"
        onclick={() => (isLogin = false)}
      >
        Sign up
      </Button>
    </div>

    {#if showForgotPassword}
      <form
        method="POST"
        action="?/forgotPassword"
        class="flex flex-col gap-4 rounded-3xl bg-white p-4"
        use:enhance={() => {
          isLoading = true;
          return async ({ result, update }) => {
            if (result.type === "failure") {
              toast.error("Failed to send reset email");
            } else {
              toast.success("Password reset email sent! Please check your inbox.");
            }
            await update();
            isLoading = false;
          };
        }}
      >
        <Input
          name="email"
          type="email"
          placeholder="Email"
          bind:value={email}
          required
        />
        <Button type="submit" class="w-full rounded-2xl" disabled={isLoading}>
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
          {:else}
            Send Reset Link
          {/if}
        </Button>
        <button
          type="button"
          class="text-sm text-muted-foreground hover:underline"
          onclick={() => (showForgotPassword = false)}
        >
          Back to login
        </button>
      </form>
    {:else}
      <form
        method="POST"
        action={isLogin ? "?/login" : "?/signup"}
        class="flex flex-col gap-4 rounded-3xl bg-white p-4"
        use:enhance={() => {
          isLoading = true;
          return async ({ result, update }) => {
            if (result.type === "failure") {
              if (result.data?.message) {
                toast.error(result.data.message);
              } else if (result.status === 401) {
                toast.error("Invalid credentials");
              } else {
                toast.error("An error occurred");
              }
            } else if (!isLogin && result.type === "success") {
              toast.success("Account created successfully! Please check your email to verify your account.");
            }
            await update();
            isLoading = false;
          };
        }}
      >
        <Input
          name="email"
          type="email"
          placeholder="Email"
          bind:value={email}
          required
        />
        
        <div class="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            bind:value={password}
            class="pr-10"
            required
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

        {#if isLogin}
          <button
            type="button"
            class="text-sm text-muted-foreground hover:underline"
            onclick={() => (showForgotPassword = true)}
          >
            Forgot password?
          </button>
        {/if}

        <Button type="submit" class="w-full rounded-2xl" disabled={isLoading}>
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
          {:else}
            {isLogin ? "Log in" : "Sign up"}
          {/if}
        </Button>

        <p class="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            class="ml-1 text-foreground hover:underline"
            onclick={() => (isLogin = !isLogin)}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </form>
    {/if}
  </div>
</div>
