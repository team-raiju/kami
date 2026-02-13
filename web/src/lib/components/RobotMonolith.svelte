<script lang="ts">
	let { id, name, type, specs, icon, color = 'violet' } = $props();

	let isHovered = $state(false);

	const colorClasses: Record<string, string> = {
		violet: 'border-violet-500 text-violet-500 shadow-violet-500/20 bg-violet-500/10',
		cyan: 'border-cyan-500 text-cyan-500 shadow-cyan-500/20 bg-cyan-500/10',
		emerald: 'border-emerald-500 text-emerald-500 shadow-emerald-500/20 bg-emerald-500/10'
	};

	let accentColor = $derived(colorClasses[color] || colorClasses.violet);
</script>

<a
	href="/robot/{id}"
	class="group relative flex h-full w-full min-w-[300px] flex-col overflow-hidden border border-white/10 bg-black/40 p-6 transition-all duration-500 hover:border-opacity-100 md:w-1/3 {accentColor.split(' ')[0]} backdrop-blur-sm"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<!-- Background Scanlines -->
	<div class="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat opacity-20 mix-blend-overlay"></div>
	
	<!-- Header -->
	<div class="relative z-10 mb-8 flex items-start justify-between border-b border-white/10 pb-4">
		<div>
			<h2 class="font-grotesk text-3xl font-bold uppercase tracking-widest text-white group-hover:text-current transition-colors">
				{name}
			</h2>
			<span class="font-mono text-xs text-white/50 group-hover:text-white/80 transition-colors">
				UNIT_ID: {id.toUpperCase()}_V1
			</span>
		</div>
		<div class="flex flex-col items-end">
			<span class="rounded bg-white/5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur-md border border-white/5">
				{type}
			</span>
			<div class="mt-2 h-1 w-12 bg-white/10 overflow-hidden rounded-full">
				<div class="h-full w-full animate-pulse bg-current opacity-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
			</div>
		</div>
	</div>

	<!-- Main Graphic -->
	<div class="relative z-10 flex grow items-center justify-center py-8">
		<div class="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-500">
			<!-- Schematic Grid -->
			<svg class="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
				<defs>
					<pattern id="grid-{id}" width="10" height="10" patternUnits="userSpaceOnUse">
						<path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.1"/>
					</pattern>
				</defs>
				<rect width="100" height="100" fill="url(#grid-{id})" />
			</svg>
		</div>

		<!-- Robot Icon -->
		<div class="relative h-48 w-48 text-white/20 transition-all duration-500 group-hover:scale-110 group-hover:text-current group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">
			{@html icon}
		</div>
	</div>

	<!-- Specs Overlay (reveals on hover) -->
	<div class="relative z-10 mt-auto transition-all duration-500 opacity-40 group-hover:opacity-100 grayscale group-hover:grayscale-0">
		<div class="mb-4 border-t border-dashed border-white/20 pt-4">
			<div class="flex flex-col">
				<span class="font-mono text-[10px] uppercase text-white/40">Category</span>
				<span class="font-mono text-sm text-white">{type}</span>
			</div>
		</div>
		
		<div class="flex items-center justify-between bg-white/5 px-4 py-3 backdrop-blur-md hover:bg-white/10 transition-colors cursor-pointer group/btn border border-white/5">
			<span class="font-mono text-xs uppercase tracking-widest text-white">More information</span>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform transition-transform group-hover/btn:translate-x-1 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
			</svg>
		</div>
	</div>
</a>

<style>
	/* Custom font classes if Tailwind config isn't loaded yet, though I will add them */
	.font-grotesk { font-family: 'Space Grotesk', sans-serif; }
	.font-mono { font-family: 'JetBrains Mono', monospace; }
</style>
