<script lang="ts">
  import { Button } from "bits-ui";
  import { showLog } from "./show-log.svelte";
  import { Log } from "phosphor-svelte";
</script>

<Button.Root onclick={showLog().toggle}>
  <Log />
</Button.Root>
