<script lang="ts">
  import { Tabs } from "bits-ui";
</script>

<Tabs.Root value="params" class="rounded-card border-muted bg-background-alt shadow-card w-full border p-3">
  <Tabs.List
    class="rounded-9px bg-dark-10 shadow-mini-inset dark:bg-background grid w-full grid-cols-2 gap-1 p-1 text-sm leading-[0.01em] font-semibold dark:border dark:border-neutral-600/30"
  >
    <Tabs.Trigger
      value="params"
      class="data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-white"
    >
      Parameters
    </Tabs.Trigger>
    <Tabs.Trigger
      value="strategies"
      class="data-[state=active]:shadow-mini dark:data-[state=active]:bg-muted h-8 rounded-[7px] bg-transparent py-2 data-[state=active]:bg-white"
    >
      Strategies
    </Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="params" class="pt-3 select-none">Params</Tabs.Content>
  <Tabs.Content value="inbound" class="pt-3 select-none"></Tabs.Content>
</Tabs.Root>
