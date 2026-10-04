<script lang="ts">
  import Maze from "$lib/components/Maze.svelte";
  import LogCharts from "$lib/components/LogCharts.svelte";
  import Track from "$lib/components/Track.svelte";

  let { tool = "raijin" }: { tool?: "fujin" | "raijin" | "raiju" } = $props();
  let fujinCanvasTab = $state<"maze" | "charts">("maze");
</script>

<div class="flex h-full w-full flex-col border border-border-default bg-surface font-mono text-content-primary min-h-0 overflow-hidden">
  <div class="flex flex-row items-center border-b border-border-default bg-surface-elevated/30 shrink-0">
    {#if tool === "fujin"}
      <div class="flex flex-row">
        <button
          onclick={() => (fujinCanvasTab = "maze")}
          class={`cursor-pointer px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
            fujinCanvasTab === "maze"
              ? "bg-iris text-canvas font-bold"
              : "text-content-secondary hover:text-content-primary hover:bg-surface-elevated/40"
          }`}
        >
          Maze
        </button>
        <button
          onclick={() => (fujinCanvasTab = "charts")}
          class={`cursor-pointer px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
            fujinCanvasTab === "charts"
              ? "bg-iris text-canvas font-bold"
              : "text-content-secondary hover:text-content-primary hover:bg-surface-elevated/40"
          }`}
        >
          Charts
        </button>
      </div>
    {:else}
      <span class="inline-block bg-iris px-2.5 py-1 text-xs font-bold text-canvas uppercase tracking-wider">
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
      <div class="h-full w-full min-h-0 min-w-0 flex items-center justify-center">
        <Track />
      </div>
    {:else}
      <div class="flex grow items-center justify-center bg-gray-900/50">
        <span class="text-4xl font-bold text-amber-500 uppercase opacity-20">{tool}</span>
      </div>
    {/if}
  </div>
</div>
