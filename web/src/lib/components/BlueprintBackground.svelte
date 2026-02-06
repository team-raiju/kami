<script lang="ts">
  // BlueprintBackground: Full-screen blueprint aesthetic background
</script>

<div class="blueprint-background">
  <!-- Base gradient layer -->
  <div class="gradient-layer"></div>

  <!-- Grid pattern layer - top left -->
  <div class="grid-layer grid-top-left blueprint-grid-large"></div>

  <!-- Grid pattern layer - bottom right -->
  <div class="grid-layer grid-bottom-right blueprint-grid-large"></div>

  <!-- Decorative corner elements -->
  <svg class="corner-decor top-left" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <path class="corner-marker animate-pulse-glow" d="M0 40 L0 0 L40 0" fill="none" />
    <circle cx="0" cy="0" r="4" fill="var(--blueprint-accent)" class="animate-pulse-glow" />
  </svg>

  <svg class="corner-decor top-right" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <path class="corner-marker animate-pulse-glow" d="M80 0 L120 0 L120 40" fill="none" />
    <circle cx="120" cy="0" r="4" fill="var(--blueprint-accent)" class="animate-pulse-glow" />
  </svg>

  <svg class="corner-decor bottom-left" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <path class="corner-marker animate-pulse-glow" d="M0 80 L0 120 L40 120" fill="none" />
    <circle cx="0" cy="120" r="4" fill="var(--blueprint-accent)" class="animate-pulse-glow" />
  </svg>

  <svg class="corner-decor bottom-right" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <path class="corner-marker animate-pulse-glow" d="M80 120 L120 120 L120 80" fill="none" />
    <circle cx="120" cy="120" r="4" fill="var(--blueprint-accent)" class="animate-pulse-glow" />
  </svg>

  <!-- Blueprint title card - bottom right -->
  <div class="title-card">
    <div class="title-card-inner">
      <div class="title-card-border"></div>
      <span class="title-card-text">TEAM RAIJU</span>
      <div class="title-card-line"></div>
    </div>
  </div>

  <!-- Content slot -->
  <div class="content-layer">
    <slot />
  </div>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .blueprint-background {
    @apply fixed inset-0 overflow-auto;
    min-height: 100vh;
  }

  .gradient-layer {
    @apply absolute inset-0;
    background: var(--blueprint-bg);
  }

  .grid-layer {
    @apply absolute pointer-events-none;
  }

  .grid-top-left {
    @apply top-0 left-0 w-[800px] h-[800px];
    mask-image: radial-gradient(ellipse at 0% 0%, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at 0% 0%, black 0%, transparent 70%);
  }

  .grid-bottom-right {
    @apply bottom-0 right-0 w-[800px] h-[800px];
    mask-image: radial-gradient(ellipse at 100% 100%, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at 100% 100%, black 0%, transparent 70%);
  }

  .content-layer {
    @apply relative z-10 min-h-screen;
  }

  .corner-decor {
    @apply absolute w-24 h-24 pointer-events-none;
  }

  .top-left {
    @apply top-4 left-4;
  }

  .top-right {
    @apply top-4 right-4;
  }

  .bottom-left {
    @apply bottom-4 left-4;
  }

  .bottom-right {
    @apply bottom-4 right-4;
  }

  /* Blueprint title card */
  .title-card {
    @apply fixed bottom-8 right-8 pointer-events-none z-20;
  }

  .title-card-inner {
    @apply relative px-6 py-3;
  }

  .title-card-border {
    @apply absolute inset-0;
    border: 1px solid var(--blueprint-accent);
    opacity: 0.4;
  }

  .title-card-border::before {
    content: "";
    @apply absolute -top-1 -left-1 w-3 h-3;
    border-top: 2px solid var(--blueprint-accent);
    border-left: 2px solid var(--blueprint-accent);
  }

  .title-card-border::after {
    content: "";
    @apply absolute -bottom-1 -right-1 w-3 h-3;
    border-bottom: 2px solid var(--blueprint-accent);
    border-right: 2px solid var(--blueprint-accent);
  }

  .title-card-text {
    @apply text-sm font-semibold tracking-[0.4em] uppercase;
    color: var(--blueprint-accent);
    text-shadow: 0 0 20px var(--blueprint-glow);
  }

  .title-card-line {
    @apply absolute -left-12 top-1/2 w-10 h-px;
    background: linear-gradient(90deg, transparent, var(--blueprint-accent));
  }
</style>
