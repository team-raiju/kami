<script lang="ts">
  import { bluetoothService } from "$lib";
  import { Tabs, Button } from "bits-ui";
  import { Bluetooth } from "phosphor-svelte";
  import Raiju from "../tabs/raiju.svelte";

  let selected = $state("raiju");

  const tabs = ["raiju", "raijin", "fujin"] as const;
  const titles = {
    raiju: "Raiju",
    raijin: "Raijin",
    fujin: "Fujin",
  } as Record<string, string>;
</script>

<Tabs.Root bind:value={selected} class="h-full w-full overflow-auto pb-20">
  <div class="flex h-12 flex-row bg-violet-950 px-4 text-xl font-bold text-white">
    <div class="">{titles[selected]}</div>
    <Button.Root class="ml-auto" onclick={() => bluetoothService.connect((d) => console.log(d))}><Bluetooth /></Button.Root>
  </div>
  <div>
    <Tabs.Content value="raiju">
      <Raiju></Raiju>
    </Tabs.Content>
    <Tabs.Content value="raijin"></Tabs.Content>
    <Tabs.Content value="fujin"></Tabs.Content>
  </div>

  <Tabs.List class="absolute bottom-0 z-90 grid w-full max-w-md grid-cols-3  bg-gray-900">
    {#each tabs as tab}
      <Tabs.Trigger value={tab} class="size-16 w-full fill-white p-2 data-[state=active]:bg-gray-950">
        <img class="size-full text-white" src="img/{tab}.svg" alt={tab} />
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
