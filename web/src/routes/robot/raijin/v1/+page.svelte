<script lang="ts">
    import GridBackground from "$lib/components/GridBackground.svelte";
    import GithubIcon from "$lib/components/icons/GitHubIcon.svelte";
    import InstagramIcon from "$lib/components/icons/InstagramIcon.svelte";
    import { Canvas } from "@threlte/core";
    import Raijin from "$lib/components/Raijin.svelte";
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
        return `<pre><code class="hljs ${validLang ? "language-" + code.lang : ""}">${highlighted}</code></pre>`;
    };
    marked.use({ renderer });

    $effect(() => {
        mermaid.initialize({ startOnLoad: true, theme: "dark" });
        mermaid.run({ querySelector: ".mermaid" });
    });

    import introMd from "$lib/content/robots/raijin/intro.md?raw";
    import mecMd from "$lib/content/robots/raijin/mec.md?raw";
    import mecEstruturaMd from "$lib/content/robots/raijin/mec.estrutura.md?raw";
    import mecVentoinhasMd from "$lib/content/robots/raijin/mec.ventoinhas.md?raw";
    import mecEngrenagensMd from "$lib/content/robots/raijin/mec.engrenagens.md?raw";
    import mecMotoresMd from "$lib/content/robots/raijin/mec.motores.md?raw";
    import hardwareMd from "$lib/content/robots/raijin/hardware.md?raw";
    import hardwareReguladorMd from "$lib/content/robots/raijin/hardware.regulador.md?raw";
    import hardwareUcMd from "$lib/content/robots/raijin/hardware.uc.md?raw";
    import hardwareEepromMd from "$lib/content/robots/raijin/hardware.eeprom.md?raw";
    import hardwareImuMd from "$lib/content/robots/raijin/hardware.imu.md?raw";
    import hardwareUsbMd from "$lib/content/robots/raijin/hardware.usb.md?raw";
    import hardwareBtMd from "$lib/content/robots/raijin/hardware.bt.md?raw";
    import hardwareLineSensorsMd from "$lib/content/robots/raijin/hardware.linesensors.md?raw";
    import hardwareDriverMd from "$lib/content/robots/raijin/hardware.driver.md?raw";
    import firmwareMd from "$lib/content/robots/raijin/firmware.md?raw";
    import firmwareMapMd from "$lib/content/robots/raijin/firmware.map.md?raw";
    import firmwareControleMd from "$lib/content/robots/raijin/firmware.controle.md?raw";
    import extrasMd from "$lib/content/robots/raijin/extras.md?raw";

    let version = "v1";

    // Static Data
    const botInfo = { name: "Raijin", kanji: "雷神", type: "Line Follower" };

    let content = [
        {
            id: "intro",
            title: "Introdução",
            html: marked.parse(introMd),
        },
        {
            id: "mechanics",
            title: "Mecânica",
            html: marked.parse(mecMd),
            subsections: [
                { id: "structure", title: "Estrutura", html: marked.parse(mecEstruturaMd) },
                { id: "fans", title: "Ventoinhas", html: marked.parse(mecVentoinhasMd) },
                { id: "gears", title: "Engrenagens", html: marked.parse(mecEngrenagensMd) },
                { id: "motors", title: "Motores", html: marked.parse(mecMotoresMd) },
            ],
        },
        {
            id: "hardware",
            title: "Hardware",
            html: marked.parse(hardwareMd),
            subsections: [
                { id: "regulator", title: "Regulador", html: marked.parse(hardwareReguladorMd) },
                { id: "microcontroller", title: "Microcontrolador", html: marked.parse(hardwareUcMd) },
                { id: "eeprom", title: "EEPROM", html: marked.parse(hardwareEepromMd) },
                { id: "imu", title: "IMU", html: marked.parse(hardwareImuMd) },
                { id: "usb", title: "USB", html: marked.parse(hardwareUsbMd) },
                { id: "bluetooth", title: "Bluetooth", html: marked.parse(hardwareBtMd) },
                { id: "linesensors", title: "Sensores de Linha", html: marked.parse(hardwareLineSensorsMd) },
                { id: "driver", title: "Driver", html: marked.parse(hardwareDriverMd) },
            ],
        },
        {
            id: "firmware",
            title: "Firmware",
            html: marked.parse(firmwareMd),
            subsections: [
                { id: "mapping", title: "Mapeamento", html: marked.parse(firmwareMapMd) },
                { id: "control", title: "Controle", html: marked.parse(firmwareControleMd) },
            ],
        },
        { id: "extras", title: "Extras", html: marked.parse(extrasMd) },
    ];
