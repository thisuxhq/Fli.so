<script lang="ts">
  import "../app.css";
  import { Toaster } from "svelte-sonner";
  let { children } = $props();

  const defaultMeta = {
    title: "Fli.so – Modern URL Shortener",
    description: "A privacy-focused, open-source URL shortener with custom slugs, analytics, and organization features.",
    image: "https://fli.so/og-image.png",
    url: "https://fli.so",
    keywords: "url shortener, link shortener, custom links, analytics, open source",
    author: "THISUX PRIVATE LIMITED"
  };
</script>

<svelte:head>
  <title>{defaultMeta.title}</title>

  <meta property="og:title" content={defaultMeta.title} />
  <meta name="og:description" content={defaultMeta.description} />
  <meta property="og:image" content={defaultMeta.image} />
  <meta property="og:url" content={defaultMeta.url} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={defaultMeta.title} />
  <meta name="twitter:description" content={defaultMeta.description} />
  <meta name="twitter:image" content={defaultMeta.image} />
  <meta name="keywords" content={defaultMeta.keywords} />
  <meta name="author" content={defaultMeta.author} />
  <link rel="canonical" href={defaultMeta.url} />
  <meta name="theme-color" content="#4f46e5" />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<Toaster />
<div class="mx-auto min-h-screen max-w-5xl">
  {@render children()}
</div>
