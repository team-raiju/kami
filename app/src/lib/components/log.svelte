<script lang="ts">
  import { entries } from "$lib/log.svelte";
  import { Bug, Info, Warning } from "phosphor-svelte";
  import { showLog } from "./show-log.svelte";
</script>

{#if showLog().showLog}
  <div class="absolute inset-0 z-100 backdrop-blur-md" onclick={showLog().toggle}>
    <div
      onclick={(event) => event.stopPropagation()}
      class="absolute top-15 right-8 bottom-15 left-8 z-110 flex flex-col overflow-auto rounded-2xl bg-gray-600 text-white"
    >
      {#each entries as entry}
        <div class="flex flex-row items-center border-b border-b-white/50">
          <div class="p-3">
            {#if entry.type == "debug"}
              <Bug class="text-slate-300" />
            {:else if entry.type == "info"}
              <Info class="text-blue-400" />
            {:else if entry.type == "warn"}
              <Warning class="text-yellow-400" />
            {:else if entry.type == "error"}
              <Warning class="text-red-400" />
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
