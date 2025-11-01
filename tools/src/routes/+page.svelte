<script lang="ts">
  import Maze from "$lib/components/Maze.svelte";
  import MazeControls from "$lib/components/MazeControls.svelte";
  import AppLogs from "$lib/components/AppLogs.svelte";

  let appLogsOpen = $state(false);
  let serialLogsOpen = $state(false);

  const serialLogs: string[] = [];
</script>

<main class="grid h-screen w-screen grid-cols-[600px_1fr] grid-rows-[2rem_1fr] overflow-hidden bg-black text-gray-300">
  <header class="col-span-2 flex flex-row items-center border-b border-b-gray-500/25 px-10 font-jp">
    <span class="font-jp">雷獣</span>
    <div class="ml-auto flex flex-row gap-4 uppercase">
      <button>raiju</button>
      <button>raijin</button>
      <button>fujin</button>
    </div>
  </header>
  <div class="box-border flex flex-col gap-2 p-3">
    <MazeControls />

    <div class="w-full font-mono text-sm text-violet-500" onclick={() => (serialLogsOpen = !serialLogsOpen)}>
      <div class="flex flex-row items-center bg-violet-500/10">
        <span class="inline-block cursor-pointer bg-violet-500 px-2 py-1 text-xs font-bold text-black uppercase select-none">Serial Logs</span>
      </div>

      <div
        class="scroll-violet-500 overflow-y-auto border border-gray-500/25 transition-all duration-500 ease-in-out"
        class:max-h-[200px]={serialLogsOpen && appLogsOpen}
        class:max-h-[400px]={serialLogsOpen && !appLogsOpen}
        class:max-h-0={!serialLogsOpen}
      >
        <div class="grid grid-cols-1 items-center gap-2 p-2">
          {#each serialLogs as entry}
            <div
              class={{
                "border-r  border-gray-700 px-2 py-1 text-gray-400": true,
              }}
            >
              {entry}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <AppLogs bind:isOpen={appLogsOpen} isOtherOpen={serialLogsOpen} />
  </div>

  <div class="box-border h-full p-3">
    <Maze />
  </div>
</main>
