<script lang="ts">
    import RobotPage from "$lib/components/RobotPage.svelte";
    import { marked } from "$lib/utils/markdown";

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
    import extrasReferenciasMd from "$lib/content/robots/fujin/extras.referencias.md?raw";
    import extrasMazeBuildMd from "$lib/content/robots/fujin/extras.maze_build.md?raw";
    import extrasSimulatorMd from "$lib/content/robots/fujin/extras.simulator.md?raw";

    const botInfo = {
        id: "fujin",
        name: "Fujin",
        kanji: "風神",
        type: "Micromouse",
        version: "v1",
        reportDate: "2026-02",
        description:
            "Fujin (風神) é o deus japonês dos ventos e foi o nome escolhido para o robô micromouse da equipe. Nesta página encontrará um relatório técnico do projeto, mostrando todos seus componentes mecânicos e de hardware, além de detalhamento sobre a implementação do firmware.",
    };

    const content = [
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
            subsections: [
                { id: "extras_referencias", title: "Referências e Links Úteis", html: marked.parse(extrasReferenciasMd) },
                { id: "extras_maze_build", title: "Maze Build", html: marked.parse(extrasMazeBuildMd) },
                { id: "extras_simulator", title: "Simulator", html: marked.parse(extrasSimulatorMd) },
            ],
        },
    ];
</script>

<RobotPage {botInfo} {content} />
