<script lang="ts">
  import "../app.css";
  import { Toaster } from "svelte-sonner";
  import { env } from "$env/dynamic/public";
  import { dev } from "$app/environment";

  let { children } = $props();
</script>

<svelte:head>
  {#if !dev}
    <script type="text/javascript">
      (function (c, l, a, r, i, t, y) {
        c[a] =
          c[a] ||
          function () {
            (c[a].q = c[a].q || []).push(arguments);
          };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", env.PUBLIC_CLARITY_PROJECT_ID);
    </script>

    <script
      defer
      src={env.PUBLIC_UMAMI_URL}
      data-website-id={env.PUBLIC_UMAMI_WEBSITE_ID}
    ></script>
  {/if}
</svelte:head>

<Toaster />
<div class="mx-auto min-h-screen max-w-5xl">
  {@render children()}
</div>
