export function Background() {
	return (
		<div class="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-neutral-950">
			<div class="absolute inset-0 bg-gradient-to-b from-white via-white to-neutral-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900"></div>
			<div class="absolute top-0 left-1/4 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[120px] dark:bg-emerald-500/5"></div>
			<div class="absolute right-1/4 bottom-0 h-[400px] w-[400px] translate-y-1/2 rounded-full bg-emerald-500/3 blur-[100px] dark:bg-emerald-500/3"></div>
		</div>
	);
}
