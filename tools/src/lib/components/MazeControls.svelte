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

<div class="flex flex-col gap-3 p-3 font-mono text-sm">
  <!-- 1. WASM Module Loader Header -->
  <div class="flex flex-col gap-1.5 border border-amber-500/30 bg-amber-500/5 p-2">
    <div class="flex flex-row items-center justify-between">
      <span class="text-xs font-bold text-amber-500 uppercase">Algorithm WASM Module</span>
      {#if algorithm.wasmLoaded}
        <span class="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
          LOADED
        </span>
      {:else}
        <span class="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-400">
          NOT LOADED
        </span>
      {/if}
    </div>

    <div class="truncate text-xs text-gray-400">
      {algorithm.wasmFileName || "Load firmware/build/WASM/fujin_algorithms.wasm"}
    </div>

    <button
      onclick={handleWasmImport}
      class="mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 bg-amber-500 px-3 py-1.5 text-xs font-bold text-black uppercase transition-colors hover:bg-amber-400"
    >
      <span class="icon-[material-symbols--upload-file] text-base"></span>
      {algorithm.wasmLoaded ? "Reload WASM Module" : "Load Algorithm WASM (.wasm)"}
    </button>
  </div>

  <!-- 2. Maze Management -->
  <div class="flex flex-col gap-2 border border-gray-500/20 p-2">
    <div class="flex flex-row items-center justify-between border-b border-gray-500/30 pb-1">
      <span class="text-xs font-bold text-amber-500 uppercase">Maze Layout</span>
      <div class="flex items-center gap-1.5">
        <input
          type="checkbox"
          id="lock-maze"
          bind:checked={maze.state.editLocked}
          class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-amber-500/40 bg-transparent checked:bg-amber-500"
        />
        <label for="lock-maze" class="cursor-pointer text-xs text-gray-400 select-none">Lock</label>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-1.5">
      <button
        onclick={handleMazeImport}
        disabled={maze.state.editLocked}
        class="cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-xs text-amber-500 uppercase hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Import
      </button>
      <button
        onclick={handleMazeExport}
        class="cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-xs text-amber-500 uppercase hover:bg-amber-500/20"
      >
        Export
      </button>
      <button
        onclick={handleMazeRandom}
        disabled={maze.state.editLocked}
        class="cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-xs text-amber-500 uppercase hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Random
      </button>
      <button
        onclick={() => (vaultOpen = true)}
        disabled={maze.state.editLocked}
        class="cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-xs text-amber-500 uppercase hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Vault
      </button>
    </div>

    <!-- Goal line just below maze import buttons -->
    <div class="flex flex-row items-center justify-between border-t border-gray-500/20 pt-1 text-xs">
      <div class="flex items-center gap-2">
        <span class="font-bold text-amber-500 uppercase">Goal</span>
        <span class="text-[11px] text-gray-400">
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
              ? "bg-amber-500 text-black animate-pulse"
              : "text-amber-500 hover:bg-amber-500/20"
          }`}
          title={algorithm.isPickingGoal ? "Cancel picking" : "Pick goal on maze (click cell or 4-cell junction)"}
        >
          <span class="icon-[material-symbols--my-location] block text-base"></span>
        </button>

        <button
          onclick={() => algorithm.setGoal(null)}
          disabled={maze.state.editLocked || algorithm.goalTarget.type === "center"}
          class="cursor-pointer rounded p-1 text-gray-400 hover:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Reset to center goal"
        >
          <span class="icon-[material-symbols--restart-alt] block text-base"></span>
        </button>
      </div>
    </div>
  </div>

  {#if algorithm.wasmLoaded}
    <!-- 3. Algorithm Selector -->
    <div class="flex flex-col gap-2 border border-gray-500/20 p-2">
      <span class="border-b border-gray-500/30 pb-1 text-xs font-bold text-amber-500 uppercase">
        Algorithm
      </span>

      <div class="grid grid-cols-2 gap-1.5">
        <button
          onclick={() => (algorithm.algorithmType = "time_based")}
          class={`cursor-pointer px-2 py-1 text-xs font-bold uppercase transition-colors ${algorithm.algorithmType === "time_based" ? "bg-amber-500 text-black" : "bg-amber-500/10 text-amber-500"}`}
        >
          Time-Based
        </button>

        <button
          onclick={() => (algorithm.algorithmType = "classic")}
          class={`cursor-pointer px-2 py-1 text-xs font-bold uppercase transition-colors ${algorithm.algorithmType === "classic" ? "bg-amber-500 text-black" : "bg-amber-500/10 text-amber-500"}`}
        >
          Classic BFS
        </button>
      </div>

      <!-- Speed Preset Selector -->
      <div class="flex flex-col gap-1 mt-1">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-gray-400 uppercase">Speed Preset</span>
          <span class="text-[10px] text-amber-400 font-medium">
            {SPEED_PRESET_LABELS[algorithm.speedPreset]?.speed}
          </span>
        </div>
        <div class="grid grid-cols-4 gap-1">
          {#each (["slow", "medium", "fast", "super"] as const) as preset}
            <button
              onclick={() => (algorithm.speedPreset = preset)}
              title={SPEED_PRESET_LABELS[preset].desc}
              class={`cursor-pointer px-1 py-1 text-center text-[11px] font-bold uppercase transition-colors ${
                algorithm.speedPreset === preset
                  ? "bg-amber-500 text-black"
                  : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              }`}
            >
              {SPEED_PRESET_LABELS[preset].name}
            </button>
          {/each}
        </div>
      </div>

      <!-- Movement Mode -->
      <span class="mt-1 text-[11px] font-bold text-gray-400 uppercase">Movement Mode</span>
      <div class="grid grid-cols-3 gap-1">
        <button
          onclick={() => (algorithm.movementMode = "normal")}
          class={`cursor-pointer px-1 py-1 text-center text-[11px] font-bold uppercase transition-colors ${algorithm.movementMode === "normal" ? "bg-amber-500 text-black" : "bg-amber-500/10 text-amber-500"}`}
        >
          Normal
        </button>
        <button
          onclick={() => (algorithm.movementMode = "smooth")}
          class={`cursor-pointer px-1 py-1 text-center text-[11px] font-bold uppercase transition-colors ${algorithm.movementMode === "smooth" ? "bg-amber-500 text-black" : "bg-amber-500/10 text-amber-500"}`}
        >
          Smooth
        </button>
        <button
          onclick={() => (algorithm.movementMode = "diagonals")}
          class={`cursor-pointer px-1 py-1 text-center text-[11px] font-bold uppercase transition-colors ${algorithm.movementMode === "diagonals" ? "bg-amber-500 text-black" : "bg-amber-500/10 text-amber-500"}`}
        >
          Diagonals
        </button>
      </div>
    </div>

    <!-- 4. Visual Overlays -->
    <div class="flex flex-col gap-1.5 border border-gray-500/20 p-2">
      <span class="border-b border-gray-500/30 pb-1 text-xs font-bold text-amber-500 uppercase">
        Visual Overlays
      </span>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <label class="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            bind:checked={algorithm.showDistances}
            class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-amber-500/40 bg-transparent checked:bg-amber-500"
          />
          <span class="text-gray-300">Distances</span>
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            bind:checked={algorithm.showHeatmap}
            class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-amber-500/40 bg-transparent checked:bg-amber-500"
          />
          <span class="text-gray-300">Heatmap</span>
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            bind:checked={algorithm.showPath}
            class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-amber-500/40 bg-transparent checked:bg-amber-500"
          />
          <span class="text-gray-300">Path Trajectory</span>
        </label>
        <label class="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            bind:checked={algorithm.compareAlgorithms}
            class="h-3.5 w-3.5 cursor-pointer appearance-none rounded-sm border border-amber-500/40 bg-transparent checked:bg-amber-500"
          />
          <span class="text-amber-400 font-bold">Compare Algorithms</span>
        </label>
      </div>
    </div>

    <!-- 5. Performance Metrics Card -->
    <div class="flex flex-col gap-1.5 border border-amber-500/30 bg-black/60 p-2">
      <div class="flex items-center justify-between border-b border-amber-500/30 pb-1">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold text-amber-500 uppercase">
            {algorithm.compareAlgorithms ? "Algorithm Comparison" : "Path Metrics"}
          </span>
          <span class="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-400 uppercase">
            {SPEED_PRESET_LABELS[algorithm.speedPreset]?.name}
          </span>
        </div>
        {#if algorithm.compareAlgorithms}
          <span class="text-[10px] text-emerald-400 font-bold">Overlay Active</span>
        {/if}
      </div>

      {#if algorithm.compareAlgorithms && algorithm.comparisonData.timeBased && algorithm.comparisonData.classic}
        <!-- Algorithm Comparison Table (Time-Based vs Classic BFS) -->
        <div class="overflow-x-auto text-[11px]">
          <table class="w-full text-left">
            <thead class="text-[9px] text-gray-400 uppercase border-b border-gray-800">
              <tr>
                <th class="py-1">Algorithm</th>
                <th class="py-1">Distance</th>
                <th class="py-1">Moves</th>
                <th class="py-1 text-right">Est. Time ({SPEED_PRESET_LABELS[algorithm.speedPreset]?.speed})</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              <tr class="hover:bg-amber-500/5 bg-amber-500/5">
                <td class="py-1 font-bold text-amber-400 flex items-center gap-1.5">
                  <span class="inline-block w-2.5 h-1 bg-amber-400 rounded-sm"></span>
                  Time-Based ★
                </td>
                <td class="py-1 font-bold text-amber-400">{algorithm.comparisonData.timeBased.distanceMm.toFixed(1)} mm</td>
                <td class="py-1 font-bold text-amber-400">{algorithm.comparisonData.timeBased.movements.length}</td>
                <td class="py-1 text-right font-bold text-amber-400">{algorithm.comparisonData.timeBased.estimatedTimeS.toFixed(3)} s</td>
              </tr>
              <tr class="hover:bg-sky-500/5">
                <td class="py-1 font-bold text-sky-400 flex items-center gap-1.5">
                  <span class="inline-block w-2.5 h-0.5 border-t-2 border-dashed border-sky-400"></span>
                  Classic BFS
                </td>
                <td class="py-1 text-gray-300">{algorithm.comparisonData.classic.distanceMm.toFixed(1)} mm</td>
                <td class="py-1 text-gray-300">{algorithm.comparisonData.classic.movements.length}</td>
                <td class="py-1 text-right font-bold text-gray-300">{algorithm.comparisonData.classic.estimatedTimeS.toFixed(3)} s</td>
              </tr>
            </tbody>
          </table>
        </div>
      {:else}
        <!-- Single Mode Card -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-500 uppercase">Est. Run Time ({SPEED_PRESET_LABELS[algorithm.speedPreset]?.speed})</span>
            <span class="text-sm font-bold text-emerald-400">
              {algorithm.estimatedTimeS.toFixed(3)} s
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-500 uppercase">Trajectory Dist</span>
            <span class="text-sm font-bold text-sky-400">
              {algorithm.totalDistanceMm.toFixed(1)} mm
            </span>
          </div>
        </div>

        <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 border-t border-gray-800 pt-1">
          <span>Steps: <strong class="text-white">{algorithm.pathStepCount}</strong></span>
          <span>Forwards: <strong class="text-white">{algorithm.turnBreakdown.forwards}</strong></span>
          <span>90° Turns: <strong class="text-white">{algorithm.turnBreakdown.turns90}</strong></span>
          <span>180° Turns: <strong class="text-white">{algorithm.turnBreakdown.turns180}</strong></span>
          <span>45° Turns: <strong class="text-white">{algorithm.turnBreakdown.turns45}</strong></span>
          <span>Diagonals: <strong class="text-emerald-400">{algorithm.turnBreakdown.diagonals}</strong></span>
        </div>
      {/if}
    </div>

    <!-- 6. Movement Sequence -->
    <div class="flex flex-col gap-1.5 border border-gray-500/20 p-2">
      <div class="flex items-center justify-between border-b border-gray-500/30 pb-1">
        <span class="text-xs font-bold text-amber-500 uppercase">
          Movements ({algorithm.movements.length})
        </span>
      </div>

      <!-- Color Legend -->
      <div class="flex flex-wrap gap-1 text-[9px] py-1 border-b border-gray-800/80">
        <span class="inline-flex items-center gap-1 text-sky-400">
          <span class="w-2 h-2 rounded-full bg-sky-400"></span> Fwd
        </span>
        <span class="inline-flex items-center gap-1 text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Diag
        </span>
        <span class="inline-flex items-center gap-1 text-amber-400">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span> 90°
        </span>
        <span class="inline-flex items-center gap-1 text-red-400">
          <span class="w-2 h-2 rounded-full bg-red-400"></span> 180°
        </span>
        <span class="inline-flex items-center gap-1 text-pink-400">
          <span class="w-2 h-2 rounded-full bg-pink-400"></span> 45°
        </span>
      </div>

      <!-- Scrollable Movements Table with Custom Scrollbar -->
      <div
        bind:this={tableContainer}
        class="custom-movements-scrollbar max-h-56 overflow-y-auto text-xs font-mono rounded pr-1"
      >
        <table class="w-full text-left">
          <thead class="sticky top-0 bg-black text-[10px] text-gray-500 uppercase z-10">
            <tr>
              <th class="py-1">#</th>
              <th class="py-1">Command</th>
              <th class="py-1 text-right">Count</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            {#each algorithm.movements as move, i}
              {@const isSelected = algorithm.selectedMovementIndex === i}
              <tr
                data-movement={i}
                class="cursor-pointer transition-colors {isSelected ? 'bg-amber-500/20 text-white font-bold' : 'hover:bg-amber-500/10'}"
                onmouseenter={() => (algorithm.selectedMovementIndex = i)}
                onmouseleave={() => {
                  if (algorithm.selectedMovementIndex === i) algorithm.selectedMovementIndex = null;
                }}
                onclick={() => {
                  algorithm.selectedMovementIndex = algorithm.selectedMovementIndex === i ? null : i;
                }}
              >
                <td class="py-1 text-gray-500">
                  {i + 1}
                </td>
                <td
                  class="py-1 font-bold"
                  style="color: {move.color};"
                >
                  {move.name}
                </td>
                <td class="py-1 text-right text-gray-300 font-bold">{move.count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center gap-2 rounded border border-dashed border-gray-700 p-6 text-center text-gray-500">
      <span class="icon-[material-symbols--info-outline] text-3xl text-amber-500/60"></span>
      <p class="text-xs">
        Click <strong class="text-amber-500">"Load Algorithm WASM"</strong> above to load <code class="text-gray-400">fujin_algorithms.wasm</code> and start visualizing.
      </p>
    </div>
  {/if}
</div>

<Modal bind:open={vaultOpen} title="Vault Mazes" items={mazeNames} onselect={loadVaultMaze}></Modal>

<style>
  .custom-movements-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(245, 158, 11, 0.45) #111827;
  }
  .custom-movements-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-movements-scrollbar::-webkit-scrollbar-track {
    background: #111827;
    border-radius: 4px;
  }
  .custom-movements-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(245, 158, 11, 0.45);
    border-radius: 4px;
  }
  .custom-movements-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(245, 158, 11, 0.85);
  }
</style>
