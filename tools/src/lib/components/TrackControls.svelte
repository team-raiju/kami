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

<div class="grid grid-cols-2 gap-2 p-2 font-mono text-content-primary">
  <div class="col-span-2 border-b border-b-border-default px-3 text-sm font-bold text-iris uppercase tracking-wider">Track Explorer</div>
  <div class="col-span-2 flex flex-row items-center gap-1">
    <span class="text-xs text-iris font-semibold">Idx:</span>
    <button
      onclick={() => (selectedPointIndex = Math.max(0, selectedPointIndex - 1))}
      class="cursor-pointer rounded bg-iris/10 border border-iris/25 px-1 text-xs text-iris">&lt;</button
    >
    <input
      type="range"
      min="0"
      max={Math.max(0, track.state.points.length - 1)}
      bind:value={selectedPointIndex}
      class="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-surface-elevated accent-iris"
    />
    <button
      onclick={() => (selectedPointIndex = Math.min(track.state.points.length - 1, selectedPointIndex + 1))}
      class="cursor-pointer rounded bg-iris/10 border border-iris/25 px-1 text-xs text-iris">&gt;</button
    >
    <span class="text-xs text-content-secondary">{selectedPointIndex}/{track.state.points.length}</span>
  </div>
  <div class="col-span-2 text-xs text-content-secondary">{selectedPointInfo}</div>
</div>

<div class="grid grid-cols-2 gap-2 p-2 font-mono text-content-primary">
  <div class="col-span-2 border-b border-b-border-default px-3 text-sm font-bold text-iris uppercase tracking-wider">Calculate Shortcut</div>
  <button onclick={handleMovingAverage} class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-iris uppercase hover:bg-iris/20 font-semibold transition-colors">
    Moving Average
  </button>
  <div class="flex flex-row items-center gap-1">
    <span class="text-sm text-iris">Window:</span>
    <button onclick={decrementK} class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-iris hover:bg-iris/20 transition-colors"> &lt; </button>
    <span class="min-w-[2ch] text-center text-iris font-bold">{k}</span>
    <button onclick={incrementK} class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-iris hover:bg-iris/20 transition-colors"> &gt; </button>
    <span class="mx-1 h-4 w-px bg-border-default"></span>
    <button onclick={handleClearShortcut} class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-iris hover:bg-iris/20 transition-colors" title="Clear">
      &#x2205;
    </button>
  </div>
</div>
<div class="mt grid grid-cols-2 gap-2 p-2 font-mono text-content-primary">
  <div class="col-span-2 border-b border-b-border-default px-3 text-sm font-bold text-iris uppercase tracking-wider">
    Dijkstra Shortcut {isCalculating ? "(calculating...)" : ""}
  </div>
  <button
    onclick={handleDijkstraShortcut}
    class="col-span-2 cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-iris uppercase hover:bg-iris/20 font-semibold transition-colors disabled:opacity-40"
    disabled={isCalculating}
  >
    {isCalculating ? "..." : "Calculate"}
  </button>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-iris font-semibold">WL:</span>
    <button
      onclick={() => (windowLarge = Math.max(2, windowLarge - 2))}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-content-secondary font-bold">{windowLarge}</span>
    <button
      onclick={() => (windowLarge += 2)}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-iris font-semibold">WS:</span>
    <button
      onclick={() => (windowSmall = Math.max(2, windowSmall - 2))}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-content-secondary font-bold">{windowSmall}</span>
    <button
      onclick={() => (windowSmall += 2)}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-iris font-semibold">Th:</span>
    <button
      onclick={() => (sharpAngleThPi = Math.max(0.05, sharpAngleThPi - 0.05))}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-content-secondary font-bold">{sharpAngleThPi.toFixed(2)}π</span>
    <button
      onclick={() => (sharpAngleThPi += 0.05)}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-iris font-semibold">LA:</span>
    <button
      onclick={() => (angleLookahead = Math.max(1, angleLookahead - 1))}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-content-secondary font-bold">{angleLookahead}</span>
    <button
      onclick={() => (angleLookahead += 1)}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-iris font-semibold">CP:</span>
    <button
      onclick={() => (cornerPadding = Math.max(0, cornerPadding - 1))}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &lt;
    </button>
    <span class="text-xs text-content-secondary font-bold">{cornerPadding}</span>
    <button
      onclick={() => (cornerPadding += 1)}
      class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-1 text-xs text-iris disabled:opacity-40"
      disabled={isCalculating}
    >
      &gt;
    </button>
  </div>
