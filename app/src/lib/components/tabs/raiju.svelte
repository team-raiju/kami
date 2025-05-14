<script lang="ts">
  import { Tabs } from "bits-ui";
</script>

<Tabs.Root value="params" class="w-full p-3">
  <Tabs.List
    class="inset-shadow grid w-full grid-cols-2 gap-1 rounded-[9px] bg-gray-600 p-1 text-sm leading-[0.01em] font-semibold text-white"
  >
    <Tabs.Trigger
      value="params"
      class="h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-gray-800 data-[state=active]:shadow"
    >
      Parameters
    </Tabs.Trigger>
    <Tabs.Trigger
      value="strategies"
      class="h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-gray-800 data-[state=active]:shadow"
    >
      Strategies
    </Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="params" class="pt-3 select-none">Params</Tabs.Content>
  <Tabs.Content value="inbound" class="pt-3 select-none"></Tabs.Content>
</Tabs.Root>
