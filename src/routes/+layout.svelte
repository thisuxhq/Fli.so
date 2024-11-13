<script lang="ts">
  import "../app.css";
  import { Toaster } from "svelte-sonner";
  let { children } = $props();
</script>

<Toaster />
<div class="mx-auto min-h-screen max-w-5xl">
  {@render children()}
</div>
