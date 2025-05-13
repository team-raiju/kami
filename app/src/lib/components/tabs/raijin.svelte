<script lang="ts">
  import { tap, press } from "svelte-gestures";
  import { PaperPlaneRight, RadioButton, Stop } from "phosphor-svelte";
  import { Label } from "bits-ui";

  const parameters = $state([
    {
      label: "Config 1",
      input: null as number | null,
      value: null as number | null,
    },
    {
      label: "Config 2",
      input: null as number | null,
      value: null as number | null,
    },
    {
      label: "Config 3",
      input: null as number | null,
      value: null as number | null,
    },
  ]);
</script>

<div class="p-3">
  <div class="mb-5 flex flex-row justify-center gap-2 text-sm font-bold text-white">
    <div
      use:tap={() => ({ timeframe: 300 })}
      ontap={(e) => console.log(e)}
      use:press={() => ({ timeframe: 400 })}
      onpress={(e) => console.log(e)}
      class="flex h-10 cursor-pointer flex-row items-center gap-1 rounded-md bg-violet-800 p-2 !select-none hover:bg-violet-900"
    >
      <RadioButton weight="bold" />
      <span> Button 1 </span>
    </div>
    <div
      use:tap={() => ({ timeframe: 300 })}
      ontap={(e) => console.log(e)}
      use:press={() => ({ timeframe: 400 })}
      onpress={(e) => console.log(e)}
      class="flex h-10 cursor-pointer flex-row items-center gap-1 rounded-md bg-violet-800 p-2 !select-none hover:bg-violet-900"
    >
      <RadioButton weight="bold" />
      <span> Button 2 </span>
    </div>
    <div
      use:tap={() => ({ timeframe: 300 })}
      ontap={(e) => console.log(e)}
      use:press={() => ({ timeframe: 400 })}
      onpress={(e) => console.log(e)}
      class="flex h-10 cursor-pointer flex-row items-center gap-1 rounded-md bg-red-800 p-2 !select-none hover:bg-red-900"
    >
      <Stop weight="fill" />
      <span> Stop </span>
    </div>
  </div>

  {#each parameters as param}
    <Label.Root
      id={param.label + "-label"}
      for={param.label}
      class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {param.label}
    </Label.Root>
    <div class="mb-3 flex h-8 w-full flex-row items-center gap-2">
      <input
        class="h-8 flex-grow rounded-md border border-violet-500 px-3 focus:border-violet-600"
        type="number"
        id={param.label}
        bind:value={param.input}
      />
      <div class="w-[30%] text-center">{param.value ?? "?"}</div>
      <button onclick={() => (param.value = param.input)}><PaperPlaneRight /></button>
    </div>
  {/each}
</div>
