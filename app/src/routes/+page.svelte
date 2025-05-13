<script lang="ts">
  import { Tabs, Button } from "bits-ui";
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
</script>

<Tabs.Root bind:value={selected} class="h-full w-full overflow-auto pb-20">
  <div class="flex h-12 flex-row items-center gap-2 bg-violet-950 px-4 text-xl font-bold text-white">
    <div>{titles[selected]}</div>
    <Button.Root class="ml-auto" onclick={() => bluetoothService.connect()}><Bluetooth /></Button.Root>
    <LogToggler />
  </div>
  <div>
    <Tabs.Content value="raiju">
      <Raiju></Raiju>
    </Tabs.Content>
    <Tabs.Content value="raijin">
      <Raijin></Raijin>
    </Tabs.Content>
    <Tabs.Content value="fujin">TBD</Tabs.Content>
  </div>

  <Tabs.List class="absolute bottom-0 z-90 grid w-full max-w-md grid-cols-2 bg-gray-900">
    {#each tabs as tab}
      <Tabs.Trigger value={tab} class="size-16 w-full fill-white p-2 data-[state=active]:bg-gray-950">
        <img class="size-full text-white" src="img/{tab}.svg" alt={tab} />
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
