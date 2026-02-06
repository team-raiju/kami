<script lang="ts">
  // TeamLogo: Team logo display with glow effect
  export let size: "sm" | "md" | "lg" = "lg";

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };
</script>

<div class="logo-container {sizeClasses[size]}">
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="team-logo">
    <!-- Hexagonal frame -->
    <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" class="logo-frame" />

    <!-- Inner hexagon -->
    <polygon points="50,15 80,32.5 80,67.5 50,85 20,67.5 20,32.5" class="logo-inner" />

    <!-- Central robot icon -->
    <g class="robot-icon">
      <!-- Head -->
      <rect x="38" y="30" width="24" height="18" rx="3" />
      <!-- Eyes -->
      <circle cx="44" cy="39" r="3" class="eye" />
      <circle cx="56" cy="39" r="3" class="eye" />
      <!-- Body -->
      <rect x="35" y="52" width="30" height="20" rx="2" />
      <!-- Arms -->
      <rect x="28" y="54" width="5" height="14" rx="2" />
      <rect x="67" y="54" width="5" height="14" rx="2" />
      <!-- Antenna -->
      <line x1="50" y1="30" x2="50" y2="24" />
      <circle cx="50" cy="22" r="3" class="antenna-tip" />
    </g>

    <!-- Team name arc (can be customized) -->
    <defs>
      <path id="textArc" d="M 15 75 Q 50 95 85 75" fill="none" />
    </defs>
    <text class="team-text">
      <textPath href="#textArc" startOffset="50%" text-anchor="middle">TEAM RAIJU</textPath>
    </text>
  </svg>
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .logo-container {
    @apply relative;
    filter: drop-shadow(0 0 20px var(--blueprint-glow));
  }

  .team-logo {
    @apply w-full h-full;
  }

  .logo-frame {
    fill: none;
    stroke: var(--blueprint-accent);
    stroke-width: 2;
  }

  .logo-inner {
    fill: rgba(59, 130, 246, 0.1);
    stroke: var(--blueprint-accent);
    stroke-width: 1;
    stroke-dasharray: 4 2;
  }

  .robot-icon rect,
  .robot-icon line {
    fill: none;
    stroke: var(--blueprint-text);
    stroke-width: 1.5;
  }

  .robot-icon .eye {
    fill: var(--blueprint-accent);
    stroke: none;
  }

  .robot-icon circle:not(.eye) {
    fill: none;
    stroke: var(--blueprint-text);
    stroke-width: 1.5;
  }

  .antenna-tip {
    fill: var(--blueprint-accent);
    stroke: none !important;
  }

  .team-text {
    fill: var(--blueprint-accent);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
</style>
