<script lang="ts">
    import { page } from '$app/stores';
    import GridBackground from '$lib/components/GridBackground.svelte';

    // In a real app, you would load data based on page.params.id
    let robotId = $derived($page.params.id);
</script>

<div class="relative min-h-screen w-full overflow-hidden bg-black text-white font-grotesk flex flex-col">
    <GridBackground />

    <div class="container relative z-10 mx-auto px-4 py-12 flex-grow flex flex-col">
        <header class="mb-8 border-b border-white/10 pb-4">
            <a href="/" class="group inline-flex items-center gap-2 font-mono text-xs uppercase text-violet-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M15 19l-7-7 7-7" />
                </svg>
                Return to Nexus
            </a>
        </header>

        <main class="flex-grow flex items-center justify-center">
            <div class="max-w-4xl w-full border border-white/10 bg-white/5 p-8 backdrop-blur-md relative overflow-hidden">
                <div class="absolute top-0 left-0 w-2 h-2 bg-white"></div>
                <div class="absolute top-0 right-0 w-2 h-2 bg-white"></div>
                <div class="absolute bottom-0 left-0 w-2 h-2 bg-white"></div>
                <div class="absolute bottom-0 right-0 w-2 h-2 bg-white"></div>

                <h1 class="text-6xl font-bold uppercase mb-4 tracking-tighter">
                    UNIT: <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-white">{robotId}</span>
                </h1>
                
                <div class="font-mono text-sm text-white/60 space-y-4 max-w-lg border-l-2 border-violet-500 pl-4">
                    <p>ACCESSING CLASSIFIED DATA...</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
                
                <div class="mt-8 grid grid-cols-3 gap-4">
                    {#each Array(3) as _}
                        <div class="h-32 bg-white/5 border border-white/10 flex items-center justify-center relative group overflow-hidden">
                            <div class="absolute inset-0 bg-violet-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span class="font-mono text-xs text-white/30">IMG_DATA_CORRUPT</span>
                        </div>
                    {/each}
                </div>
            </div>
        </main>
    </div>
</div>
