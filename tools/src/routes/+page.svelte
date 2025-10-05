<script lang="ts">
  import { format } from "date-fns";
  import Maze from "$lib/components/Maze.svelte";
  import MazeControls from "$lib/components/MazeControls.svelte";

  let appLogsOpen = false;
  let serialLogsOpen = true;

  const logEntries = [
    { timestamp: format(new Date(), "HH:mm:ss"), level: "INFO", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "ERROR", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "INFO", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "ERROR", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "INFO", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
    { timestamp: format(new Date(), "HH:mm:ss"), level: "WARN", message: "test log" },
  ];

  const serialLogs: string[] = [];
</script>

<main class="grid h-screen w-screen grid-cols-[600px_1fr] grid-rows-[2rem_1fr] overflow-hidden bg-black text-gray-300">
  <header class="col-span-2 flex flex-row items-center border-b border-b-gray-500/25 px-10 font-jp">
    <span class="font-jp">雷獣</span>
    <div class="ml-auto flex flex-row gap-4 uppercase">
      <button>raiju</button>
      <button>raijin</button>
      <button>fujin</button>
      <div class="w-[0.3px] bg-gray-300"></div>
      <button>D</button>
      <button>E</button>
    </div>
  </header>
  <div class="box-border flex flex-col gap-2 p-3">
    <MazeControls />

    <div class="w-full font-mono text-sm text-violet-500" on:click={() => (serialLogsOpen = !serialLogsOpen)}>
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

    <div class="w-full font-mono text-sm text-indigo-500" on:click={() => (appLogsOpen = !appLogsOpen)}>
      <div class="flex flex-row items-center bg-indigo-500/10">
        <span class="inline-block cursor-pointer bg-indigo-500 px-2 py-1 text-xs font-bold text-black uppercase select-none">App Logs</span>
        <div class="ml-auto text-red-500">{logEntries.filter((l) => l.level === "ERROR").length}</div>
        <div class="mr-2 ml-2 text-yellow-500">{logEntries.filter((l) => l.level === "WARN").length}</div>
      </div>

      <div
        class="scroll-indigo-500 overflow-y-auto border border-gray-500/25 transition-all duration-500 ease-in-out"
        class:max-h-[200px]={serialLogsOpen && appLogsOpen}
        class:max-h-[400px]={!serialLogsOpen && appLogsOpen}
        class:max-h-0={!appLogsOpen}
      >
        <div class="p-2">
          <div class="grid grid-cols-[max-content_max-content_1fr] items-center gap-2 p-2">
            {#each logEntries as entry}
              <span
                class={{
                  "border-r border-l-4 border-gray-700 px-2 py-1 text-gray-400": true,
                  "border-amber-900 bg-amber-900/20 text-amber-500": entry.level === "WARN",
                  "border-red-900 bg-red-900/20 text-red-500": entry.level === "ERROR",
                }}
              >
                {entry.timestamp}
              </span>
              <span
                class={{
                  "border-r  border-gray-700 px-2 py-1 text-gray-400": true,
                  "bg-amber-900/20 text-amber-500": entry.level === "WARN",
                  "bg-red-900/20 text-red-500": entry.level === "ERROR",
                }}
              >
                {entry.level}
              </span>
              <span
                class={{
                  "border-r  border-gray-700 px-2 py-1 text-gray-400": true,
                  "bg-amber-900/20 text-amber-500": entry.level === "WARN",
                  "bg-red-900/20 text-red-500": entry.level === "ERROR",
                }}
              >
                {entry.message}
              </span>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="box-border h-full p-3">
    <Maze />
  </div>
</main>
