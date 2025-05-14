<script lang="ts">
  import { Tabs, Button, ScrollArea } from "bits-ui";
  import { Bluetooth } from "phosphor-svelte";

  import { bluetoothService } from "$lib/bt.svelte";
  import Raiju from "$lib/components/tabs/raiju.svelte";
  import Raijin from "$lib/components/tabs/raijin.svelte";
  import LogToggler from "$lib/components/log-toggler.svelte";

  let selected: (typeof tabs)[number] = $state("raijin");

  const tabs = ["raijin", "raiju" /*"fujin"*/] as const;
  const titles = {
    raiju: "Raiju",
    raijin: "Raijin",
    fujin: "Fujin",
  };

  bluetoothService.init();
</script>

<Tabs.Root bind:value={selected} class="h-screen w-full">
  <div class="flex h-12 flex-row items-center gap-2 bg-violet-950 px-4 text-xl font-bold text-white">
    <div>{titles[selected]}</div>
    <Button.Root class="ml-auto" onclick={() => bluetoothService.connect()}><Bluetooth /></Button.Root>
    <LogToggler />
  </div>
  <ScrollArea.Root>
    <ScrollArea.Viewport class="h-[calc(100vh-var(--spacing)*28)] w-full">
      <Tabs.Content value="raiju" class="h-full">
        <Raiju></Raiju>
      </Tabs.Content>
      <Tabs.Content value="raijin" class="h-full">
        <Raijin></Raijin>
      </Tabs.Content>
      <Tabs.Content value="fujin" class="h-full">TBD</Tabs.Content>
    </ScrollArea.Viewport>
    <ScrollArea.Scrollbar
      orientation="vertical"
      class="bg-muted hover:bg-dark-10 data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=visible]:fade-in-0 flex w-2.5 touch-none rounded-full border-l border-l-transparent p-px transition-all duration-200 select-none hover:w-3"
    >
      <ScrollArea.Thumb class="bg-muted-foreground flex-1 rounded-full" />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>

  <Tabs.List class="grid w-full max-w-md grid-cols-2 bg-gray-900">
    {#each tabs as tab}
      <Tabs.Trigger value={tab} class="size-16 w-full fill-white p-2 data-[state=active]:bg-gray-950">
        <img class="size-full text-white" src="img/{tab}.svg" alt={tab} />
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
