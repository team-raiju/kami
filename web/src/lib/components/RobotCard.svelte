<script lang="ts">
  import { goto } from "$app/navigation";

  export let name: string;
  export let category: string;
  export let slug: string;

  function handleClick() {
    goto(`/robot/${slug}`);
  }
</script>

<button class="robot-card" onclick={handleClick} type="button" aria-label="View {name} robot details">
  <!-- Card header with blueprint-style labels -->
  <div class="card-header">
    <span class="project-label">PROJECT:</span>
    <h3 class="robot-name">{name}</h3>
    <span class="robot-category">({category})</span>
  </div>

  <!-- Robot illustration area with inner outline -->
  <div class="robot-illustration">
    <!-- Corner decorations -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    <div class="illustration-outline"></div>
    <div class="robot-svg-container">
      {#if $$slots.default}
        <slot />
      {:else}
        <!-- Placeholder robot lineart -->
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="placeholder-robot">
          <rect x="25" y="15" width="50" height="30" rx="5" class="robot-lineart" />
          <circle cx="38" cy="30" r="6" class="robot-lineart" />
          <circle cx="62" cy="30" r="6" class="robot-lineart" />
          <rect x="20" y="50" width="60" height="35" rx="3" class="robot-lineart" />
        </svg>
      {/if}
    </div>
  </div>
</button>

<style lang="postcss">
  @reference "tailwindcss";

  .robot-card {
    @apply relative flex flex-col p-8 cursor-pointer text-left;
    width: 350px;
    aspect-ratio: 3 / 4;
    background: var(--blueprint-bg);
    border: 1px solid var(--blueprint-accent);
    transition: all 0.3s ease;

    /* Blueprint motifs background */
    background-image: radial-gradient(circle at 15% 85%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
      linear-gradient(90deg, transparent 49%, rgba(255, 255, 255, 0.02) 50%, transparent 51%),
      linear-gradient(0deg, transparent 49%, rgba(255, 255, 255, 0.02) 50%, transparent 51%);
    background-size:
      100% 100%,
      100% 100%,
      40px 40px,
      60px 60px,
      60px 60px;
  }

  .robot-card:hover {
    border-color: var(--blueprint-text);
    box-shadow: 0 0 30px rgba(37, 99, 235, 0.2);
  }

  /* Corner decorations */
  .corner {
    @apply absolute w-4 h-4 pointer-events-none z-10;
  }

  .corner::before,
  .corner::after {
    content: "";
    @apply absolute bg-(--blueprint-accent);
  }

  .corner-tl {
    @apply top-0 left-0;
  }
  .corner-tl::before {
    @apply top-0 left-0 w-4 h-[2px];
  }
  .corner-tl::after {
    @apply top-0 left-0 w-[2px] h-4;
  }

  .corner-tr {
    @apply top-0 right-0;
  }
  .corner-tr::before {
    @apply top-0 right-0 w-4 h-[2px];
  }
  .corner-tr::after {
    @apply top-0 right-0 w-[2px] h-4;
  }

  .corner-bl {
    @apply bottom-0 left-0;
  }
  .corner-bl::before {
    @apply bottom-0 left-0 w-4 h-[2px];
  }
  .corner-bl::after {
    @apply bottom-0 left-0 w-[2px] h-4;
  }

  .corner-br {
    @apply bottom-0 right-0;
  }
  .corner-br::before {
    @apply bottom-0 right-0 w-4 h-[2px];
  }
  .corner-br::after {
    @apply bottom-0 right-0 w-[2px] h-4;
  }

  .card-header {
    @apply relative z-10 flex flex-col items-start gap-0.5 mb-4;
  }

  .project-label {
    @apply text-[10px] tracking-[0.2em] uppercase;
    color: var(--blueprint-accent);
  }

  .robot-name {
    @apply text-2xl font-bold tracking-[0.15em] uppercase;
    color: var(--blueprint-text);
  }

  .robot-category {
    @apply text-sm tracking-wider uppercase;
    color: var(--blueprint-text-muted);
  }

  .robot-illustration {
    @apply relative z-10 flex-1 w-full flex items-center justify-center;
  }

  /* Inner outline around illustration only */
  .illustration-outline {
    @apply absolute inset-2 pointer-events-none;
    border: 1px solid var(--blueprint-line);
  }

  .robot-svg-container {
    @apply relative z-10 w-full h-full flex items-center justify-center;
  }

  .placeholder-robot {
    @apply w-3/4 h-3/4;
  }

  .bottom-marker {
    @apply relative z-10 flex justify-center mt-4;
  }

  .marker-icon {
    @apply w-4 h-4;
  }

  .marker-shape {
    fill: none;
    stroke: var(--blueprint-accent);
    stroke-width: 1.5;
  }
</style>
