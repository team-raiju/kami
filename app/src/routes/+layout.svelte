<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<div class="mx-auto h-screen max-w-md bg-gray-200">
  {@render children()}
</div>
