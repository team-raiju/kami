<script lang="ts">
  import { log } from "$lib/state/logsState.svelte";
  import { track } from "$lib/state/trackState.svelte";
  import { movingAverage, autoShortcut, type PathConfig } from "$lib/utils/trackUtils";

  let k = $state(10);

  let windowLarge = $state(20);
  let windowSmall = $state(10);
  let sharpAngleThPi = $state(0.3);
  let angleLookahead = $state(10);
  let cornerPadding = $state(10);
  let isCalculating = $state(false);

  function decrementK() {
    if (k > 2) k -= 2;
  }

  function incrementK() {
    k += 2;
  }

  function handleClearShortcut() {
    track.setShortcutPoints([]);
  }

  function handleMovingAverage() {
    const result = movingAverage(track.state.points, k);
    track.setShortcutPoints(result);
  }

  async function handleDijkstraShortcut() {
    if (isCalculating) return;
    isCalculating = true;

    await new Promise((r) => setTimeout(r, 0));

    const pathConfig: PathConfig = {
      window_large: windowLarge,
      window_small: windowSmall,
      sharp_angle_th: sharpAngleThPi * Math.PI,
      angle_lookahead: angleLookahead,
      corner_padding: cornerPadding,
    };
    try {
      const result = autoShortcut(track.state.points, pathConfig);
      track.setShortcutPoints(result);
      log.info(`Dijkstra shortcut: ${result.length} points`);
    } finally {
      isCalculating = false;
    }
  }

  async function handleLogRead() {
    log.error("USB/BT NYI");
  }

  async function handleTrackExport() {
    const points = track.state.points;
    if (points.length === 0) {
      log.error("No track to export");
      return;
    }

    const content = points.map((p) => `${p.x.toFixed(6)},${p.y.toFixed(6)}`).join("\n");
    await navigator.clipboard.writeText(content);
    log.info("Track copied to clipboard");
  }

  async function handleTrackImport() {
    try {
      const [handle] = await window.showOpenFilePicker({
        excludeAcceptAllOption: true,
        types: [
          {
            accept: { "text/plain": [".txt", ".csv"] },
            description: "Track File",
          },
        ],
        multiple: false,
      });
      const file = await handle.getFile();
      const content = await file.text();

      if (!content) {
        log.error("Failed to read track file");
        return;
      }

      handleClearShortcut();
      track.load(content);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        log.error("Failed to open track file");
        console.error(err);
      }
    }
  }
</script>

<div class="grid grid-cols-2 gap-2 p-2">
  <div class="col-span-2 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Calculate Shortcut</div>
  <button onclick={handleMovingAverage} class="cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20">
    Moving Average
  </button>
  <div class="flex flex-row items-center gap-1">
    <span class="text-sm text-amber-500">Window:</span>
    <button onclick={decrementK} class="cursor-pointer rounded bg-amber-500/5 px-2 py-1 text-amber-500 hover:bg-amber-500/20"> &lt; </button>
    <span class="min-w-[2ch] text-center text-amber-500">{k}</span>
    <button onclick={incrementK} class="cursor-pointer rounded bg-amber-500/5 px-2 py-1 text-amber-500 hover:bg-amber-500/20"> &gt; </button>
    <span class="mx-1 h-4 w-px bg-amber-500/50"></span>
    <button onclick={handleClearShortcut} class="cursor-pointer rounded bg-amber-500/5 px-2 py-1 text-amber-500 hover:bg-amber-500/20" title="Clear">
      &#x2205;
    </button>
  </div>
</div>
<div class="mt grid grid-cols-2 gap-2 p-2">
  <div class="col-span-2 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">
    Dijkstra Shortcut {isCalculating ? "(calculating...)" : ""}
  </div>
  <button
    onclick={handleDijkstraShortcut}
    class="col-span-2 cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20 disabled:opacity-50"
    disabled={isCalculating}
  >
    {isCalculating ? "..." : "Calculate"}
  </button>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-amber-500">WL:</span>
    <button
      onclick={() => (windowLarge = Math.max(2, windowLarge - 2))}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-amber-500">{windowLarge}</span>
    <button
      onclick={() => (windowLarge += 2)}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-amber-500">WS:</span>
    <button
      onclick={() => (windowSmall = Math.max(2, windowSmall - 2))}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-amber-500">{windowSmall}</span>
    <button
      onclick={() => (windowSmall += 2)}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-amber-500">Th:</span>
    <button
      onclick={() => (sharpAngleThPi = Math.max(0.05, sharpAngleThPi - 0.05))}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-amber-500">{sharpAngleThPi.toFixed(2)}π</span>
    <button
      onclick={() => (sharpAngleThPi += 0.05)}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-amber-500">LA:</span>
    <button
      onclick={() => (angleLookahead = Math.max(1, angleLookahead - 1))}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-amber-500">{angleLookahead}</span>
    <button
      onclick={() => (angleLookahead += 1)}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-amber-500">CP:</span>
    <button
      onclick={() => (cornerPadding = Math.max(0, cornerPadding - 1))}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-amber-500">{cornerPadding}</span>
    <button
      onclick={() => (cornerPadding += 1)}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500 disabled:opacity-50"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
</div>
<div class="mt-auto grid grid-cols-2 gap-2 p-2">
  <div class="col-span-2 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Robot Logs</div>
  <button onclick={handleLogRead} class="w-full cursor-not-allowed bg-amber-500/7 px-2 py-1 text-center text-amber-500 uppercase" disabled>
    Read
  </button>
  <button class="w-full cursor-not-allowed bg-amber-500/7 px-2 py-1 text-center text-amber-500 uppercase" disabled> Import </button>
</div>
<div class="mt grid grid-cols-3 gap-2 p-2">
  <div class="col-span-3 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Track</div>
  <button class="w-full cursor-not-allowed bg-amber-500/7 px-2 py-1 text-center text-amber-500 uppercase" disabled> Read </button>
  <button
    onclick={handleTrackExport}
    class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
  >
    Export
  </button>
  <button
    onclick={handleTrackImport}
    class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
  >
    Import
  </button>
</div>