</script>

<div class="font-grotesk fixed inset-0 flex flex-col overflow-hidden bg-black text-white md:flex-row">
    <GridBackground />

    <aside class="relative z-20 flex h-[40vh] w-full flex-col border-r border-white/10 bg-black/80 backdrop-blur-md md:h-full md:w-[30%]">
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
                <span class="font-mono text-xs text-white/50">{botInfo.type} // {version}</span>
            </div>

            <div
                class="[writing-mode:vertical-rl] pointer-events-none absolute top-1/2 right-4 z-0 -translate-y-1/2 font-jp text-8xl font-black text-white/5 select-none"
            >
                {botInfo.kanji}
            </div>

            <Canvas>
                <Raijin />
            </Canvas>
        </div>

        <nav class="flex-1 overflow-y-auto p-8">
            <span class="mb-6 block font-mono text-xs tracking-widest text-white/30">DATA_INDEX // 目次</span>
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

        <div class="flex w-full items-end justify-between border-t border-white/10 p-4 font-mono text-xs text-white/50">
            <div class="flex gap-4">
                <a
                    href="https://github.com/team-raiju"
                    target="_blank"
                    rel="noreferrer"
                    class="transition-colors hover:text-white"
                    aria-label="GitHub"
                >
                    <GithubIcon />
                </a>
                <a
                    href="https://instagram.com/raiju.team"
                    target="_blank"
                    rel="noreferrer"
                    class="transition-colors hover:text-white"
                    aria-label="Instagram"
                >
                    <InstagramIcon />
                </a>
            </div>
            <div class="flex items-center gap-4">
                <span>Team Raiju &copy; 2026</span>
            </div>
        </div>
    </aside>

    <main class="relative z-10 h-full w-full overflow-y-auto scroll-smooth bg-black/50 md:w-[70%]">
        <div class="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
            <div class="mb-16 border-b border-white/10 pb-8">
                <span class="mb-4 inline-block rounded border border-violet-500/30 bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-400">
                    BUILD REPORT // {version}
                </span>
                <h2 class="mb-4 text-3xl font-bold md:text-5xl">Raijin</h2>
                <p class="font-mono text-sm leading-relaxed text-white/50">
                    Raijin (雷神) é o deus japonês das tempestades e foi o nome escolhido para o robô seguidor de linha da equipe. Nesta página
                    encontrará um relatório técnico do projeto, mostrando todos seus componentes mecânicos e de hardware, além de detalhamento sobre a
                    implementação do firmware.
                </p>
            </div>

            <div
                class="font-grotesk prose prose-lg max-w-none prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-p:text-white/70 prose-a:text-violet-400 hover:prose-a:text-violet-300"
            >
                {#each content as section}
                    <section id={section.id} class="article-section mb-24 scroll-mt-24">
                        <div class="sticky top-0 z-30 mb-6 flex items-baseline gap-4 border-b border-white/10 bg-black/90 pt-4 pb-2 backdrop-blur-md">
                            <h3 class="m-0 text-2xl font-bold tracking-wider text-violet-500 uppercase">{section.title}</h3>
                        </div>

                        <div class="mb-8">
                            {@html section.html}
                        </div>

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
