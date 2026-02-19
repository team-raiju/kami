<script lang="ts">
    import GridBackground from "$lib/components/GridBackground.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { Canvas } from "@threlte/core";
    import Raijin from "$lib/components/Raijin.svelte";
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

    import introMd from "$lib/content/robots/fujin/intro.md?raw";

    import mecMd from "$lib/content/robots/fujin/mec.md?raw";
    import mecParamMd from "$lib/content/robots/fujin/mec.parametros.md?raw";
    import mecEstruturaMd from "$lib/content/robots/fujin/mec.estrutura.md?raw";
    import mecSuccaoMd from "$lib/content/robots/fujin/mec.succao.md?raw";
    import mecEncoderMd from "$lib/content/robots/fujin/mec.encoder.md?raw";
    import mecRodasMd from "$lib/content/robots/fujin/mec.rodas.md?raw";
    import mecSensoresMd from "$lib/content/robots/fujin/mec.sensores.md?raw";

    import hardwareMd from "$lib/content/robots/fujin/hardware.md?raw";
    import hardwareAlimentacaoMd from "$lib/content/robots/fujin/hardware.alimentacao.md?raw";
    import hardwareUcMd from "$lib/content/robots/fujin/hardware.uc.md?raw";
    import hardwareEepromMd from "$lib/content/robots/fujin/hardware.eeprom.md?raw";
    import hardwareImuMd from "$lib/content/robots/fujin/hardware.imu.md?raw";
    import hardwareUsbMd from "$lib/content/robots/fujin/hardware.usb.md?raw";
    import hardwareBtMd from "$lib/content/robots/fujin/hardware.bt.md?raw";
    import hardwareDriverMd from "$lib/content/robots/fujin/hardware.driver.md?raw";
    import hardwareSensoresIrMd from "$lib/content/robots/fujin/hardware.sensoresir.md?raw";
    import hardwareMosfetMd from "$lib/content/robots/fujin/hardware.mosfet.md?raw";
    import hardwareBateriaMd from "$lib/content/robots/fujin/hardware.bateria.md?raw";

    import firmwareMd from "$lib/content/robots/fujin/firmware.md?raw";
    import firmwareSearchMd from "$lib/content/robots/fujin/firmware.search.md?raw";
    import firmwareLeituraIrMd from "$lib/content/robots/fujin/firmware.leitura_ir.md?raw";
    import firmwareDeteccaoMd from "$lib/content/robots/fujin/firmware.deteccao_parede.md?raw";
    import firmwareControleIrMd from "$lib/content/robots/fujin/firmware.controle_ir.md?raw";
    import firmwareVelocidadeMd from "$lib/content/robots/fujin/firmware.velocidade.md?raw";
    import firmwareMovOverviewMd from "$lib/content/robots/fujin/firmware.movimentos_overview.md?raw";
    import firmwareMovDadosMd from "$lib/content/robots/fujin/firmware.movimentos_dados.md?raw";
    import firmwareMovExecMd from "$lib/content/robots/fujin/firmware.movimentos_execucao.md?raw";
    import firmwarePerfilsMd from "$lib/content/robots/fujin/firmware.perfils.md?raw";
    import firmwareDiagonaisMd from "$lib/content/robots/fujin/firmware.diagonais.md?raw";
    import firmwareCorrecaoMd from "$lib/content/robots/fujin/firmware.correcao.md?raw";
    import firmwareLogsMd from "$lib/content/robots/fujin/firmware.logs.md?raw";

    import controleMd from "$lib/content/robots/fujin/controle.md?raw";
    import bluetoothMd from "$lib/content/robots/fujin/bluetooth.md?raw";
    import videosMd from "$lib/content/robots/fujin/videos.md?raw";
    import extrasMd from "$lib/content/robots/fujin/extras.md?raw";

    let version = "v1";

    const botInfo = { name: "Fujin", kanji: "風神", type: "Micromouse" };

    let content = [
        {
            id: "intro",
            title: "Introdução",
            html: marked.parse(introMd),
            subsections: [],
        },
        {
            id: "mec",
            title: "Mecânica",
            html: marked.parse(mecMd),
            subsections: [
                { id: "mec_params", title: "Parâmetros Atuais", html: marked.parse(mecParamMd) },
                { id: "mec_estrutura", title: "Estrutura", html: marked.parse(mecEstruturaMd) },
                { id: "mec_succao", title: "Sistema de Sucção", html: marked.parse(mecSuccaoMd) },
                { id: "mec_encoder", title: "Encoder", html: marked.parse(mecEncoderMd) },
                { id: "mec_rodas", title: "Rodas", html: marked.parse(mecRodasMd) },
                { id: "mec_sensores", title: "Posicionamento dos Sensores", html: marked.parse(mecSensoresMd) },
            ],
        },
        {
            id: "hardware",
            title: "Hardware",
            html: marked.parse(hardwareMd),
            subsections: [
                { id: "hw_alimentacao", title: "Alimentação", html: marked.parse(hardwareAlimentacaoMd) },
                { id: "hw_uc", title: "Microcontrolador", html: marked.parse(hardwareUcMd) },
                { id: "hw_eeprom", title: "EEPROM Externa", html: marked.parse(hardwareEepromMd) },
                { id: "hw_imu", title: "IMU", html: marked.parse(hardwareImuMd) },
                { id: "hw_usb", title: "USB", html: marked.parse(hardwareUsbMd) },
                { id: "hw_bt", title: "Bluetooth", html: marked.parse(hardwareBtMd) },
                { id: "hw_driver", title: "Driver do Motor", html: marked.parse(hardwareDriverMd) },
                { id: "hw_sensores_ir", title: "Sensores IR", html: marked.parse(hardwareSensoresIrMd) },
                { id: "hw_mosfet", title: "Mosfet Ventoinha", html: marked.parse(hardwareMosfetMd) },
                { id: "hw_bateria", title: "Bateria", html: marked.parse(hardwareBateriaMd) },
            ],
        },
        {
            id: "firmware",
            title: "Firmware",
            html: marked.parse(firmwareMd),
            subsections: [
                { id: "fw_search", title: "Search", html: marked.parse(firmwareSearchMd) },
                { id: "fw_leitura_ir", title: "Leitura dos Sensores IR", html: marked.parse(firmwareLeituraIrMd) },
                { id: "fw_deteccao", title: "Detecção de Parede", html: marked.parse(firmwareDeteccaoMd) },
                { id: "fw_controle_ir", title: "Controle utilizando Sensores IR", html: marked.parse(firmwareControleIrMd) },
                { id: "fw_velocidade", title: "Medição de Velocidade Linear", html: marked.parse(firmwareVelocidadeMd) },
                { id: "fw_mov_overview", title: "Movimentos - Overview", html: marked.parse(firmwareMovOverviewMd) },
                { id: "fw_mov_dados", title: "Movimentos - Estrutura de Dados", html: marked.parse(firmwareMovDadosMd) },
                { id: "fw_mov_exec", title: "Movimentos - Execução", html: marked.parse(firmwareMovExecMd) },
                { id: "fw_perfils", title: "Perfis de Velocidade", html: marked.parse(firmwarePerfilsMd) },
                { id: "fw_diagonais", title: "Diagonais", html: marked.parse(firmwareDiagonaisMd) },
                { id: "fw_correcao", title: "Correção de Posição", html: marked.parse(firmwareCorrecaoMd) },
                { id: "fw_logs", title: "Logs", html: marked.parse(firmwareLogsMd) },
            ],
        },
        {
            id: "controle",
            title: "Controle",
            html: marked.parse(controleMd),
            subsections: [],
        },
        {
            id: "bluetooth",
            title: "Bluetooth",
            html: marked.parse(bluetoothMd),
            subsections: [],
        },
        {
            id: "videos",
            title: "Vídeos",
            html: marked.parse(videosMd),
            subsections: [],
        },
        {
            id: "extras",
            title: "Extras",
            html: marked.parse(extrasMd),
            subsections: [],
        },
    ];
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
                <span class="font-mono text-xs text-white/50">{botInfo.type} // {version}</span>
            </div>

            <div
                class="pointer-events-none absolute top-1/2 right-4 z-0 -translate-y-1/2 font-jp text-8xl font-black text-white/5 select-none [writing-mode:vertical-rl]"
            >
                {botInfo.kanji}
            </div>

            <Canvas>
                <Raijin />
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
                    BUILD REPORT // {version}
                </span>
                <h2 class="mb-4 text-3xl font-bold md:text-5xl">Fujin</h2>
                <p class="font-mono text-sm leading-relaxed text-white/50">
                    Fujin (風神) é o deus japonês dos ventos e foi o nome escolhido para o robô micromouse da equipe. Nesta página encontrará um
                    relatório técnico do projeto, mostrando todos seus componentes mecânicos e de hardware, além de detalhamento sobre a implementação
                    do firmware.
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
                            <PdfViewer url="/documents/Fujin_V1.pdf" />
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
