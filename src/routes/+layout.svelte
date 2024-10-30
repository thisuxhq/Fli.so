<script lang="ts">
  import "../app.css";
  import { Toaster } from "svelte-sonner";
  let { children } = $props();
</script>

<Toaster />
<div class="min-h-screen bg-[#F8FAFC]">
  {@render children()}
</div>
