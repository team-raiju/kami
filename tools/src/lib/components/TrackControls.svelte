<script lang="ts">
  import { log } from "$lib/logsState.svelte";
  import { track } from "$lib/trackState.svelte";

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
