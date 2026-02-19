<script lang="ts">
    import { goto } from "$app/navigation";

    let { id, name, kanji, category, logo, debut, medals, versions = [] as string[], disabled = false } = $props();

    let latestVersion = $derived(versions.length > 0 ? versions[versions.length - 1] : null);
    let href = $derived(latestVersion ? `/robot/${id}/${latestVersion}` : `/robot/${id}`);
</script>

<svelte:element
    this={disabled ? "div" : "a"}
    href={disabled ? undefined : href}
    class="group hover:border-opacity-100 relative flex w-full min-w-75 flex-col overflow-hidden border border-white/10 bg-black/40 p-6 backdrop-blur-sm transition-all duration-700 md:h-[55vh] md:w-1/3"
>
    <div
        class="pointer-events-none absolute top-20 right-4 z-0 font-jp text-9xl font-black text-white/5 opacity-0 transition-all duration-700 select-none [writing-mode:vertical-rl] group-hover:opacity-15"
    >
        {kanji}
    </div>

    <div class="relative z-10 mb-8 flex items-start justify-between border-b border-white/10 pb-4">
        <div>
            <h2 class="font-body text-3xl font-bold tracking-widest text-white uppercase transition-colors group-hover:text-current">
                {name}
            </h2>
            <span class="font-mono text-xs text-white/50 transition-colors group-hover:text-white/80">
                {kanji}
            </span>
        </div>
        <div class="flex flex-col items-end">
            <span
                class="rounded border border-white/5 bg-white/5 px-2 py-1 font-mono text-[10px] tracking-widest text-white/70 uppercase backdrop-blur-md"
            >
                {category}
            </span>
        </div>
    </div>

    <div class="relative z-10 flex grow items-center justify-center py-8">
        <div class="hexgrid absolute inset-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20"></div>

        <div
            class="relative h-48 w-48 text-white/20 transition-all duration-500 group-hover:scale-110 group-hover:text-current group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]"
        >
            {@html logo}
        </div>
    </div>

    <div class="relative z-10 mt-auto opacity-40 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0">
        <div class="mb-4 flex flex-row justify-between border-t border-dashed border-white/20 pt-4">
            <div class="flex flex-col">
                <span class="font-mono text-[10px] text-white/40 uppercase">
                    Debut <span class="ml-2 font-jp text-white/20">初出場</span>
                </span>
                <span class="font-mono text-sm text-white">{debut}</span>
            </div>

            <div class="flex max-w-25 flex-col">
                <span class="font-mono text-[10px] text-white/40 uppercase">
                    Medals <span class="ml-2 font-jp text-white/20">メダル</span>
                </span>
                <div class="mt-1 flex flex-wrap items-center gap-1">
                    {#each Array(medals[0]) as _}<span class="inline-block size-2 rounded-full bg-[#FFD700]"></span>{/each}
                    {#each Array(medals[1]) as _}<span class="inline-block size-2 rounded-full bg-[#C0C0C0]"></span>{/each}
                    {#each Array(medals[2]) as _}<span class="inline-block size-2 rounded-full bg-[#CD7F32]"></span>{/each}
                </div>
            </div>
        </div>

        <div
            class="flex items-center justify-between border border-white/5 bg-white/5 px-4 py-3 backdrop-blur-md transition-colors {disabled
                ? 'cursor-default'
                : 'group/btn cursor-pointer hover:bg-white/10'}"
        >
            <div class="flex flex-col">
                {#if disabled}
                    <span class="font-mono text-xs tracking-widest text-white/40 uppercase">Coming Soon</span>
                    <span class="font-jp text-[10px] text-white/20">近日公開</span>
                {:else}
                    <span class="font-mono text-xs tracking-widest text-white uppercase">Build Report</span>
                    <span class="font-jp text-[10px] text-white/40">開発レポート</span>
                {/if}
            </div>
            {#if !disabled}
                <div class="flex items-center gap-2">
                    {#if versions.length > 1}
                        <div
                            class="flex max-w-0 items-center gap-1 overflow-hidden opacity-0 transition-all duration-500 group-hover/btn:max-w-50 group-hover/btn:opacity-100"
                        >
                            {#each versions.slice(0, -1) as version}
                                <button
                                    class="cursor-pointer border border-white/10 px-1.5 py-0.5 font-mono text-[10px] tracking-widest whitespace-nowrap text-white/40 uppercase transition-colors hover:border-white/30 hover:text-white"
                                    onclick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        goto(`/robot/${id}/${version}`);
                                    }}
                                >
                                    {version}
                                </button>
                            {/each}
                        </div>
                    {/if}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="size-4 transform text-current transition-transform group-hover/btn:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            {/if}
        </div>
    </div>
</svelte:element>

<style>
    .hexgrid {
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='86.6' viewBox='0 0 100 86.6'%3E%3Cpolygon fill='none' stroke='%23ffffff' stroke-width='0.5' points='50,0 100,25 100,61.6 50,86.6 0,61.6 0,25'/%3E%3Cline x1='50' y1='0' x2='50' y2='86.6' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cline x1='0' y1='25' x2='100' y2='61.6' stroke='%23ffffff' stroke-width='0.5'/%3E%3Cline x1='0' y1='61.6' x2='100' y2='25' stroke='%23ffffff' stroke-width='0.5'/%3E%3C/svg%3E");
        background-size: 50px 43.3px;
        background-repeat: repeat;
        mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
    }
</style>
