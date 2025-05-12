<script lang="ts">
  import Log from "$lib/components/log.svelte";
  import "../app.css";

  let { children } = $props();
</script>

<div class="mx-auto h-screen max-w-md bg-gray-200">
  <Log />
  {@render children()}
</div>
