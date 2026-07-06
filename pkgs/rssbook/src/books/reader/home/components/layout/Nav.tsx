import type { Translations } from "../../i18n";

interface NavProps {
	title: string;
	t: Translations;
}

export function Nav({ title, t }: NavProps) {
	return (
		<nav class="sticky top-0 z-20 border-zinc-200 border-b bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
			<div class="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
				<a class="block" href="/">
					<span class="font-semibold text-lg text-zinc-900 tracking-tight dark:text-zinc-100" safe>
						{title || "RSSBook"}
					</span>
				</a>

				<div class="flex items-center gap-3">
					<button
						class="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
						data-on-click="$filiterBar = !$filiterBar"
						type="button"
					>
						<svg
							aria-hidden="true"
							class="h-5 w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
							/>
						</svg>
						<span class="sr-only">
							<span safe>{t.search}</span>
						</span>
					</button>

					<button
						aria-label={t.toggleDarkMode}
						class="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
						data-effect="document.documentElement.classList.toggle('dark', $darkMode)"
						data-on-click="$darkMode = !$darkMode"
						type="button"
					>
						<svg
							aria-hidden="true"
							class="h-5 w-5 dark:hidden"
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
							class="hidden h-5 w-5 dark:block"
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
