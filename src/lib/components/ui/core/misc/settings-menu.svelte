<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import { Crown, MessageCircle, Gift, LogOut, Globe } from "lucide-svelte";

  interface Props {
    name: string;
    email: string;
    avatar: string;
    showUpgrade?: boolean;
  }

  let { name, email, avatar, showUpgrade = true }: Props = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Avatar.Root>
      <Avatar.Image src={avatar} alt={name} />
      <Avatar.Fallback class="bg-white text-black">
        {name.slice(0, 2)}
      </Avatar.Fallback>
    </Avatar.Root>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-[240px] bg-input-foreground">
    <div class="px-2 py-2.5 text-base">
      <div class="font-medium">{name}</div>
      <div class="text-sm text-muted-foreground">{email}</div>
    </div>

    <DropdownMenu.Group
      class="flex flex-col gap-2 rounded-2xl bg-white p-2 text-base"
    >
      <DropdownMenu.Item
        class="text-base hover:cursor-pointer  hover:bg-white/10"
        href="/billing"
      >
        <Crown class="mr-2 size-5" />
        {showUpgrade ? "Upgrade to Pro" : "Manage billing"}
      </DropdownMenu.Item>

      <DropdownMenu.Item
        class="hover:cursor-pointer hover:bg-white/10"
        href="/domains"
      >
        <Globe class="mr-2 size-5" />
        <span class="text-base">Domains</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item class="hover:cursor-pointer hover:bg-white/10">
        <MessageCircle class="mr-2 size-5" />
        <span class="text-base">Feedback</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item
        class="hover:cursor-pointer hover:bg-white/10"
        href="https://thisux.com?utm_source=blink"
        target="_blank"
      >
        <Gift class="mr-2 size-5" />
        <span class="text-base">More from us</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item class="group w-full hover:cursor-pointer">
        <form action="?/logout" method="post">
          <button
            type="submit"
            class="flex w-full items-center text-base group-hover:text-red-500"
          >
            <LogOut class="mr-2 size-5 group-hover:text-red-500" />
            Logout
          </button>
        </form>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
