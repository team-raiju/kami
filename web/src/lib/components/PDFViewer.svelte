<script lang="ts">
    import { usePdfiumEngine } from "@embedpdf/engines/svelte";
    import { EmbedPDF } from "@embedpdf/core/svelte";
    import { createPluginRegistration } from "@embedpdf/core";

    import { ViewportPluginPackage, Viewport } from "@embedpdf/plugin-viewport/svelte";
    import { Scroller, ScrollPluginPackage, type RenderPageProps } from "@embedpdf/plugin-scroll/svelte";
    import { DocumentManagerPluginPackage, DocumentContent } from "@embedpdf/plugin-document-manager/svelte";
    import { RenderLayer, RenderPluginPackage } from "@embedpdf/plugin-render/svelte";
    import { InteractionManagerPluginPackage } from "@embedpdf/plugin-interaction-manager/svelte";
    import { ZoomPluginPackage, useZoom } from "@embedpdf/plugin-zoom/svelte";
    import { PanPluginPackage } from "@embedpdf/plugin-pan/svelte";

    import FullscreenEnterIcon from "./icons/FullscreenEnterIcon.svelte";
    import FullscreenExitIcon from "./icons/FullscreenExitIcon.svelte";
    import ZoomInIcon from "./icons/ZoomInIcon.svelte";
    import ZoomOutIcon from "./icons/ZoomOutIcon.svelte";

    let { url } = $props();
    let isFullscreen = $state(false);

    const pdfEngine = usePdfiumEngine();

    const plugins = [
        createPluginRegistration(DocumentManagerPluginPackage, {
            // svelte-ignore state_referenced_locally
            initialDocuments: [{ url }],
        }),
        createPluginRegistration(ViewportPluginPackage),
        createPluginRegistration(ScrollPluginPackage),
        createPluginRegistration(RenderPluginPackage),
        createPluginRegistration(InteractionManagerPluginPackage),
        createPluginRegistration(ZoomPluginPackage),
        createPluginRegistration(PanPluginPackage, { defaultMode: "always" }),
    ];

    // svelte-ignore state_referenced_locally
    const filename = url.split("/").pop()?.toUpperCase() || "DOCUMENT";

    function toggleFullscreen() {
        isFullscreen = !isFullscreen;
    }
</script>

<div
    class={isFullscreen
        ? "fixed inset-0 z-100 flex flex-col bg-black/90 p-4 backdrop-blur-xl"
        : "mb-12 flex w-full flex-col overflow-hidden rounded-sm border border-white/10 bg-black/40 backdrop-blur-md"}
>
    <div class="flex shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
        <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
                <div class="h-2 w-2 animate-pulse rounded-full bg-violet-500"></div>
                <span class="font-mono text-xs tracking-widest text-white/70">{filename}</span>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <button onclick={toggleFullscreen} class="text-white/50 transition-colors hover:text-white" aria-label="Toggle Fullscreen">
                {#if isFullscreen}
                    <FullscreenExitIcon class="size-4" />
                {:else}
                    <FullscreenEnterIcon class="size-4" />
                {/if}
            </button>
        </div>
    </div>

    <div class="relative w-full grow bg-black/20 {isFullscreen ? 'h-full' : 'h-150'}">
        {#if pdfEngine.isLoading || !pdfEngine.engine}
            <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/50">
                <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-500"></div>
                <span class="animate-pulse font-mono text-xs tracking-widest">INITIALIZING SYSTEM...</span>
            </div>
        {:else}
            <EmbedPDF engine={pdfEngine.engine} {plugins}>
                {#snippet children({ activeDocumentId })}
                    {#if activeDocumentId}
                        {@const documentId = activeDocumentId}
                        {@const zoomState = useZoom(() => documentId)}
                        {@const zoom = zoomState.provides}

                        {#if zoom}
                            <div class="absolute -top-7 right-12 z-50 flex items-center gap-1">
                                <button
                                    onclick={() => zoom.zoomOut()}
                                    class="p-1 text-white/50 transition-colors hover:text-violet-400"
                                    aria-label="Zoom Out"
                                >
                                    <ZoomOutIcon />
                                </button>

                                <button
                                    onclick={() => zoom.zoomIn()}
                                    class="p-1 text-white/50 transition-colors hover:text-violet-400"
                                    aria-label="Zoom In"
                                >
                                    <ZoomInIcon />
                                </button>
                            </div>
                        {/if}

                        <DocumentContent {documentId}>
                            {#snippet children(documentContent)}
                                {#if documentContent.isLoaded}
                                    <Viewport
                                        {documentId}
                                        class="custom-scrollbar h-full w-full overflow-auto p-8 select-none"
                                        style="touch-action: none;"
                                        onwheel={(e) => {
                                            if (zoom && e.ctrlKey) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (e.deltaY < 0) zoom.zoomIn();
                                                else zoom.zoomOut();
                                            }
                                        }}
                                    >
                                        <Scroller {documentId}>
                                            {#snippet renderPage(page: RenderPageProps)}
                                                <div
                                                    style:width="{page.width}px"
                                                    style:height="{page.height}px"
                                                    style:position="relative"
                                                    class="mx-auto mb-4 border border-white/5 bg-white shadow-2xl shadow-black"
                                                >
                                                    <RenderLayer {documentId} pageIndex={page.pageIndex} />
                                                </div>
                                            {/snippet}
                                        </Scroller>
                                    </Viewport>
                                {/if}
                            {/snippet}
                        </DocumentContent>
                    {/if}
                {/snippet}
            </EmbedPDF>
        {/if}
    </div>
</div>

<style>
    :global(.custom-scrollbar::-webkit-scrollbar) {
        width: 6px;
        height: 6px;
    }
    :global(.custom-scrollbar::-webkit-scrollbar-track) {
        background: #050505;
    }
    :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
        background: #262626;
        border: 1px solid #050505;
    }
    :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
        background: #7c3aed;
    }

    :global(.custom-scrollbar img),
    :global(.custom-scrollbar canvas) {
        -webkit-user-drag: none;
        user-select: none;
    }
</style>
