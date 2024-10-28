<script lang="ts">
  import { enhance } from "$app/forms";
  import { fly } from "svelte/transition";

  let email = $state("");
  let password = $state("");
  let isLogin = $state(true);
  let isLoading = $state(false);
</script>

<div
  class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 transition-colors duration-300 dark:from-slate-900 dark:to-slate-800"
>
  <div class="mx-auto max-w-md p-6 transition-all duration-150 ease-in-out">
    <!-- Header -->
    <div class="mb-12 text-center">
      <h1
        class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent"
        in:fly={{ y: -20, duration: 150, delay: 100 }}
      >
        Welcome Back
      </h1>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {isLogin ? "Sign in to your account" : "Create your account"}
      </p>
    </div>

    <!-- Auth Toggle -->
    <div class="mb-8 flex justify-center gap-2">
      <button
        class:active={isLogin}
        class="relative px-4 py-2 text-sm font-medium text-slate-700 transition-colors dark:text-slate-300 {isLogin
          ? 'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-indigo-600 after:to-violet-600'
          : ''}"
        onclick={() => (isLogin = true)}
        type="button"
      >
        Log in
      </button>
      <button
        class:active={!isLogin}
        class="relative px-4 py-2 text-sm font-medium text-slate-700 transition-colors dark:text-slate-300 {!isLogin
          ? 'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-indigo-600 after:to-violet-600'
          : ''}"
        onclick={() => (isLogin = false)}
        type="button"
      >
        Sign up
      </button>
    </div>

    <!-- Auth Form -->
    <form
      method="POST"
      action={isLogin ? "?/login" : "?/signup"}
      use:enhance={() => {
        isLoading = true;
        return async ({ update }) => {
          await update();
          isLoading = false;
        };
      }}
      class="overflow-hidden rounded-2xl bg-white/80 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50 backdrop-blur-sm dark:bg-slate-800/80 dark:shadow-slate-900/50 dark:ring-slate-700/50"
    >
      <div class="space-y-4 p-6">
        <!-- Email Input -->
        <div>
          <label
            for="email"
            class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            bind:value={email}
            placeholder="you@example.com"
            required
            class="w-full rounded-lg border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
          />
        </div>

        <!-- Password Input -->
        <div>
          <label
            for="password"
            class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            bind:value={password}
            placeholder="••••••••"
            required
            class="w-full rounded-lg border border-slate-200 bg-white/50 px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
          />
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-4 border-t border-slate-200/50 bg-slate-50/50 px-6 py-4 dark:border-slate-700/50 dark:bg-slate-800/50"
      >
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            onclick={() => (isLogin = !isLogin)}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
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
          {:else}
            <span>{isLogin ? "Log in" : "Sign up"}</span>
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
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .auth-toggle {
    margin-bottom: 1rem;
  }

  .auth-toggle button {
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
    opacity: 0.7;
  }

  .auth-toggle button.active {
    opacity: 1;
    border-bottom: 2px solid currentColor;
  }
</style>
