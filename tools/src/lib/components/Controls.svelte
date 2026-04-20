<script lang="ts">
  import MazeControls from "$lib/components/MazeControls.svelte";
  import TrackControls from "$lib/components/TrackControls.svelte";
  import { serial } from "$lib/state/serialState.svelte";

  let { tool = "raijin" }: { tool?: "fujin" | "raijin" | "raiju" } = $props();
</script>

<div class="flex w-full grow flex-col border border-gray-500/25 font-mono text-amber-500">
  <div class="flex flex-row items-center bg-amber-500/10">
    <span class="inline-block bg-amber-500 px-2 py-1 text-xs font-bold text-black uppercase">Controls</span>
    <button class="ml-auto icon-[material-symbols--bluetooth] cursor-pointer align-middle" title="Bluetooth"> </button>
    <button onclick={() => serial.connect()} class="mr-1 ml-2 icon-[material-symbols--usb] cursor-pointer align-middle" title="USB Serial"> </button>
  </div>
  {#if tool === "fujin"}
    <MazeControls />
  {:else if tool === "raijin"}
    <TrackControls />
  {:else}
    <div class="flex grow items-center justify-center p-4 text-gray-500">
      <span class="text-sm uppercase">{tool}</span>
    </div>
  {/if}
</div>
