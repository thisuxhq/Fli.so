<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import type { InputEvents } from "./index.js";
  import { cn } from "$lib/utils.js";

  type $$Props = HTMLInputAttributes;
  type $$Events = InputEvents;

  let className: $$Props["class"] = undefined;
  export let value: $$Props["value"] = undefined;
  export { className as class };

  // Workaround for https://github.com/sveltejs/svelte/issues/9305
  // Fixed in Svelte 5, but not backported to 4.x.
  export let readonly: $$Props["readonly"] = undefined;
  export let inputEl: HTMLInputElement | undefined = undefined;

  export function focus() {
    if (inputEl) {
      inputEl.focus();
    }
  }

  export function blur() {
    if (inputEl) {
      inputEl.blur();
    }
  }
</script>

<input
  bind:this={inputEl}
  class={cn(
    "flex h-12 w-full rounded-2xl border border-input bg-input/20 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className,
  )}
  bind:value
  {readonly}
  on:blur
  on:change
  on:click
  on:focus
  on:focusin
  on:focusout
  on:keydown
  on:keypress
  on:keyup
  on:mouseover
  on:mouseenter
  on:mouseleave
  on:mousemove
  on:paste
  on:input
  on:wheel|passive
  {...$$restProps}
/>
