<script lang="ts">
  import { log } from "$lib/state/logsState.svelte";
  import { serial } from "$lib/state/serialState.svelte";
  import { track } from "$lib/state/trackState.svelte";
  import { movingAverage, autoShortcut, type PathConfig } from "$lib/utils/trackUtils";
  import Modal from "./Modal.svelte";

  const trackFiles = import.meta.glob("/static/tracks/*.txt");
  const trackNames = Object.keys(trackFiles).map((path) => path.split("/").pop()?.replace(".txt", "") ?? path);

  let vaultOpen = $state(false);

  async function loadVaultTrack(name: string) {
    const data = await fetch(`/tracks/${name}.txt`);
    const content = await data.text();
    handleClearShortcut();
    track.load(content);
    log.info(`Loaded: ${name}`);
  }

  let k = $state(10);

  let straightFrom = $state(0);
  let straightTo = $state(0);

  let windowLarge = $state(20);
  let windowSmall = $state(10);
  let sharpAngleThPi = $state(0.3);
  let angleLookahead = $state(10);
  let cornerPadding = $state(10);
  let isCalculating = $state(false);
  let selectedPointIndex = $state(track.state.selectedPointIndex);
  let selectedPointInfo = $derived.by(() => {
    const points = track.state.points;
    if (points.length === 0) return "No points";
    const idx = selectedPointIndex;
    if (idx < 0 || idx >= points.length) return "Index out of range";
    const p = points[idx];
    return `(${idx}) x:${p.x.toFixed(4)}, y:${p.y.toFixed(4)}`;
  });

  $effect(() => {
    track.state.selectedPointIndex = selectedPointIndex;
  });

  function decrementK() {
    if (k > 2) k -= 2;
  }

  function incrementK() {
    k += 2;
  }

  function handleClearShortcut() {
    track.setShortcutPoints([]);
  }

  function handleResetShortcut() {
    track.setShortcutPoints([...track.state.points]);
    log.info("Shortcut reset to track");
  }

  function handleStraighten() {
    const shortcut = track.state.shortcutPoints;
    const from = Math.max(0, Math.min(straightFrom, straightTo));
    const to = Math.min(shortcut.length - 1, Math.max(straightFrom, straightTo));

    if (to - from < 2) {
      log.error("Range too small");
      return;
    }

    const pStart = shortcut[from];
    const pEnd = shortcut[to];

    const newShortcut = [...shortcut];
    for (let i = from + 1; i < to; i++) {
      const t = i - from;
      newShortcut[i] = {
        x: pStart.x + (pEnd.x - pStart.x) * (t / (to - from)),
        y: pStart.y + (pEnd.y - pStart.y) * (t / (to - from)),
      };
    }

    track.setShortcutPoints(newShortcut);
    log.info(`Straightened ${from}-${to}`);
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

  async function handleShortcutExport() {
    const points = track.state.shortcutPoints;
    if (points.length === 0) {
      log.error("No shortcut to export");
      return;
    }

    const content = points.map((p) => `${p.x.toFixed(6)},${p.y.toFixed(6)}`).join("\n");
    await navigator.clipboard.writeText(content);
    log.info("Shortcut copied to clipboard");
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
  <div class="col-span-2 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Track Explorer</div>
  <div class="col-span-2 flex flex-row items-center gap-1">
    <span class="text-xs text-amber-500">Idx:</span>
    <button
      onclick={() => (selectedPointIndex = Math.max(0, selectedPointIndex - 1))}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500">&lt;</button
    >
    <input
      type="range"
      min="0"
      max={Math.max(0, track.state.points.length - 1)}
      bind:value={selectedPointIndex}
      class="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-amber-500/30 accent-amber-500"
    />
    <button
      onclick={() => (selectedPointIndex = Math.min(track.state.points.length - 1, selectedPointIndex + 1))}
      class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500">&gt;</button
    >
    <span class="text-xs text-amber-500">{selectedPointIndex}/{track.state.points.length}</span>
  </div>
  <div class="col-span-2 text-xs text-amber-500">{selectedPointInfo}</div>
</div>

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
<div class="mt grid grid-cols-2 gap-2 p-2">
  <div class="col-span-2 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Manual Shortcut</div>
  <button onclick={handleResetShortcut} class="cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20">
    Reset
  </button>
  <div class="col-span-2 flex flex-row items-center gap-1">
    <span class="text-xs text-amber-500">From:</span>
    <input type="number" bind:value={straightFrom} class="w-12 bg-amber-500/10 px-1 text-xs text-amber-500" />
    <span class="text-xs text-amber-500">To:</span>
    <input type="number" bind:value={straightTo} class="w-12 bg-amber-500/10 px-1 text-xs text-amber-500" />
    <button onclick={handleStraighten} class="cursor-pointer bg-amber-500/10 px-2 py-1 text-xs text-amber-500 uppercase hover:bg-amber-500/20">
      Straighten
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
  <button
    onclick={handleTrackImport}
    class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
  >
    Import
  </button>
  <button
    onclick={handleTrackExport}
    class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
  >
    Export
  </button>
  <button
    onclick={handleShortcutExport}
    class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
  >
    Export SC
  </button>
  <button
    onclick={serial.readTrack}
    class="w-full cursor-not-allowed bg-amber-500/7 px-2 py-1 text-center text-amber-500 uppercase"
    disabled={!serial.connected}
  >
    Read
  </button>
  <button class="w-full cursor-not-allowed bg-amber-500/7 px-2 py-1 text-center text-amber-500 uppercase" disabled={!serial.connected}>
    Write SC
  </button>
  <button
    onclick={() => (vaultOpen = true)}
    class="w-full cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
  >
    Vault
  </button>
</div>

<Modal bind:open={vaultOpen} title="Vault" items={trackNames} onselect={loadVaultTrack}></Modal>
