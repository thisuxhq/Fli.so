<script lang="ts">
  import {
    NavSection,
    HeroSection,
    FeaturesSection,
    PricingSection,
    BuildWithUsSection,
    CallToActionSection,
    ConnectWithUsSection,
    FooterSection,
  } from "$lib/components/marketing";

  const defaultMeta = {
    title: "Fli.so – Shorten, Brand, Track. All in One.",
    description:
      "Shorten, customize, and track your links with Fli.so. The easiest way to manage your links, all in one platform.",
    image: "https://fli.so/og-image.png",
    url: "https://fli.so",
    keywords:
      "link management, URL shortener, custom links, branded links, track links, link tracker, link analytics, link shortening, Fli.so",
    author: "THISUX PRIVATE LIMITED",
  };
</script>

<svelte:head>
  <!-- Title -->
  <title>{defaultMeta.title}</title>

  <!-- Meta Description -->
  <meta name="description" content={defaultMeta.description} />

  <!-- Meta Keywords -->
  <meta name="keywords" content={defaultMeta.keywords} />

  <!-- Open Graph -->
  <meta property="og:title" content={defaultMeta.title} />
  <meta name="og:description" content={defaultMeta.description} />
  <meta property="og:image" content={defaultMeta.image} />
  <meta property="og:url" content={defaultMeta.url} />
  <meta property="og:type" content="website" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={defaultMeta.title} />
  <meta name="twitter:description" content={defaultMeta.description} />
  <meta name="twitter:image" content={defaultMeta.image} />
  <meta name="keywords" content={defaultMeta.keywords} />
  <meta name="author" content={defaultMeta.author} />
  <link rel="canonical" href={defaultMeta.url} />
  <meta name="theme-color" content="#DCD5C7" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="Fli.so" />
  <link rel="manifest" href="/site.webmanifest" />

  <!-- Canonical Link -->
  <link rel="canonical" href="https://fli.so/" />

  <!-- Additional Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="author" content="THISUX PRIVATE LIMITED" />
</svelte:head>

<div class="flex flex-col gap-16 px-4 md:px-8">
  <NavSection />
  <HeroSection />
  <FeaturesSection />
  <PricingSection />
  <BuildWithUsSection />
  <CallToActionSection />
  <ConnectWithUsSection />
  <FooterSection />
</div>
