<script lang="ts">
    import RobotPage from "$lib/components/RobotPage.svelte";
    import { marked } from "$lib/utils/markdown";

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

    const botInfo = {
        id: "raijin",
        name: "Raijin",
        kanji: "雷神",
        type: "Line Follower",
        version: "v1",
        reportDate: "2024-08",
        description:
            "Raijin (雷神) é o deus japonês das tempestades e foi o nome escolhido para o robô seguidor de linha da equipe. Nesta página encontrará um relatório técnico do projeto, mostrando todos seus componentes mecânicos e de hardware, além de detalhamento sobre a implementação do firmware.",
    };

    const content = [
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

<RobotPage {botInfo} {content} />