</div>
<div class="mt grid grid-cols-2 gap-2 p-2 font-mono text-content-primary">
  <div class="col-span-2 border-b border-b-border-default px-3 text-sm font-bold text-iris uppercase tracking-wider">Manual Shortcut</div>
  <button onclick={handleResetShortcut} class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-iris uppercase hover:bg-iris/20 font-semibold transition-colors">
    Reset
  </button>
  <div class="col-span-2 flex flex-row items-center gap-1">
    <span class="text-xs text-iris font-semibold">From:</span>
    <input type="number" bind:value={straightFrom} class="w-12 rounded border border-border-default bg-surface-box px-1 text-xs text-iris" />
    <span class="text-xs text-iris font-semibold">To:</span>
    <input type="number" bind:value={straightTo} class="w-12 rounded border border-border-default bg-surface-box px-1 text-xs text-iris" />
    <button onclick={handleStraighten} class="cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-xs text-iris uppercase hover:bg-iris/20 font-semibold transition-colors">
      Straighten
    </button>
  </div>
</div>
<div class="mt-auto grid grid-cols-2 gap-2 p-2 font-mono text-content-primary">
  <div class="col-span-2 border-b border-b-border-default px-3 text-sm font-bold text-iris uppercase tracking-wider">Robot Logs</div>
  <button onclick={handleLogRead} class="w-full cursor-not-allowed rounded border border-border-default bg-surface-box/50 px-2 py-1 text-center text-content-muted uppercase text-xs" disabled>
    Read
  </button>
  <button class="w-full cursor-not-allowed rounded border border-border-default bg-surface-box/50 px-2 py-1 text-center text-content-muted uppercase text-xs" disabled> Import </button>
</div>
<div class="mt grid grid-cols-3 gap-2 p-2 font-mono text-content-primary">
  <div class="col-span-3 border-b border-b-border-default px-3 text-sm font-bold text-iris uppercase tracking-wider">Track</div>
  <button
    onclick={handleTrackImport}
    class="w-full cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-xs text-iris uppercase hover:bg-iris/20 font-semibold transition-colors"
  >
    Import
  </button>
  <button
    onclick={handleTrackExport}
    class="w-full cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-xs text-iris uppercase hover:bg-iris/20 font-semibold transition-colors"
  >
    Export
  </button>
  <button
    onclick={handleShortcutExport}
    class="w-full cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-xs text-iris uppercase hover:bg-iris/20 font-semibold transition-colors"
  >
    Export SC
  </button>
  <button
    onclick={serial.readTrack}
    class="w-full cursor-not-allowed rounded border border-border-default bg-surface-box/50 px-2 py-1 text-center text-xs text-content-muted uppercase"
    disabled={!serial.connected}
  >
    Read
  </button>
  <button class="w-full cursor-not-allowed rounded border border-border-default bg-surface-box/50 px-2 py-1 text-center text-xs text-content-muted uppercase" disabled={!serial.connected}>
    Write SC
  </button>
  <button
    onclick={() => (vaultOpen = true)}
    class="w-full cursor-pointer rounded border border-iris/25 bg-iris/10 px-2 py-1 text-center text-xs text-iris uppercase hover:bg-iris/20 font-semibold transition-colors"
  >
    Vault
  </button>
</div>

<Modal bind:open={vaultOpen} title="Vault" items={trackNames} onselect={loadVaultTrack}></Modal>
