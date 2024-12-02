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
    title: "Fli.so – Modern URL Shortener",
    description:
      "A privacy-focused, open-source URL shortener with custom slugs, analytics, and organization features.",
    image: "https://fli.so/og-image.png",
    url: "https://fli.so",
    keywords:
      "url shortener, link shortener, custom links, analytics, open source",
    author: "THISUX PRIVATE LIMITED",
  };
</script>

<svelte:head>
  <title>{defaultMeta.title}</title>
  <meta name="description" content={defaultMeta.description} />
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
  <meta name="theme-color" content="#DCD5C7" />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="Fli.so" />
  <link rel="manifest" href="/site.webmanifest" />
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
