<script lang="ts">
    import GridBackground from "$lib/components/GridBackground.svelte";
    import RobotCard from "$lib/components/RobotCard.svelte";
    import Footer from "$lib/components/Footer.svelte";

    import logo from "$lib/assets/logo.svg?raw";
    import raiju from "$lib/assets/raiju.svg?raw";
    import raijin from "$lib/assets/raijin.svg?raw";
    import fujin from "$lib/assets/fujin.svg?raw";

    const robots = [
        {
            id: "raiju",
            name: "Raiju",
            kanji: "雷獣",
            category: "Sumo 3KG",
            debut: 2019,
            medals: [3, 2, 1],
            versions: ["v1", "v2"],
            disabled: true,
            logo: raiju,
        },
        {
            id: "raijin",
            name: "Raijin",
            kanji: "雷神",
            category: "Line Follower",
            medals: [7, 1, 2],
            debut: 2023,
            versions: ["v1"],
            logo: raijin,
        },
        {
            id: "fujin",
            name: "Fujin",
            kanji: "風神",
            category: "Micromouse",
            medals: [1, 1, 0],
            versions: ["v1"],
            debut: 2024,
            logo: fujin,
        },
    ];
</script>

<div class="relative h-screen w-full bg-black font-body text-white">
    <GridBackground />

    <div class="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-6 py-8">
        <header class="mt-4 text-center">
            <div class="flex flex-row items-center justify-center gap-6">
                <div class="size-20 fill-white">
                    {@html logo}
                </div>
                <h1 class="tracking-tigh relative font-title text-4xl text-white select-none sm:text-6xl">
                    <span class="relative z-10 mr-12 block text-lg">Team</span>
                    <span class="relative z-10 block">Raiju</span>
                </h1>
            </div>
        </header>

        <div class="flex-col">
            <div class="mb-5 border-b border-white/10 font-body text-2xl">
                <span class="cursor-default font-mono text-[12px] text-white/40 uppercase">
                    Projects <span class="ml-2 font-jp text-white/20">プロジェクト</span>
                </span>
            </div>
            <div class="flex w-full flex-col gap-6 md:flex-row md:items-center md:justify-center md:perspective-[1000px]">
                {#each robots as robot}
                    <div class="contents">
                        <RobotCard {...robot} />
                    </div>
                {/each}
            </div>
        </div>

        <Footer />
    </div>
</div>
