<script lang="ts">
  interface Props {
    shortcut: string;
  }

  let { shortcut }: Props = $props();
</script>

<span
  class="ml-2 flex size-6 items-center justify-center rounded-md border-[0.5px] border-[#363636] bg-[#262626] text-center text-xs leading-none text-slate-300"
>
  {shortcut}
</span>
