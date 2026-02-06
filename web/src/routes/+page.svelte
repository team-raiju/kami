<script lang="ts">
  import BlueprintBackground from "$lib/components/BlueprintBackground.svelte";
  import TeamLogo from "$lib/components/TeamLogo.svelte";
  import RobotCard from "$lib/components/RobotCard.svelte";

  // Robot data
  const robots = [
    {
      name: "Raiju",
      category: "Robot Sumo",
      slug: "raiju",
    },
    {
      name: "Raijin",
      category: "Line Follower",
      slug: "raijin",
    },
    {
      name: "Fujin",
      category: "Micromouse",
      slug: "fujin",
    },
  ];
</script>

<BlueprintBackground>
  <main class="landing-page">
    <!-- Header with logo only -->
    <header class="header">
      <TeamLogo size="lg" />
    </header>

    <!-- Robot selection section -->
    <section class="robots-section">
      <div class="robots-grid">
        {#each robots as robot}
          <RobotCard name={robot.name} category={robot.category} slug={robot.slug}>
            <!-- Custom SVG for each robot can be added here -->
            {#if robot.slug === "raiju"}
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Raiju: Robot Sumo - compact, aggressive stance -->
                <rect x="20" y="30" width="60" height="40" rx="4" class="robot-lineart" />
                <rect x="30" y="35" width="15" height="10" rx="2" class="robot-lineart" />
                <rect x="55" y="35" width="15" height="10" rx="2" class="robot-lineart" />
                <line x1="30" y1="55" x2="70" y2="55" class="robot-lineart" />
                <line x1="30" y1="62" x2="70" y2="62" class="robot-lineart" />
                <rect x="15" y="40" width="5" height="25" rx="1" class="robot-lineart" />
                <rect x="80" y="40" width="5" height="25" rx="1" class="robot-lineart" />
                <rect x="25" y="72" width="20" height="8" rx="2" class="robot-lineart" />
                <rect x="55" y="72" width="20" height="8" rx="2" class="robot-lineart" />
              </svg>
            {:else if robot.slug === "raijin"}
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Raijin: Line Follower - sleek, sensor-focused -->
                <ellipse cx="50" cy="50" rx="35" ry="20" class="robot-lineart" />
                <circle cx="35" cy="45" r="5" class="robot-lineart" />
                <circle cx="65" cy="45" r="5" class="robot-lineart" />
                <line x1="30" y1="70" x2="30" y2="78" class="robot-lineart" />
                <line x1="50" y1="70" x2="50" y2="78" class="robot-lineart" />
                <line x1="70" y1="70" x2="70" y2="78" class="robot-lineart" />
                <circle cx="30" cy="80" r="3" class="robot-lineart" />
                <circle cx="50" cy="80" r="3" class="robot-lineart" />
                <circle cx="70" cy="80" r="3" class="robot-lineart" />
                <ellipse cx="25" cy="55" rx="8" ry="4" class="robot-lineart" />
                <ellipse cx="75" cy="55" rx="8" ry="4" class="robot-lineart" />
              </svg>
            {:else if robot.slug === "fujin"}
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Fujin: Micromouse - small, precise, sensor arrays -->
                <rect x="30" y="35" width="40" height="35" rx="3" class="robot-lineart" />
                <circle cx="40" cy="45" r="4" class="robot-lineart" />
                <circle cx="60" cy="45" r="4" class="robot-lineart" />
                <line x1="35" y1="28" x2="35" y2="35" class="robot-lineart" />
                <line x1="50" y1="25" x2="50" y2="35" class="robot-lineart" />
                <line x1="65" y1="28" x2="65" y2="35" class="robot-lineart" />
                <circle cx="35" cy="25" r="2" class="robot-lineart" />
                <circle cx="50" cy="22" r="2" class="robot-lineart" />
                <circle cx="65" cy="25" r="2" class="robot-lineart" />
                <line x1="35" y1="55" x2="65" y2="55" class="robot-lineart" />
                <line x1="35" y1="60" x2="65" y2="60" class="robot-lineart" />
                <circle cx="35" cy="75" r="5" class="robot-lineart" />
                <circle cx="65" cy="75" r="5" class="robot-lineart" />
              </svg>
            {/if}
          </RobotCard>
        {/each}
      </div>
    </section>
  </main>
</BlueprintBackground>

<style lang="postcss">
  @reference "tailwindcss";

  .landing-page {
    @apply min-h-screen flex flex-col items-center justify-center px-4 py-8;
  }

  .header {
    @apply absolute top-8 left-1/2 -translate-x-1/2;
  }

  .robots-section {
    @apply flex flex-col items-center justify-center w-full;
  }

  .robots-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 place-items-center;
  }
</style>
