<script lang="ts">
  import { format } from "date-fns";
  import { log } from "$lib/logsState.svelte";

  let scrollContainer: HTMLDivElement;

  const errorCount = $derived(log.entries.filter((l) => l.level === "ERROR").length);
  const warnCount = $derived(log.entries.filter((l) => l.level === "WARN").length);

  let { isOtherOpen = false, isOpen = $bindable(false) } = $props();

  $effect(() => {
    if (scrollContainer && log.entries.length) {
      const threshold = 50;
      const userIsAtBottom = scrollContainer.scrollHeight - scrollContainer.clientHeight <= scrollContainer.scrollTop + threshold;

      if (userIsAtBottom) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  });
</script>

<div class="w-full font-mono text-sm text-indigo-500" onclick={() => (isOpen = !isOpen)}>
  <div class="flex flex-row items-center bg-indigo-500/10">
    <span class="inline-block cursor-pointer bg-indigo-500 px-2 py-1 text-xs font-bold text-black uppercase select-none">App Logs</span>
    <div class="ml-auto text-red-500">{errorCount}</div>
    <div class="mr-2 ml-2 text-yellow-500">{warnCount}</div>
  </div>

  <div
    class="scroll-indigo-500 overflow-y-auto border border-gray-500/25 transition-all duration-500 ease-in-out"
    class:max-h-[200px]={isOtherOpen && isOpen}
    class:max-h-[400px]={!isOtherOpen && isOpen}
    class:max-h-0={!isOpen}
    bind:this={scrollContainer}
  >
    <div class="p-2">
      <div class="grid grid-cols-[max-content_max-content_1fr] items-center gap-2 p-2">
        {#each log.entries as entry (entry.timestamp)}
          <span
            class={{
              "border-r border-l-4 border-gray-700 px-2 py-1 text-gray-400": true,
              "border-amber-900 bg-amber-900/20 text-amber-500": entry.level === "WARN",
              "border-red-900 bg-red-900/20 text-red-500": entry.level === "ERROR",
            }}
          >
            {format(entry.timestamp, "HH:mm:ss")}
          </span>
          <span
            class={{
              "border-r border-gray-700 px-2 py-1 text-gray-400": true,
              "bg-amber-900/20 text-amber-500": entry.level === "WARN",
              "bg-red-900/20 text-red-500": entry.level === "ERROR",
            }}
          >
            {entry.level}
          </span>
          <span
            class={{
              "border-r border-gray-700 px-2 py-1 text-gray-400": true,
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
