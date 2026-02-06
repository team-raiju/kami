<script lang="ts">
  import { page } from '$app/state';
  import BlueprintBackground from '$lib/components/BlueprintBackground.svelte';

  // Robot data - should match the landing page data
  const robotsData: Record<string, { name: string; category: string; description: string }> = {
    atlas: {
      name: 'ATLAS',
      category: 'Combat Robot',
      description: 'A fierce combat robot designed for competition. Features angular armor plating and powerful actuators for rapid movement and attack capabilities.'
    },
    phoenix: {
      name: 'PHOENIX',
      category: 'Rescue Robot',
      description: 'An agile rescue robot equipped with advanced sensor arrays for search and rescue operations. Multiple antennas provide superior environmental awareness.'
    },
    titan: {
      name: 'TITAN',
      category: 'Heavy Duty',
      description: 'A powerhouse designed for heavy-duty tasks. Robust construction with reinforced limbs enables it to handle the most demanding challenges.'
    }
  };

  const slug = page.params.slug;
  const robot = robotsData[slug] || { name: 'Unknown', category: 'Unknown', description: 'Robot not found.' };
</script>

<svelte:head>
  <title>{robot.name} | Team Raiju</title>
</svelte:head>

<BlueprintBackground>
  <main class="robot-page">
    <nav class="nav">
      <a href="/" class="back-link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="back-icon">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>BACK TO ROBOTS</span>
      </a>
    </nav>

    <header class="header">
      <span class="robot-category">{robot.category}</span>
      <h1 class="robot-name">{robot.name}</h1>
    </header>

    <section class="content">
      <div class="specs-panel">
        <h2 class="panel-title">
          <span class="title-marker"></span>
          SPECIFICATIONS
        </h2>
        <p class="description">{robot.description}</p>

        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">STATUS</span>
            <span class="spec-value">ACTIVE</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">VERSION</span>
            <span class="spec-value">v2.0</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">WEIGHT</span>
            <span class="spec-value">TBD</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">POWER</span>
            <span class="spec-value">TBD</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</BlueprintBackground>

<style>
  .robot-page {
    @apply min-h-screen px-4 py-8 max-w-4xl mx-auto;
  }

  .nav {
    @apply mb-12;
  }

  .back-link {
    @apply inline-flex items-center gap-2 text-sm tracking-widest uppercase;
    color: var(--blueprint-text-muted);
    transition: color 0.3s ease;
  }

  .back-link:hover {
    color: var(--blueprint-accent);
  }

  .back-icon {
    @apply w-4 h-4;
  }

  .header {
    @apply text-center mb-12;
  }

  .robot-category {
    @apply text-xs tracking-[0.5em] uppercase block mb-2;
    color: var(--blueprint-accent);
  }

  .robot-name {
    @apply text-5xl md:text-6xl font-bold tracking-[0.2em];
    color: var(--blueprint-text);
    text-shadow: 0 0 40px var(--blueprint-glow);
  }

  .content {
    @apply mt-8;
  }

  .specs-panel {
    @apply p-8 rounded-lg;
    background: linear-gradient(135deg, rgba(13, 29, 53, 0.8) 0%, rgba(10, 22, 40, 0.9) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  .panel-title {
    @apply flex items-center gap-3 text-lg tracking-[0.2em] uppercase mb-6;
    color: var(--blueprint-text);
  }

  .title-marker {
    @apply w-3 h-3 rotate-45;
    background: var(--blueprint-accent);
  }

  .description {
    @apply text-base leading-relaxed mb-8;
    color: var(--blueprint-text-muted);
  }

  .specs-grid {
    @apply grid grid-cols-2 md:grid-cols-4 gap-4;
  }

  .spec-item {
    @apply flex flex-col gap-1 p-4 rounded;
    background: rgba(59, 130, 246, 0.05);
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .spec-label {
    @apply text-xs tracking-widest;
    color: var(--blueprint-text-muted);
  }

  .spec-value {
    @apply text-lg font-semibold;
    color: var(--blueprint-accent);
  }
</style>
