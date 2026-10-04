<script lang="ts">
  import { untrack } from "svelte";
  import { log } from "$lib/state/logsState.svelte";
  import { maze } from "$lib/state/mazeState.svelte";
  import { algorithm, SPEED_PRESET_LABELS } from "$lib/state/algorithmState.svelte";
  import { mazeStateToString, stringToMazeState } from "$lib/utils/mazeUtils";

  import Modal from "./Modal.svelte";

  const mazeFiles = import.meta.glob("/static/mazes/*.txt");
  const mazeNames = Object.keys(mazeFiles).map((path) => path.split("/").pop()?.replace(".txt", "") ?? path);

  let vaultOpen = $state(false);

  async function loadVaultMaze(name: string) {
    try {
      const data = await fetch(`/mazes/${name}.txt`);
      const content = await data.text();
      const newState = stringToMazeState(content);
      maze.set(newState);
      log.info(`Loaded maze: ${name}`);
      if (algorithm.wasmLoaded) {
        algorithm.recompute();
      }
    } catch (err: any) {
      log.error(`Failed to load vault maze: ${name}`);
      console.error(err);
    }
  }

  let fileInput: HTMLInputElement;

  async function handleMazeExport() {
    const mazeString = mazeStateToString(maze.state);
    await navigator.clipboard.writeText(mazeString);
    log.info("Maze exported to clipboard");
  }

  async function handleMazeImport() {
    try {
      const [handle] = await window.showOpenFilePicker({
        excludeAcceptAllOption: true,
        types: [
          {
            accept: {
              "text/plain": [".txt", ".mms"],
            },
            description: "MMS Maze File",
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      const mazeString = await file.text();

      if (!mazeString) {
        log.error("Failed to read maze");
        return;
      }

      const newState = stringToMazeState(mazeString);
      maze.set(newState);
      log.info("Maze imported successfully");
      if (algorithm.wasmLoaded) {
        algorithm.recompute();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        log.error("Failed to open or parse maze file");
        console.error(err);
      }
    }
  }

  function handleMazeRandom() {
    maze.generateRandom();
    log.info("Random valid maze generated");
    if (algorithm.wasmLoaded) {
      algorithm.recompute();
    }
  }

  async function handleWasmImport() {
    try {
      if ("showOpenFilePicker" in window) {
        const [handle] = await window.showOpenFilePicker({
          excludeAcceptAllOption: false,
          types: [
            {
              accept: {
                "application/wasm": [".wasm"],
              },
              description: "WebAssembly Binary",
            },
          ],
          multiple: false,
        });
        const file = await handle.getFile();
        await algorithm.loadWasmFile(file);
      } else {
        fileInput?.click();
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        fileInput?.click();
      }
    }
  }

  function handleFileInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      algorithm.loadWasmFile(target.files[0]);
    }
  }

  // Reactive auto-recompute when maze walls change
  $effect(() => {
    const _v = maze.version;
    if (algorithm.wasmLoaded) {
      untrack(() => {
        algorithm.recompute();
      });
    }
  });

  let tableContainer = $state<HTMLDivElement | null>(null);

  $effect(() => {
    const _sel = algorithm.selectedMovementIndex;
    if (tableContainer && _sel !== null) {
      const activeEl = tableContainer.querySelector(`[data-movement="${_sel}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  });

  $effect(() => {
    if (maze.state.editLocked && algorithm.isPickingGoal) {
      algorithm.isPickingGoal = false;
    }
  });
</script>

<input
  type="file"
  accept=".wasm"
  bind:this={fileInput}
  onchange={handleFileInputChange}
  class="hidden"
/>

<div class="flex flex-col gap-3 p-3 font-mono text-sm text-content-primary">
  <!-- 1. WASM Module Loader Header -->
  <div class="flex flex-col gap-1.5 rounded border border-border-default bg-surface-box p-2.5">
    <div class="flex flex-row items-center justify-between">
      <span class="text-xs font-bold text-iris uppercase tracking-wider">Algorithm WASM Module</span>
      {#if algorithm.wasmLoaded}
        <span class="rounded border border-seafoam/30 bg-seafoam/15 px-1.5 py-0.5 text-[10px] font-bold text-seafoam uppercase">
          LOADED
        </span>
      {:else}
        <span class="rounded border border-flamingo/30 bg-flamingo/15 px-1.5 py-0.5 text-[10px] font-bold text-flamingo uppercase">
          NOT LOADED
        </span>
      {/if}
    </div>

    <div class="truncate text-xs text-content-secondary">
      {algorithm.wasmFileName || "Load firmware/build/WASM/fujin_algorithms.wasm"}
    </div>

    <button
      onclick={handleWasmImport}
      class="mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded bg-iris px-3 py-1.5 text-xs font-bold text-canvas uppercase tracking-wider transition-colors hover:bg-iris/80"
    >
      <span class="icon-[material-symbols--upload-file] text-base"></span>
      {algorithm.wasmLoaded ? "Reload WASM Module" : "Load Algorithm WASM (.wasm)"}
    </button>
  </div>

  <!-- 2. Maze Management -->
  <div class="flex flex-col gap-2 rounded border border-border-default bg-surface-box p-2.5">
    <div class="flex flex-row items-center justify-between border-b border-border-default pb-1.5">
      <span class="text-xs font-bold text-iris uppercase tracking-wider">Maze Layout</span>
      <div class="flex items-center gap-1.5">
        <input
          type="checkbox"
          id="lock-maze"
          bind:checked={maze.state.editLocked}
          class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-accent bg-transparent checked:bg-iris accent-iris"
        />
        <label for="lock-maze" class="cursor-pointer text-xs text-content-secondary select-none">Lock</label>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-1.5">
      <button
        onclick={handleMazeImport}
        disabled={maze.state.editLocked}
        class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-xs text-iris font-semibold uppercase hover:bg-iris/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:border-border-default disabled:text-content-muted"
      >
        Import
      </button>
      <button
        onclick={handleMazeExport}
        class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-xs text-iris font-semibold uppercase hover:bg-iris/20 transition-colors"
      >
        Export
      </button>
      <button
        onclick={handleMazeRandom}
        disabled={maze.state.editLocked}
        class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-xs text-iris font-semibold uppercase hover:bg-iris/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:border-border-default disabled:text-content-muted"
      >
        Random
      </button>
      <button
        onclick={() => (vaultOpen = true)}
        disabled={maze.state.editLocked}
        class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-xs text-iris font-semibold uppercase hover:bg-iris/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:border-border-default disabled:text-content-muted"
      >
        Vault
      </button>
    </div>

    <!-- Goal line just below maze import buttons -->
    <div class="flex flex-row items-center justify-between border-t border-border-default pt-1.5 text-xs">
      <div class="flex items-center gap-2">
        <span class="font-bold text-iris uppercase tracking-wider">Goal</span>
        <span class="text-[11px] text-content-secondary">
          {#if algorithm.goalTarget.type === "center"}
            Center
          {:else if algorithm.goalTarget.type === "single"}
            ({algorithm.goalTarget.x}, {algorithm.goalTarget.y})
          {:else if algorithm.goalTarget.type === "junction"}
            4-Cell ({algorithm.goalTarget.x}, {algorithm.goalTarget.y})
          {/if}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <button
          onclick={() => (algorithm.isPickingGoal = !algorithm.isPickingGoal)}
          disabled={maze.state.editLocked}
          class={`cursor-pointer rounded p-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
            algorithm.isPickingGoal
              ? "bg-iris text-canvas animate-pulse"
              : "text-content-secondary hover:text-iris hover:bg-iris/15"
          }`}
          title={algorithm.isPickingGoal ? "Cancel picking" : "Pick goal on maze (click cell or 4-cell junction)"}
        >
          <span class="icon-[material-symbols--my-location] block text-base"></span>
        </button>

        <button
          onclick={() => algorithm.setGoal(null)}
          disabled={maze.state.editLocked || algorithm.goalTarget.type === "center"}
          class="cursor-pointer rounded p-1 text-content-muted hover:text-iris hover:bg-iris/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Reset to center goal"
        >
          <span class="icon-[material-symbols--restart-alt] block text-base"></span>
        </button>
      </div>
    </div>
  </div>

  {#if algorithm.wasmLoaded}
    <!-- 3. Algorithm Selector -->
    <div class="flex flex-col gap-2 rounded border border-border-default bg-surface-box p-2.5">
      <span class="border-b border-border-default pb-1.5 text-xs font-bold text-iris uppercase tracking-wider">
        Algorithm
      </span>

      <div class="grid grid-cols-2 gap-1.5">
        <button
          onclick={() => (algorithm.algorithmType = "time_based")}
          class={`cursor-pointer rounded px-2 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${algorithm.algorithmType === "time_based" ? "bg-iris text-canvas" : "bg-surface-elevated text-content-secondary hover:text-content-primary"}`}
        >
          Time-Based
        </button>

        <button
          onclick={() => (algorithm.algorithmType = "classic")}
          class={`cursor-pointer rounded px-2 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${algorithm.algorithmType === "classic" ? "bg-iris text-canvas" : "bg-surface-elevated text-content-secondary hover:text-content-primary"}`}
        >
          Classic BFS
        </button>
      </div>

      <!-- Speed Preset Selector -->
      <div class="flex flex-col gap-1 mt-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-content-secondary uppercase">Speed Preset</span>
          <span class="text-[10px] text-amber-soft font-medium">
            {SPEED_PRESET_LABELS[algorithm.speedPreset]?.speed}
          </span>
        </div>
        <div class="grid grid-cols-4 gap-1">
          {#each (["slow", "medium", "fast", "super"] as const) as preset}
            <button
              onclick={() => (algorithm.speedPreset = preset)}
              title={SPEED_PRESET_LABELS[preset].desc}
              class={`cursor-pointer rounded px-1 py-1 text-center text-[11px] font-bold uppercase transition-colors ${
                algorithm.speedPreset === preset
                  ? "bg-iris text-canvas"
                  : "bg-surface-elevated text-content-secondary hover:text-content-primary hover:bg-surface-elevated/80"
              }`}
            >
              {SPEED_PRESET_LABELS[preset].name}
            </button>
          {/each}
        </div>
      </div>

      <!-- Movement Mode -->
      <span class="mt-1 text-[11px] font-bold text-content-secondary uppercase">Movement Mode</span>
      <div class="grid grid-cols-3 gap-1">
        <button
          onclick={() => (algorithm.movementMode = "normal")}
          class={`cursor-pointer rounded px-1 py-1 text-center text-[11px] font-bold uppercase transition-colors ${algorithm.movementMode === "normal" ? "bg-iris text-canvas" : "bg-surface-elevated text-content-secondary hover:text-content-primary"}`}
        >
          Normal
        </button>
        <button
          onclick={() => (algorithm.movementMode = "smooth")}
          class={`cursor-pointer rounded px-1 py-1 text-center text-[11px] font-bold uppercase transition-colors ${algorithm.movementMode === "smooth" ? "bg-iris text-canvas" : "bg-surface-elevated text-content-secondary hover:text-content-primary"}`}
        >
          Smooth
        </button>
        <button
          onclick={() => (algorithm.movementMode = "diagonals")}
          class={`cursor-pointer rounded px-1 py-1 text-center text-[11px] font-bold uppercase transition-colors ${algorithm.movementMode === "diagonals" ? "bg-iris text-canvas" : "bg-surface-elevated text-content-secondary hover:text-content-primary"}`}
        >
          Diagonals
        </button>
      </div>
    </div>

    <!-- 4. Visual Overlays -->
    <div class="flex flex-col gap-1.5 rounded border border-border-default bg-surface-box p-2.5">
      <span class="border-b border-border-default pb-1.5 text-xs font-bold text-iris uppercase tracking-wider">
        Visual Overlays
      </span>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <label class="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            bind:checked={algorithm.showDistances}
            class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-accent bg-transparent checked:bg-iris accent-iris"
          />
          <span class="text-content-secondary">Distances</span>
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            bind:checked={algorithm.showHeatmap}
            class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-accent bg-transparent checked:bg-iris accent-iris"
          />
          <span class="text-content-secondary">Heatmap</span>
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            bind:checked={algorithm.showPath}
            class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-accent bg-transparent checked:bg-iris accent-iris"
          />
          <span class="text-content-secondary">Path Trajectory</span>
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            bind:checked={algorithm.compareAlgorithms}
            class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-border-accent bg-transparent checked:bg-iris accent-iris"
          />
          <span class="text-iris font-bold">Compare Algorithms</span>
        </label>
      </div>
    </div>

    <!-- 5. Performance Metrics Card -->
    <div class="flex flex-col gap-1.5 rounded border border-border-default bg-surface-box p-2.5">
      <div class="flex items-center justify-between border-b border-border-default pb-1.5">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold text-iris uppercase tracking-wider">
            {algorithm.compareAlgorithms ? "Algorithm Comparison" : "Path Metrics"}
          </span>
          <span class="rounded border border-border-default bg-surface-elevated px-1.5 py-0.5 text-[9px] font-bold text-iris uppercase">
            {SPEED_PRESET_LABELS[algorithm.speedPreset]?.name}
          </span>
        </div>
        {#if algorithm.compareAlgorithms}
          <span class="text-[10px] text-seafoam font-bold uppercase">Overlay Active</span>
        {/if}
      </div>

      {#if algorithm.compareAlgorithms && algorithm.comparisonData.timeBased && algorithm.comparisonData.classic}
        <!-- Algorithm Comparison Table (Time-Based vs Classic BFS) -->
        <div class="overflow-x-auto text-[11px]">
          <table class="w-full text-left">
            <thead class="text-[9px] text-content-muted uppercase border-b border-border-default">
              <tr>
                <th class="py-1">Algorithm</th>
                <th class="py-1">Distance</th>
                <th class="py-1">Moves</th>
                <th class="py-1 text-right">Est. Time ({SPEED_PRESET_LABELS[algorithm.speedPreset]?.speed})</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-subtle">
              <tr class="hover:bg-flamingo/10 bg-flamingo/5">
                <td class="py-1 font-bold text-flamingo flex items-center gap-1.5">
                  <span class="inline-block w-2.5 h-1 bg-flamingo rounded-sm"></span>
                  Time-Based ★
                </td>
                <td class="py-1 font-bold text-flamingo">{algorithm.comparisonData.timeBased.distanceMm.toFixed(1)} mm</td>
                <td class="py-1 font-bold text-flamingo">{algorithm.comparisonData.timeBased.movements.length}</td>
                <td class="py-1 text-right font-bold text-flamingo">{algorithm.comparisonData.timeBased.estimatedTimeS.toFixed(3)} s</td>
              </tr>
              <tr class="hover:bg-seafoam/10">
                <td class="py-1 font-bold text-seafoam flex items-center gap-1.5">
                  <span class="inline-block w-2.5 h-0.5 border-t-2 border-dashed border-seafoam"></span>
                  Classic BFS
                </td>
                <td class="py-1 text-content-secondary">{algorithm.comparisonData.classic.distanceMm.toFixed(1)} mm</td>
                <td class="py-1 text-content-secondary">{algorithm.comparisonData.classic.movements.length}</td>
                <td class="py-1 text-right font-bold text-content-secondary">{algorithm.comparisonData.classic.estimatedTimeS.toFixed(3)} s</td>
              </tr>
            </tbody>
          </table>
        </div>
      {:else}
        <!-- Single Mode Card -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="flex flex-col">
            <span class="text-[10px] text-content-muted uppercase">Est. Run Time ({SPEED_PRESET_LABELS[algorithm.speedPreset]?.speed})</span>
            <span class="text-sm font-bold text-seafoam">
              {algorithm.estimatedTimeS.toFixed(3)} s
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-content-muted uppercase">Trajectory Dist</span>
            <span class="text-sm font-bold text-iris">
              {algorithm.totalDistanceMm.toFixed(1)} mm
            </span>
          </div>
        </div>

        <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-content-secondary border-t border-border-default pt-1.5">
          <span>Steps: <strong class="text-content-primary">{algorithm.pathStepCount}</strong></span>
          <span>Forwards: <strong class="text-content-primary">{algorithm.turnBreakdown.forwards}</strong></span>
          <span>90° Turns: <strong class="text-content-primary">{algorithm.turnBreakdown.turns90}</strong></span>
          <span>180° Turns: <strong class="text-content-primary">{algorithm.turnBreakdown.turns180}</strong></span>
          <span>45° Turns: <strong class="text-content-primary">{algorithm.turnBreakdown.turns45}</strong></span>
          <span>Diagonals: <strong class="text-seafoam">{algorithm.turnBreakdown.diagonals}</strong></span>
        </div>
      {/if}
    </div>

    <!-- 6. Movement Sequence -->
    <div class="flex flex-col gap-1.5 rounded border border-border-default bg-surface-box p-2.5">
      <div class="flex items-center justify-between border-b border-border-default pb-1.5">
        <span class="text-xs font-bold text-iris uppercase tracking-wider">
          Movements ({algorithm.movements.length})
        </span>
      </div>

      <!-- Color Legend -->
      <div class="flex flex-wrap gap-1.5 text-[9px] py-1 border-b border-border-subtle">
        <span class="inline-flex items-center gap-1 text-seafoam">
          <span class="w-2 h-2 rounded-full bg-seafoam"></span> Fwd
        </span>
        <span class="inline-flex items-center gap-1 text-iris">
          <span class="w-2 h-2 rounded-full bg-iris"></span> Diag
        </span>
        <span class="inline-flex items-center gap-1 text-amber-soft">
          <span class="w-2 h-2 rounded-full bg-amber-soft"></span> 90°
        </span>
        <span class="inline-flex items-center gap-1 text-flamingo">
          <span class="w-2 h-2 rounded-full bg-flamingo"></span> 180°
        </span>
        <span class="inline-flex items-center gap-1 text-glacial">
          <span class="w-2 h-2 rounded-full bg-glacial"></span> 45°
        </span>
      </div>

      <!-- Scrollable Movements Table with Custom Scrollbar -->
      <div
        bind:this={tableContainer}
        class="custom-movements-scrollbar max-h-56 overflow-y-auto text-xs font-mono rounded pr-1"
      >
        <table class="w-full text-left">
          <thead class="sticky top-0 bg-surface-elevated text-[10px] text-content-muted uppercase z-10 border-b border-border-default">
            <tr>
              <th class="py-1 px-1">#</th>
              <th class="py-1">Command</th>
              <th class="py-1 text-right px-1">Count</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            {#each algorithm.movements as move, i}
              {@const isSelected = algorithm.selectedMovementIndex === i}
              <tr
                data-movement={i}
                class="cursor-pointer transition-colors {isSelected ? 'bg-iris/20 text-content-primary font-bold' : 'hover:bg-iris/10 text-content-secondary'}"
                onmouseenter={() => (algorithm.selectedMovementIndex = i)}
                onmouseleave={() => {
                  if (algorithm.selectedMovementIndex === i) algorithm.selectedMovementIndex = null;
                }}
                onclick={() => {
                  algorithm.selectedMovementIndex = algorithm.selectedMovementIndex === i ? null : i;
                }}
              >
                <td class="py-1 px-1 text-content-muted">
                  {i + 1}
                </td>
                <td
                  class="py-1 font-bold"
                  style="color: {move.color};"
                >
                  {move.name}
                </td>
                <td class="py-1 text-right px-1 text-content-primary font-bold">{move.count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-border-default bg-surface-box/50 p-6 text-center text-content-muted">
      <span class="icon-[material-symbols--info-outline] text-3xl text-iris/30"></span>
      <p class="text-xs text-content-secondary">
        Click <strong class="text-iris font-semibold">"Load Algorithm WASM"</strong> above to load <code class="text-content-muted">fujin_algorithms.wasm</code> and start visualizing.
      </p>
    </div>
  {/if}
</div>

<Modal bind:open={vaultOpen} title="Vault Mazes" items={mazeNames} onselect={loadVaultMaze}></Modal>

<style>
  .custom-movements-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(168, 174, 232, 0.45) #0b1218;
  }
  .custom-movements-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-movements-scrollbar::-webkit-scrollbar-track {
    background: #0b1218;
    border-radius: 4px;
  }
  .custom-movements-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(168, 174, 232, 0.45);
    border-radius: 4px;
  }
  .custom-movements-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(168, 174, 232, 0.85);
  }
</style>
