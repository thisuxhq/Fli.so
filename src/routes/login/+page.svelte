<script lang="ts">
  import { enhance } from "$app/forms";
  import { fly } from "svelte/transition";

  let email = $state("");
  let password = $state("");
  let isLogin = $state(true);
  let isLoading = $state(false);
</script>

<div
  class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black"
>
  <div class="mx-auto max-w-md p-6">
    <!-- Header -->
    <div class="mb-5 text-center">
      <h1
        class="text-4xl font-medium tracking-tight text-gray-900 dark:text-white"
        in:fly={{ y: -20, duration: 150, delay: 100 }}
      >
        {isLogin ? "Welcome Back" : "Join Blink"}
      </h1>
    </div>

    <!-- Auth Toggle -->
    <div class="mb-8 flex justify-center gap-2">
      <button
        class="relative rounded-full px-4 py-2 text-sm font-medium transition-colors
        {isLogin 
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
        onclick={() => (isLogin = true)}
        type="button"
      >
        Log in
      </button>
      <button
        class="relative rounded-full px-4 py-2 text-sm font-medium transition-colors
        {!isLogin 
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
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
      class="overflow-hidden rounded-2xl bg-white/80 shadow-xl ring-1 ring-gray-200 backdrop-blur-sm dark:bg-gray-800/80 dark:ring-gray-700"
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
            class="rounded-full text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
            onclick={() => (isLogin = !isLogin)}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
        <button
          type="submit"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:bg-gray-400 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
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
