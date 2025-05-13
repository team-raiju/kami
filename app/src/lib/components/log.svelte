<script lang="ts">
  import { entries } from "$lib/log.svelte";
  import { Bug, Info, Warning } from "phosphor-svelte";
  import { showLog } from "./show-log.svelte";
</script>

{#if showLog().showLog}
  <div class="absolute inset-0 z-100 backdrop-blur-md" onclick={showLog().toggle} aria-hidden="true">
    <div
      onclick={(event) => event.stopPropagation()}
      aria-hidden="true"
      class="absolute top-15 right-8 bottom-15 left-8 z-110 flex flex-col overflow-auto rounded-2xl bg-gray-600 text-white"
    >
      {#each entries as entry}
        <div class="flex flex-row items-center border-b border-b-white/50">
          <div class="p-3">
            {#if entry.type == "debug"}
              <Bug color="var(--color-slate-300)" />
            {:else if entry.type == "info"}
              <Info color="var(--color-blue-400)" />
            {:else if entry.type == "warn"}
              <Warning color="var(--color-yellow-400)" />
            {:else if entry.type == "error"}
              <Warning color="var(--color-red-400)" />
            {/if}
          </div>
          <div>
            {entry.text}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
