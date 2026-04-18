<script lang="ts">
  import Maze from "$lib/components/Maze.svelte";
  import Track from "$lib/components/Track.svelte";

  let { tool = "raijin" }: { tool?: "fujin" | "raijin" | "raiju" } = $props();
</script>

<div class="flex h-full w-full flex-col border border-gray-500/25 font-mono text-purple-500">
  <div class="flex flex-row items-center bg-purple-500/10">
    <span class="inline-block bg-purple-500 px-2 py-1 text-xs font-bold text-black uppercase">{tool === "fujin" ? "Maze" : "Track"}</span>
  </div>
  {#if tool === "fujin"}
    <Maze />
  {:else if tool === "raijin"}
    <Track />
  {:else}
    <div class="flex grow items-center justify-center bg-gray-900/50">
      <span class="text-4xl font-bold text-amber-500 uppercase opacity-20">{tool}</span>
    </div>
  {/if}
</div>
