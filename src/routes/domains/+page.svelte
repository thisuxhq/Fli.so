<script lang="ts">
  import { DomainCard } from "$lib/components/ui/core";
  import { NewDomainForm } from "$lib/components/ui/core/form";
  import { Button } from "$lib/components/ui/button";
  import { Plus } from "lucide-svelte";

  let { data } = $props();
  let showAddForm = $state(false);
</script>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8 flex items-center justify-between">
    <h1 class="text-3xl font-bold">Custom Domains</h1>
    <Button class="rounded-2xl" on:click={() => (showAddForm = true)}>
      <Plus class="mr-2 h-4 w-4" />
      Add domain
    </Button>
  </div>

  <!-- Domains List -->
  <div class="space-y-4">
    {#if data.domains.length === 0}
      <div class="rounded-2xl bg-white p-8 text-center">
        <p class="text-muted-foreground">
          You haven't added any custom domains yet.
        </p>
      </div>
    {:else}
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each data.domains as domain (domain.id)}
          <DomainCard {domain} />
        {/each}
      </div>
    {/if}
  </div>

  <NewDomainForm
    data={data.form}
    show={showAddForm}
    user_id={data.user?.id}
    onOpenChange={(open) => (showAddForm = open)}
  />
</div>