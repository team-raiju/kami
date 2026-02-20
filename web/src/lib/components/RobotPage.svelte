<script lang="ts">
    import GridBackground from "$lib/components/GridBackground.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { Canvas } from "@threlte/core";
    import Robot from "$lib/components/Robot.svelte";
    import PdfViewer from "$lib/components/PDFViewer.svelte";
    import { marked } from "marked";
    import markedKatex from "marked-katex-extension";
    import mermaid from "mermaid";
    import hljs from "highlight.js";

    marked.use(markedKatex({ throwOnError: false }));

    const renderer = new marked.Renderer();
    renderer.code = (code) => {
        if (code.lang === "mermaid") {
            return `<div class="mermaid">${code.text}</div>`;
        }

        const validLang = !!(code.lang && hljs.getLanguage(code.lang));
        const highlighted = validLang ? hljs.highlight(code.text, { language: code.lang! }).value : code.text;
        return `<pre><code class="hljs language-${code.lang}">${highlighted}</code></pre>`;
    };
    marked.use({ renderer });

    $effect(() => {
        mermaid.initialize({ startOnLoad: true, theme: "dark" });
        mermaid.run({ querySelector: ".mermaid" });
    });

    export interface BotInfo {
        id: string;
        name: string;
        kanji: string;
        type: string;
        version: string;
        description: string;
        reportDate: string;
    }

    interface ContentSubsection {
        id: string;
        title: string;
        html: string | Promise<string>;
    }

    export interface ContentSection {
        id: string;
        title: string;
        html: string | Promise<string>;
        subsections?: ContentSubsection[];
    }

    let { botInfo, content }: { botInfo: BotInfo; content: ContentSection[] } = $props();

    // svelte-ignore state_referenced_locally
    const modelName = `${botInfo.id}.${botInfo.version}`;
    // svelte-ignore state_referenced_locally
    const pdfUrl = `/documents/${botInfo.name}_${botInfo.version.toUpperCase()}.pdf`;
</script>

<div class="font-grotesk fixed inset-0 flex flex-col overflow-hidden bg-black text-white md:flex-row">
    <GridBackground />

    <aside class="relative z-10 flex h-[40vh] w-full flex-col border-r border-white/10 bg-black/80 backdrop-blur-md md:h-full md:w-[30%]">
        <div class="relative h-1/2 w-full overflow-hidden border-b border-white/10">
            <div class="absolute top-6 left-6 z-10">
                <a
                    href="/"
                    class="group mb-2 inline-flex items-center gap-2 font-mono text-xs text-violet-500 uppercase transition-colors hover:text-white"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    RETURN
                </a>
                <h1 class="text-4xl font-bold tracking-tighter text-white uppercase">{botInfo.name}</h1>
                <span class="font-mono text-xs text-white/50">{botInfo.type} // {botInfo.version}</span>
            </div>

            <div
                class="pointer-events-none absolute top-1/2 right-4 z-0 -translate-y-1/2 font-jp text-8xl font-black text-white/5 select-none [writing-mode:vertical-rl]"
            >
                {botInfo.kanji}
            </div>

            <Canvas>
                <Robot {modelName} />
            </Canvas>
        </div>

        <nav class="flex-1 overflow-y-auto p-8">
            <span class="mb-6 block font-mono text-xs tracking-widest text-white/30">OUTLINE // 目次</span>
            <ul class="space-y-6">
                {#each content as section}
                    <li>
                        <a href="#{section.id}" class="group block border-l-2 border-white/5 pl-4 transition-colors hover:border-violet-500">
                            <span class="block font-mono text-sm text-white/70 group-hover:text-white">{section.title}</span>
                        </a>
                        {#if section.subsections && section.subsections.length > 0}
                            <ul class="mt-3 ml-4 space-y-3 border-l border-white/5 pl-4">
                                {#each section.subsections as sub}
                                    <li>
                                        <a href="#{sub.id}" class="block font-mono text-xs text-white/40 transition-colors hover:text-violet-400">
                                            {sub.title}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </li>
                {/each}
            </ul>
        </nav>

        <Footer />
    </aside>

    <main class="relative z-10 h-full w-full overflow-y-auto scroll-smooth bg-black/50 md:w-[70%]">
        <div class="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
            <div class="mb-16 border-b border-white/10 pb-8">
                <span class="mb-4 inline-block rounded border border-violet-500/30 bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-400">
                    BUILD REPORT // {botInfo.version} // {botInfo.reportDate}
                </span>
                <h2 class="mb-4 text-3xl font-bold md:text-5xl">{botInfo.name}</h2>
                <p class="font-mono text-sm leading-relaxed text-white/50">
                    {botInfo.description}
                </p>
            </div>

            <div
                class="font-grotesk prose prose-lg max-w-none prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-white/70 prose-a:text-violet-400 hover:prose-a:text-violet-300 prose-code:before:content-none prose-code:after:content-none"
            >
                {#each content as section}
                    <section id={section.id} class="article-section mb-24 scroll-mt-24">
                        <div class="sticky top-0 z-30 mb-6 flex items-baseline gap-4 border-b border-white/10 bg-black/90 pt-4 pb-2 backdrop-blur-md">
                            <h3 class="m-0 text-2xl font-bold tracking-wider text-violet-500 uppercase">{section.title}</h3>
                        </div>

                        <div class="mb-8">
                            {@html section.html}
                        </div>

                        {#if section.id === "hardware"}
                            <PdfViewer url={pdfUrl} />
                        {/if}

                        {#each section.subsections as sub}
                            <div id={sub.id} class="scroll-mt-24">
                                <div class="sticky top-19 z-20 mb-4 -ml-6 w-[calc(100%+1.5rem)] bg-black/95 py-2 pl-6 backdrop-blur-md">
                                    <h4 class="m-0 text-xl font-bold text-white">{sub.title}</h4>
                                </div>
                                <div>
                                    {@html sub.html}
                                </div>
                            </div>
                        {/each}
                    </section>
                {/each}
            </div>
        </div>
    </main>
</div>
