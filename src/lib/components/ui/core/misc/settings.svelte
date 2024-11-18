<script lang="ts">
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Crown, MessageCircle, Gift, LogOut } from "lucide-svelte";

  interface Props {
    name: string;
    email: string;
    avatar: string;
  }

  let {
    name = "John Doe",
    email = "john.doe@example.com",
    avatar = "https://github.com/shadcn.png",
  }: Props = $props();
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Avatar.Root>
      <Avatar.Image src={avatar} alt={name} />
      <Avatar.Fallback>CN</Avatar.Fallback>
    </Avatar.Root>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content class="w-[240px] bg-input-foreground">
    <div class="px-2 py-2.5 text-base">
      <div class="font-medium">{name}</div>
      <div class="text-sm text-muted-foreground">{email}</div>
    </div>

    <DropdownMenu.Group class="flex gap-2 flex-col rounded-2xl bg-white p-2 text-base">
      <DropdownMenu.Item class="hover:cursor-pointer hover:bg-white/10">
        <Crown class="mr-2 size-5" />
        <span class="text-base">Upgrade to Pro</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item class="hover:cursor-pointer hover:bg-white/10">
        <MessageCircle class="mr-2 size-5" />
        <span class="text-base">Feedback</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item class="hover:cursor-pointer hover:bg-white/10">
        <Gift class="mr-2 size-5" />
        <span class="text-base">More from us</span>
      </DropdownMenu.Item>

      <DropdownMenu.Item class="group hover:cursor-pointer">
        <LogOut class="mr-2 size-5 group-hover:text-red-500" />
        <span class="text-base group-hover:text-red-500">Logout</span>
      </DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
