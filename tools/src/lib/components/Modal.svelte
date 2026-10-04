<script lang="ts">
  let { open = $bindable(false), title = "", items = [], onselect }: {
    open: boolean;
    title: string;
    items: string[];
    onselect: (item: string) => void;
  } = $props();

  function handleSelect(item: string) {
    onselect(item);
    open = false;
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      open = false;
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-sm"
    onclick={handleBackdropClick}
  >
    <div class="max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg border border-border-default bg-surface-box shadow-2xl font-mono">
      <div class="flex items-center justify-between border-b border-border-default bg-surface-elevated/40 px-4 py-2.5">
        <span class="text-xs font-bold text-iris uppercase tracking-wider">{title}</span>
        <button
          onclick={() => (open = false)}
          class="cursor-pointer px-2 text-content-secondary hover:text-iris transition-colors"
        >
          ✕
        </button>
      </div>
      <div class="scroll-iris max-h-[60vh] overflow-y-auto p-2">
        {#each items as item}
          <button
            onclick={() => handleSelect(item)}
            class="w-full cursor-pointer px-3 py-2 text-left text-xs text-content-primary hover:bg-iris/10 hover:text-iris rounded transition-colors"
          >
            {item}
          </button>
        {:else}
          <div class="p-4 text-center text-xs text-content-muted">No items</div>
        {/each}
      </div>
    </div>
  </div>
{/if}