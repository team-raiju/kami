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

<main class="grid h-screen w-screen grid-cols-[600px_1fr] grid-rows-[2rem_1fr] overflow-hidden bg-canvas text-content-primary">
  <header class="col-span-2 flex flex-row items-center border-b border-border-default px-10 font-jp bg-surface-box">
    <span class="font-title text-content-primary">Team Raiju</span>
    <div class="ml-auto flex flex-row gap-4 uppercase">
      <button class="cursor-not-allowed px-2 py-1 text-xs font-bold text-content-muted" disabled>raiju</button>
      <button
        class="px-2 py-1 text-xs font-bold uppercase transition-colors"
        class:text-iris={selectedTool === "raijin"}
        class:text-content-secondary={selectedTool !== "raijin"}
        onclick={() => (selectedTool = "raijin")}
      >
        raijin
      </button>
      <button
        class="px-2 py-1 text-xs font-bold uppercase transition-colors"
        class:text-iris={selectedTool === "fujin"}
        class:text-content-secondary={selectedTool !== "fujin"}
        onclick={() => (selectedTool = "fujin")}
      >
        fujin
      </button>
    </div>
  </header>
  <div class="box-border flex flex-col gap-2 p-3 min-h-0 h-full overflow-hidden bg-canvas">
    <Controls tool={selectedTool} />

    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="w-full shrink-0 font-mono text-sm text-iris" onclick={() => (serialLogsOpen = !serialLogsOpen)}>
      <div class="flex flex-row items-center bg-iris/15 border border-border-default">
        <span class="inline-block cursor-pointer bg-iris px-2 py-1 text-xs font-bold text-canvas uppercase select-none">Serial Logs</span>
      </div>

      <div
        class="scroll-iris overflow-y-auto border border-border-default bg-surface transition-all duration-500 ease-in-out"
        class:max-h-[200px]={serialLogsOpen && appLogsOpen}
        class:max-h-[400px]={serialLogsOpen && !appLogsOpen}
        class:max-h-0={!serialLogsOpen}
      >
        <div class="grid grid-cols-1 items-center gap-2 p-2">
          {#each log.serial as entry}
            <div
              class={{
                "border-r border-border-default px-2 py-1 text-content-secondary": true,
              }}
            >
              {entry}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="shrink-0">
      <AppLogs bind:isOpen={appLogsOpen} isOtherOpen={serialLogsOpen} />
    </div>
  </div>

  <div class="box-border h-full p-3 min-h-0 min-w-0 overflow-hidden">
    <ToolCanvas tool={selectedTool} />
  </div>
</main>
