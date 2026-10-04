<script lang="ts">
  import { fujinLog } from "$lib/state/fujinLogState.svelte";
  import { serial } from "$lib/state/serialState.svelte";
  import { log } from "$lib/state/logsState.svelte";
  import Modal from "./Modal.svelte";

  const logFiles = import.meta.glob("/static/logs/fujin/*.txt");
  const vaultLogNames = Object.keys(logFiles).map((path) => path.split("/").pop()?.replace(".txt", "") ?? path);

  let vaultOpen = $state(false);
  let fileInput: HTMLInputElement;

  async function handleFileUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      await fujinLog.loadFile(target.files[0]);
    }
  }

  async function handleOpenFilePicker() {
    try {
      if ("showOpenFilePicker" in window) {
        const [handle] = await window.showOpenFilePicker({
          excludeAcceptAllOption: false,
          types: [
            {
              accept: {
                "text/plain": [".txt", ".csv", ".log"],
              },
              description: "Log Files",
            },
          ],
          multiple: false,
        });
        const file = await handle.getFile();
        await fujinLog.loadFile(file);
      } else {
        fileInput?.click();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        fileInput?.click();
      }
    }
  }
</script>

<input
  type="file"
  accept=".txt,.csv,.log"
  bind:this={fileInput}
  onchange={handleFileUpload}
  class="hidden"
/>

<div class="flex flex-col gap-3 p-3 font-mono text-sm">
  <!-- Log Operations Card -->
  <div class="flex flex-col gap-2 border border-gray-500/20 p-2">
    <div class="flex flex-row items-center justify-between border-b border-gray-500/30 pb-1">
      <span class="text-xs font-bold text-amber-500 uppercase">Telemetry Log</span>
      {#if fujinLog.hasData}
        <span
          class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
          class:bg-cyan-500-20={fujinLog.mode === "sensor"}
          class:text-cyan-400={fujinLog.mode === "sensor"}
          class:bg-amber-500-20={fujinLog.mode === "control"}
          class:text-amber-400={fujinLog.mode === "control"}
        >
          {fujinLog.mode} MODE
        </span>
      {:else}
        <span class="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400 uppercase">
          NO LOG LOADED
        </span>
      {/if}
    </div>

    <div class="grid grid-cols-3 gap-1.5 pt-1">
      <button
        onclick={handleOpenFilePicker}
        class="cursor-pointer bg-amber-500/10 px-2 py-1.5 text-center text-xs text-amber-500 uppercase hover:bg-amber-500/20 transition-colors"
      >
        Upload
      </button>
      <button
        onclick={() => serial.readLog()}
        disabled={!serial.connected}
        class="cursor-pointer bg-amber-500/10 px-2 py-1.5 text-center text-xs text-amber-500 uppercase hover:bg-amber-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={serial.connected ? "Request log from robot" : "Serial not connected"}
      >
        Read Serial
      </button>
      <button
        onclick={() => (vaultOpen = true)}
        class="cursor-pointer bg-amber-500/10 px-2 py-1.5 text-center text-xs text-amber-500 uppercase hover:bg-amber-500/20 transition-colors"
      >
        Vault
      </button>
    </div>

    {#if fujinLog.hasData}
      <button
        onclick={() => fujinLog.clear()}
        class="mt-1 flex w-full cursor-pointer items-center justify-center gap-1 border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs text-rose-400 uppercase hover:bg-rose-500/20 transition-colors"
      >
        <span class="icon-[material-symbols--delete-outline] text-sm"></span>
        Clear Log Data
      </button>
    {/if}
  </div>

  <!-- Log Info / Metrics Card -->
  {#if fujinLog.hasData && fujinLog.metrics}
    <div class="flex flex-col gap-2 border border-gray-500/20 p-2 text-xs">
      <div class="flex flex-row items-center justify-between border-b border-gray-500/30 pb-1">
        <span class="font-bold text-amber-500 uppercase">Log Details</span>
        <span class="truncate max-w-[200px] text-gray-400" title={fujinLog.fileName}>
          {fujinLog.fileName}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-gray-300">
        <div class="flex flex-col bg-black/40 p-1.5 rounded border border-gray-800">
          <span class="text-[10px] text-gray-500 uppercase">Samples</span>
          <span class="font-bold text-amber-400">{fujinLog.metrics.samples.toLocaleString()}</span>
        </div>
        <div class="flex flex-col bg-black/40 p-1.5 rounded border border-gray-800">
          <span class="text-[10px] text-gray-500 uppercase">Duration</span>
          <span class="font-bold text-amber-400">{(fujinLog.metrics.durationMs / 1000).toFixed(2)} s</span>
        </div>
        <div class="flex flex-col bg-black/40 p-1.5 rounded border border-gray-800">
          <span class="text-[10px] text-gray-500 uppercase">Max Velocity</span>
          <span class="font-bold text-amber-400">{fujinLog.metrics.maxVel.toFixed(3)} m/s</span>
        </div>
        <div class="flex flex-col bg-black/40 p-1.5 rounded border border-gray-800">
          <span class="text-[10px] text-gray-500 uppercase">Max Ang Vel</span>
          <span class="font-bold text-amber-400">{fujinLog.metrics.maxAngVel.toFixed(2)} rad/s</span>
        </div>
      </div>

      {#if fujinLog.metrics.minBatt > 0}
        <div class="flex flex-row items-center justify-between border-t border-gray-800 pt-1 text-[11px]">
          <span class="text-gray-400">Min Battery:</span>
          <span class="font-bold text-gray-200">{fujinLog.metrics.minBatt.toFixed(0)} mV</span>
        </div>
      {/if}

      <div class="mt-1 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800 pt-1.5">
        <span>Available Columns:</span>
        <span class="text-amber-500">{Object.keys(fujinLog.series).length}</span>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each Object.keys(fujinLog.series) as col}
          <span class="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] text-amber-300">
            {col}
          </span>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-gray-800 p-8 text-center text-gray-500">
      <span class="icon-[material-symbols--analytics-outline] text-3xl text-amber-500/40"></span>
      <p class="text-xs">No telemetry log loaded.</p>
      <p class="text-[11px] text-gray-600">
        Upload a telemetry file or pick a log from the <strong class="text-amber-500/80">Vault</strong> to inspect metrics, visualize the robot's path on the maze, and plot charts.
      </p>
    </div>
  {/if}
</div>

<Modal
  bind:open={vaultOpen}
  title="Vault Logs (Fujin)"
  items={vaultLogNames}
  onselect={(name) => fujinLog.loadFromVault(name)}
/>
