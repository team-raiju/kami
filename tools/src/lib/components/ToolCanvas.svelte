<script lang="ts">
  import Maze from "$lib/components/Maze.svelte";
  import LogCharts from "$lib/components/LogCharts.svelte";
  import Track from "$lib/components/Track.svelte";

  let { tool = "raijin" }: { tool?: "fujin" | "raijin" | "raiju" } = $props();
  let fujinCanvasTab = $state<"maze" | "charts">("maze");
</script>

<div class="flex h-full w-full flex-col border border-gray-500/25 font-mono text-purple-500 min-h-0 overflow-hidden">
  <div class="flex flex-row items-center bg-purple-500/10 shrink-0">
    {#if tool === "fujin"}
      <div class="flex flex-row">
        <button
          onclick={() => (fujinCanvasTab = "maze")}
          class={`cursor-pointer px-3 py-1 text-xs font-bold uppercase transition-colors ${
            fujinCanvasTab === "maze"
              ? "bg-purple-500 text-black"
              : "text-purple-400 hover:bg-purple-500/20"
          }`}
        >
          Maze
        </button>
        <button
          onclick={() => (fujinCanvasTab = "charts")}
          class={`cursor-pointer px-3 py-1 text-xs font-bold uppercase transition-colors ${
            fujinCanvasTab === "charts"
              ? "bg-purple-500 text-black"
              : "text-purple-400 hover:bg-purple-500/20"
          }`}
        >
          Charts
        </button>
      </div>
    {:else}
      <span class="inline-block bg-purple-500 px-2 py-1 text-xs font-bold text-black uppercase">
        {tool === "raijin" ? "Track" : tool}
      </span>
    {/if}
  </div>

  <div class="flex grow min-h-0 w-full overflow-hidden items-center justify-center">
    {#if tool === "fujin"}
      {#if fujinCanvasTab === "maze"}
        <Maze />
      {:else}
        <div class="flex h-full w-full items-center justify-center min-h-0 min-w-0 overflow-hidden p-2">
          <div class="aspect-square h-full max-h-full max-w-full flex min-h-0 min-w-0 overflow-hidden">
            <LogCharts />
          </div>
        </div>
      {/if}
    {:else if tool === "raijin"}
      <Track />
    {:else}
      <div class="flex grow items-center justify-center bg-gray-900/50">
        <span class="text-4xl font-bold text-amber-500 uppercase opacity-20">{tool}</span>
      </div>
    {/if}
  </div>
</div>
