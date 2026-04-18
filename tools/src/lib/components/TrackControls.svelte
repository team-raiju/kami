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

  function handleDijkstraShortcut() {
    const pathConfig: PathConfig = {
      window_large: windowLarge,
      window_small: windowSmall,
      sharp_angle_th: sharpAngleThPi * Math.PI,
      angle_lookahead: angleLookahead,
      corner_padding: cornerPadding,
    };
    const result = autoShortcut(track.state.points, pathConfig);
    track.setShortcutPoints(result);
    log.info(`Dijkstra shortcut: ${result.length} points`);
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

      track.load(content);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        log.error("Failed to open track file");
        console.error(err);
      }
    }
  }
</script>

{#snippet numBtn(label: string, val: any, onDec: () => void, onInc: () => void)}
  <div class="col-span-1 flex flex-row items-center gap-1">
    <span class="text-xs text-amber-500">{label}</span>
    <button onclick={onDec} class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500">&lt;</button>
    <span class="text-xs text-amber-500">{val}</span>
    <button onclick={onInc} class="cursor-pointer rounded bg-amber-500/5 px-1 text-xs text-amber-500">&gt;</button>
  </div>
{/snippet}

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
  <div class="col-span-2 border-b border-b-amber-500/50 px-3 text-sm font-bold text-amber-500 uppercase">Dijkstra Shortcut</div>
  <button
    onclick={handleDijkstraShortcut}
    class="col-span-2 cursor-pointer bg-amber-500/10 px-2 py-1 text-center text-amber-500 uppercase hover:bg-amber-500/20"
  >
    Calculate
  </button>
  {@render numBtn(
    "WL:",
    windowLarge,
    () => (windowLarge = Math.max(2, windowLarge - 2)),
    () => (windowLarge += 2),
  )}
  {@render numBtn(
    "WS:",
    windowSmall,
    () => (windowSmall = Math.max(2, windowSmall - 2)),
    () => (windowSmall += 2),
  )}
  {@render numBtn(
    "Th:",
    sharpAngleThPi.toFixed(2) + "π",
    () => (sharpAngleThPi = Math.max(0.05, sharpAngleThPi - 0.05)),
    () => (sharpAngleThPi += 0.05),
  )}
  {@render numBtn(
    "LA:",
    angleLookahead,
    () => (angleLookahead = Math.max(1, angleLookahead - 1)),
    () => (angleLookahead += 1),
  )}
  {@render numBtn(
    "CP:",
    cornerPadding,
    () => (cornerPadding = Math.max(0, cornerPadding - 1)),
    () => (cornerPadding += 1),
  )}
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
