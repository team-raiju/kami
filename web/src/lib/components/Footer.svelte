<script lang="ts">
    import GitHubIcon from "$lib/components/icons/GitHubIcon.svelte";
    import InstagramIcon from "$lib/components/icons/InstagramIcon.svelte";
    import YouTubeIcon from "$lib/components/icons/YouTubeIcon.svelte";
</script>

<div class="flex w-full items-end justify-between border-t border-white/10 p-4 font-mono text-xs text-white/50">
    <div class="flex gap-4">
        <a href="https://github.com/team-raiju" target="_blank" rel="noreferrer" class="transition-colors hover:text-white" aria-label="GitHub">
            <GitHubIcon />
        </a>
        <a href="https://instagram.com/raiju.team" target="_blank" rel="noreferrer" class="transition-colors hover:text-white" aria-label="Instagram">
            <InstagramIcon />
        </a>
        <a
            href="https://www.youtube.com/@raiju_team"
            target="_blank"
            rel="noreferrer"
            class="transition-colors hover:text-white"
            aria-label="YouTube"
        >
            <YouTubeIcon />
        </a>
    </div>
    <div class="flex items-center gap-4">
        <span>Team Raiju &copy; 2026</span>
    </div>
</div>
