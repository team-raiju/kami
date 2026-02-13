<div class="pointer-events-none fixed inset-0 z-0 opacity-20">
	<div
		class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
	></div>
	<div class="animate-scanline absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[100px] w-full mix-blend-overlay"></div>
</div>

<style>
	@keyframes scanline {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(100vh);
		}
	}
	.animate-scanline {
		animation: scanline 8s linear infinite;
	}
</style>
