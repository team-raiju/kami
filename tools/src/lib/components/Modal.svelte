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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onclick={handleBackdropClick}
  >
    <div class="max-h-[80vh] w-full max-w-md overflow-hidden rounded-lg border border-amber-500/50 bg-gray-900">
      <div class="flex items-center justify-between border-b border-amber-500/50 px-3 py-2">
        <span class="font-bold text-amber-500 uppercase">{title}</span>
        <button
          onclick={() => (open = false)}
          class="cursor-pointer px-2 text-amber-500 hover:text-amber-400"
        >
          ✕
        </button>
      </div>
      <div class="max-h-[60vh] overflow-y-auto p-2">
        {#each items as item}
          <button
            onclick={() => handleSelect(item)}
            class="w-full cursor-pointer px-3 py-2 text-left text-amber-500 hover:bg-amber-500/10"
          >
            {item}
          </button>
        {:else}
          <div class="p-2 text-center text-amber-500/50">No items</div>
        {/each}
      </div>
    </div>
  </div>
{/if}