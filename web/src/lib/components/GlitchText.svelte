<script lang="ts">
	let { text = 'ROBOTICS' } = $props();
</script>

<h1 class="relative font-mono text-4xl font-bold tracking-tighter text-white uppercase sm:text-6xl group">
	<span class="relative z-10 block">{text}</span>
	<span
		class="absolute top-0 left-0 -z-10 block w-full text-violet-500 opacity-0 transition-opacity duration-100 group-hover:opacity-70 group-hover:translate-x-[2px] group-hover:translate-y-[-2px] motion-safe:animate-pulse"
		aria-hidden="true">{text}</span
	>
	<span
		class="absolute top-0 left-0 -z-10 block w-full text-cyan-500 opacity-0 transition-opacity duration-100 group-hover:opacity-70 group-hover:translate-x-[-2px] group-hover:translate-y-[2px] motion-safe:animate-pulse"
		aria-hidden="true">{text}</span
	>
</h1>
