<script lang="ts">
  import MazeControls from "$lib/components/MazeControls.svelte";
  import AppLogs from "$lib/components/AppLogs.svelte";
  import Controls from "$lib/components/Controls.svelte";
  import ToolCanvas from "$lib/components/ToolCanvas.svelte";
  import { log } from "$lib/state/logsState.svelte";

  let appLogsOpen = $state(false);
  let serialLogsOpen = $state(false);

  type Tool = "fujin" | "raijin" | "raiju";
  let selectedTool: Tool = $state("raijin");
</script>

<main class="grid h-screen w-screen grid-cols-[600px_1fr] grid-rows-[2rem_1fr] overflow-hidden bg-black text-gray-300">
  <header class="col-span-2 flex flex-row items-center border-b border-b-gray-500/25 px-10 font-jp">
    <span class="font-title">Team Raiju</span>
    <div class="ml-auto flex flex-row gap-4 uppercase">
      <button class="cursor-not-allowed px-2 py-1 text-xs font-bold text-gray-500" disabled>raiju</button>
      <button
        class="px-2 py-1 text-xs font-bold uppercase transition-colors"
        class:text-amber-500={selectedTool === "raijin"}
        class:text-gray-500={selectedTool !== "raijin"}
        onclick={() => (selectedTool = "raijin")}
      >
        raijin
      </button>
      <button
        class="px-2 py-1 text-xs font-bold uppercase transition-colors"
        class:text-amber-500={selectedTool === "fujin"}
        class:text-gray-500={selectedTool !== "fujin"}
        onclick={() => (selectedTool = "fujin")}
      >
        fujin
      </button>
    </div>
  </header>
  <div class="box-border flex flex-col gap-2 p-3">
    <Controls tool={selectedTool} />

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
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
          {#each log.serial as entry}
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
    <ToolCanvas tool={selectedTool} />
  </div>
</main>
