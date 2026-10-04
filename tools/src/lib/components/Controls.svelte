<script lang="ts">
  import MazeControls from "$lib/components/MazeControls.svelte";
  import LogControls from "$lib/components/LogControls.svelte";
  import TrackControls from "$lib/components/TrackControls.svelte";
  import { serial } from "$lib/state/serialState.svelte";

  let { tool = "raijin" }: { tool?: "fujin" | "raijin" | "raiju" } = $props();
  let fujinTab = $state<"algorithms" | "logs">("algorithms");
</script>

<div class="flex w-full grow flex-col border border-gray-500/25 font-mono text-amber-500 min-h-0 overflow-hidden">
  <div class="flex flex-row items-center bg-amber-500/10 shrink-0">
    <span class="inline-block bg-amber-500 px-2 py-1 text-xs font-bold text-black uppercase">Controls</span>
    <button class="ml-auto icon-[material-symbols--bluetooth] cursor-pointer align-middle" title="Bluetooth"> </button>
    <button onclick={() => serial.connect()} class="mr-1 ml-2 icon-[material-symbols--usb] cursor-pointer align-middle" title="USB Serial"> </button>
  </div>

  {#if tool === "fujin"}
    <!-- Fujin sub-tab bar -->
    <div class="flex flex-row border-b border-gray-500/30 bg-black/60 shrink-0 text-xs font-bold">
      <button
        onclick={() => (fujinTab = "algorithms")}
        class={`flex-1 py-1.5 px-3 text-center transition-colors cursor-pointer uppercase ${
          fujinTab === "algorithms"
            ? "border-b-2 border-amber-500 text-amber-500 bg-amber-500/10"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
        }`}
      >
        Algorithms
      </button>
      <button
        onclick={() => (fujinTab = "logs")}
        class={`flex-1 py-1.5 px-3 text-center transition-colors cursor-pointer uppercase ${
          fujinTab === "logs"
            ? "border-b-2 border-amber-500 text-amber-500 bg-amber-500/10"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
        }`}
      >
        Log Inspector
      </button>
    </div>
  {/if}

  <div class="scroll-amber-500 flex flex-col min-h-0 grow overflow-y-auto">
    {#if tool === "fujin"}
      {#if fujinTab === "algorithms"}
        <MazeControls />
      {:else}
        <LogControls />
      {/if}
    {:else if tool === "raijin"}
      <TrackControls />
    {:else}
      <div class="flex grow items-center justify-center p-4 text-gray-500">
        <span class="text-sm uppercase">{tool}</span>
      </div>
    {/if}
  </div>
</div>
