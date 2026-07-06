export function Background() {
	return (
		<div class="fixed inset-0 -z-10 overflow-hidden">
			<div class="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-rose-50 dark:from-stone-950 dark:via-neutral-950 dark:to-rose-950/20"></div>
			<div class="absolute top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-200/20 blur-3xl dark:bg-rose-900/10"></div>
			<div class="absolute right-0 bottom-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-amber-200/15 blur-3xl dark:bg-amber-900/10"></div>
		</div>
	);
}
