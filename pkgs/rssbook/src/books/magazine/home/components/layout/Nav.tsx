import type { Translations } from "../../i18n";

interface NavProps {
	title: string;
	description?: string;
	t: Translations;
}

export function Nav({ title, description, t }: NavProps) {
	return (
		<nav class="sticky top-0 z-40 border-neutral-200/60 border-b bg-[#faf8f5]/80 backdrop-blur-xl dark:border-neutral-800/60 dark:bg-[#1a1a1a]/80">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
				<a class="group block" href="/">
					<h1 class="font-black font-serif text-2xl text-neutral-900 tracking-tight transition-colors group-hover:text-red-600 dark:text-neutral-100 dark:group-hover:text-red-500">
						<span safe>{title || "RSSBook"}</span>
					</h1>
					{!!description && (
						<p class="mt-0.5 font-medium text-[10px] text-neutral-400 uppercase tracking-[0.25em] dark:text-neutral-600">
							<span safe>{description}</span>
						</p>
					)}
				</a>

				<div class="flex items-center gap-6">
					<button
						class="font-semibold text-neutral-500 text-xs uppercase tracking-[0.2em] transition-colors hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-500"
						data-on:click="$filterBar = !$filterBar"
						type="button"
					>
						<span safe>{t.search}</span>
					</button>
					<button
						aria-label={t.toggleDarkMode}
						class="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
						data-on:click="$darkMode = !$darkMode"
						data-effect="document.documentElement.classList.toggle('dark', $darkMode)"
						type="button"
					>
						<svg
							aria-hidden="true"
							class="h-4 w-4 dark:hidden"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
							/>
						</svg>
						<svg
							aria-hidden="true"
							class="hidden h-4 w-4 dark:block"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
							/>
						</svg>
					</button>
				</div>
			</div>
		</nav>
	);
}
