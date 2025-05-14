<script lang="ts">
  import { Button } from "bits-ui";
  import { newErrorState, showLog } from "./log-state.svelte";
  import { Log } from "phosphor-svelte";
</script>

<Button.Root
  onclick={() => {
    newErrorState().clear();
    showLog().toggle();
  }}
  class="relative"
>
  {#if newErrorState().hasNewError || newErrorState().hasNewWarning}
    <div class={`absolute -top-1 -right-1 size-2 rounded-full ${newErrorState().hasNewError ? "bg-red-600" : "bg-yellow-600"}`}></div>
  {/if}
  <Log />
</Button.Root>
