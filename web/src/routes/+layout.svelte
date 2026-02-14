<script lang="ts">
    import "../app.css";
    import favicon from "$lib/assets/logo.svg";

    let { children } = $props();
</script>

<svelte:head>
    <link rel="preload" as="font" href="/fonts/amanojaku.otf" type="font/otf" crossorigin="anonymous" />
    <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
