<script lang="ts">
  import { format } from "date-fns";
  import { log } from "$lib/state/logsState.svelte";

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

<div class="w-full font-mono text-sm text-content-primary" onclick={() => (isOpen = !isOpen)}>
  <div class="flex flex-row items-center border border-border-default bg-surface-elevated/40">
    <span class="inline-block cursor-pointer bg-iris px-2.5 py-1 text-xs font-bold text-canvas uppercase tracking-wider select-none">App Logs</span>
    <div class="ml-auto text-flamingo text-xs font-bold">{errorCount}</div>
    <div class="mr-3 ml-2 text-amber-soft text-xs font-bold">{warnCount}</div>
  </div>

  <div
    class="scroll-iris overflow-y-auto border-x border-b border-border-default bg-surface-box transition-all duration-500 ease-in-out"
    class:max-h-[200px]={isOtherOpen && isOpen}
    class:max-h-[400px]={!isOtherOpen && isOpen}
    class:max-h-0={!isOpen}
    bind:this={scrollContainer}
  >
    <div class="p-2">
      <div class="grid grid-cols-[max-content_max-content_1fr] items-center gap-1.5 p-1 text-xs">
        {#each log.entries as entry (entry.timestamp)}
          <span
            class={{
              "border-r border-l-2 border-border-default px-2 py-1 text-content-muted font-mono": true,
              "border-amber-soft/50 bg-amber-soft/10 text-amber-soft": entry.level === "WARN",
              "border-flamingo/50 bg-flamingo/10 text-flamingo": entry.level === "ERROR",
            }}
          >
            {format(entry.timestamp, "HH:mm:ss")}
          </span>
          <span
            class={{
              "border-r border-border-default px-2 py-1 text-content-secondary font-bold": true,
              "bg-amber-soft/10 text-amber-soft": entry.level === "WARN",
              "bg-flamingo/10 text-flamingo": entry.level === "ERROR",
            }}
          >
            {entry.level}
          </span>
          <span
            class={{
              "px-2 py-1 text-content-primary": true,
              "bg-amber-soft/10 text-amber-soft": entry.level === "WARN",
              "bg-flamingo/10 text-flamingo": entry.level === "ERROR",
            }}
          >
            {entry.message}
          </span>
        {/each}
      </div>
    </div>
  </div>
</div>
