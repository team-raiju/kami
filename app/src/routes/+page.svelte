<script lang="ts">
  import { BluetoothService } from "$lib";
  import { Tabs } from "bits-ui";

  const tabs = ["raiju", "raijin", "fujin"];
</script>

<Tabs.Root class="h-full w-full" value="raiju">
  <Tabs.Content value="raiju">raiju</Tabs.Content>
  <Tabs.Content value="raijin">raijin</Tabs.Content>
  <Tabs.Content value="fujin">fujin</Tabs.Content>
  <Tabs.List class="z-90 flex w-full flex-row justify-around">
    {#each tabs as tab}
      <Tabs.Trigger value={tab}>{tab}</Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
