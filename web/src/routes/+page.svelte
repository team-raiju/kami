<script lang="ts">
	import GlitchText from '$lib/components/GlitchText.svelte';
	import GridBackground from '$lib/components/GridBackground.svelte';
	import RobotMonolith from '$lib/components/RobotMonolith.svelte';

	const robots = [
		{
			id: 'tank',
			name: 'Titan MK-IV',
			type: 'HEAVY ASSAULT',
			color: 'violet',
			specs: [
				{ label: 'ARMOR', value: 'Composite-X' },
				{ label: 'SPEED', value: '4.2 m/s' },
				{ label: 'PAYLOAD', value: '80kg' }
			],
			icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12h20"></path>
                <path d="M5 12v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"></path>
                <path d="M4 16h16a2 2 0 0 1 2 2v2H2v-2a2 2 0 0 1 2-2z"></path>
                <circle cx="7" cy="18" r="1"></circle>
                <circle cx="17" cy="18" r="1"></circle>
                <path d="M12 6V3"></path>
                <rect x="10" y="1" width="4" height="2"></rect>
            </svg>`
		},
		{
			id: 'drone',
			name: 'Wraith X1',
			type: 'AERIAL RECON',
			color: 'cyan',
			specs: [
				{ label: 'RANGE', value: '5km' },
				{ label: 'ALTITUDE', value: '300m' },
				{ label: 'OPTICS', value: 'Thermal/IR' }
			],
			icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`
		},
		{
			id: 'arm',
			name: 'Atlas Arm',
			type: 'PRECISION LOGISTICS',
			color: 'emerald',
			specs: [
				{ label: 'REACH', value: '2.5m' },
				{ label: 'PRECISION', value: '0.5mm' },
				{ label: 'LIFT', value: '15kg' }
			],
			icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M12 14v4"></path>
                <path d="M12 10V6"></path>
                <path d="M12 6a2 2 0 0 1 2-2h4"></path>
                <path d="M12 18a2 2 0 0 0-2 2H6"></path>
                <rect x="18" y="2" width="4" height="4"></rect>
                <rect x="2" y="18" width="4" height="4"></rect>
            </svg>`
		}
	];
</script>

<div class="relative h-screen w-full overflow-hidden bg-black text-white font-grotesk flex flex-col items-center justify-center">
	<GridBackground />

	<div class="relative z-10 w-full h-full max-w-7xl mx-auto px-6 py-8 flex flex-col justify-between">
		
        <!-- Hero Header -->
		<header class="text-center mt-4">
			<div class="mb-2 flex items-center justify-center gap-2">
				<div class="h-1 w-12 bg-violet-500"></div>
				<span class="font-mono text-xs text-violet-500 tracking-[0.3em]">SYSTEM ONLINE</span>
				<div class="h-1 w-12 bg-violet-500"></div>
			</div>
			
			<GlitchText text="NEXUS ROBOTICS" />
			
			<p class="mt-4 font-mono text-sm text-white/50 max-w-md mx-auto">
				Advanced autonomous systems for the modern era. 
				Initializing protocol v4.0.1...
			</p>
		</header>

        <!-- Monolith Grid -->
		<div class="flex-1 flex flex-col gap-6 md:flex-row md:items-center md:justify-center md:perspective-[1000px] w-full">
			{#each robots as robot}
				<div class="contents">
					<RobotMonolith {...robot} />
				</div>
			{/each}
		</div>

        <!-- Footer Decor -->
        <div class="w-full flex justify-between items-end border-t border-white/10 pt-4 font-mono text-xs text-white/50">
            <div class="flex gap-4">
				<a href="https://github.com" target="_blank" rel="noreferrer" class="hover:text-white transition-colors" aria-label="GitHub">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
				</a>
				<a href="https://instagram.com" target="_blank" rel="noreferrer" class="hover:text-white transition-colors" aria-label="Instagram">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-instagram"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
				</a>
			</div>
            <span>Team Raiju &copy; 2026</span>
        </div>
	</div>
</div>
