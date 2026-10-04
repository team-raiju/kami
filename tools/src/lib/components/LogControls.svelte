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

<div class="flex flex-col gap-3 p-3 font-mono text-sm text-content-primary">
  <!-- Log Operations Card -->
  <div class="flex flex-col gap-2 rounded border border-border-default bg-surface-box p-2.5">
    <div class="flex flex-row items-center justify-between border-b border-border-default pb-1.5">
      <span class="text-xs font-bold text-iris uppercase tracking-wider">Telemetry Log</span>
      {#if fujinLog.hasData}
        <span
          class={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
            fujinLog.mode === "sensor"
              ? "bg-seafoam/15 text-seafoam border-seafoam/30"
              : "bg-amber-soft/15 text-amber-soft border-amber-soft/30"
          }`}
        >
          {fujinLog.mode} MODE
        </span>
      {:else}
        <span class="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] text-content-muted uppercase border border-border-default">
          NO LOG LOADED
        </span>
      {/if}
    </div>

    <div class="grid grid-cols-3 gap-1.5 pt-1">
      <button
        onclick={handleOpenFilePicker}
        class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1.5 text-center text-xs text-iris font-semibold uppercase hover:bg-iris/20 transition-colors"
      >
        Upload
      </button>
      <button
        onclick={() => serial.readLog()}
        disabled={!serial.connected}
        class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1.5 text-center text-xs text-iris font-semibold uppercase hover:bg-iris/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:border-border-default disabled:text-content-muted"
        title={serial.connected ? "Request log from robot" : "Serial not connected"}
      >
        Read Serial
      </button>
      <button
        onclick={() => (vaultOpen = true)}
        class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1.5 text-center text-xs text-iris font-semibold uppercase hover:bg-iris/20 transition-colors"
      >
        Vault
      </button>
    </div>

    {#if fujinLog.hasData}
      <button
        onclick={() => fujinLog.clear()}
        class="mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded border border-flamingo/40 bg-flamingo/10 px-2 py-1 text-xs text-flamingo font-semibold uppercase hover:bg-flamingo/20 transition-colors"
      >
        <span class="icon-[material-symbols--delete-outline] text-sm"></span>
        Clear Log Data
      </button>
    {/if}
  </div>

  <!-- Log Info / Metrics Card -->
  {#if fujinLog.hasData && fujinLog.metrics}
    <div class="flex flex-col gap-2 rounded border border-border-default bg-surface-box p-2.5 text-xs">
      <div class="flex flex-row items-center justify-between border-b border-border-default pb-1.5">
        <span class="font-bold text-iris uppercase tracking-wider">Log Details</span>
        <span class="truncate max-w-[200px] text-content-secondary" title={fujinLog.fileName}>
          {fujinLog.fileName}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-content-primary">
        <div class="flex flex-col bg-surface-elevated/60 p-2 rounded border border-border-default">
          <span class="text-[10px] text-content-muted uppercase">Samples</span>
          <span class="font-bold text-iris">{fujinLog.metrics.samples.toLocaleString()}</span>
        </div>
        <div class="flex flex-col bg-surface-elevated/60 p-2 rounded border border-border-default">
          <span class="text-[10px] text-content-muted uppercase">Duration</span>
          <span class="font-bold text-iris">{(fujinLog.metrics.durationMs / 1000).toFixed(2)} s</span>
        </div>
        <div class="flex flex-col bg-surface-elevated/60 p-2 rounded border border-border-default">
          <span class="text-[10px] text-content-muted uppercase">Max Velocity</span>
          <span class="font-bold text-seafoam">{fujinLog.metrics.maxVel.toFixed(3)} m/s</span>
        </div>
        <div class="flex flex-col bg-surface-elevated/60 p-2 rounded border border-border-default">
          <span class="text-[10px] text-content-muted uppercase">Max Ang Vel</span>
          <span class="font-bold text-amber-soft">{fujinLog.metrics.maxAngVel.toFixed(2)} rad/s</span>
        </div>
      </div>

      {#if fujinLog.metrics.minBatt > 0}
        <div class="flex flex-row items-center justify-between border-t border-border-default pt-1.5 text-[11px]">
          <span class="text-content-secondary">Min Battery:</span>
          <span class="font-bold text-content-primary">{fujinLog.metrics.minBatt.toFixed(0)} mV</span>
        </div>
      {/if}

      <div class="mt-1 flex items-center justify-between text-[11px] text-content-secondary border-t border-border-default pt-1.5">
        <span>Available Columns:</span>
        <span class="text-iris font-semibold">{Object.keys(fujinLog.series).length}</span>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each Object.keys(fujinLog.series) as col}
          <span class="rounded bg-surface-elevated border border-border-accent px-1.5 py-0.5 text-[9px] text-content-secondary">
            {col}
          </span>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-border-default bg-surface-box/50 p-8 text-center text-content-muted">
      <span class="icon-[material-symbols--analytics-outline] text-3xl text-iris/30"></span>
      <p class="text-xs text-content-secondary">No telemetry log loaded.</p>
      <p class="text-[11px] text-content-muted">
        Upload a telemetry file or pick a log from the <strong class="text-iris font-semibold">Vault</strong> to inspect metrics, visualize the robot's path on the maze, and plot charts.
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
