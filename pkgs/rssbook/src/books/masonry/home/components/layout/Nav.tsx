import { formatHTML } from "@/utils";
import type { Translations } from "../../i18n";

interface NavProps {
	title: string;
	description?: string;
	t: Translations;
}

export function Nav({ title, description, t }: NavProps) {
	const safeDescription = description ? formatHTML(description) : "";

	return (
		<nav class="sticky top-0 z-40 border-stone-200/60 border-b bg-white/80 backdrop-blur-xl dark:border-stone-800/60 dark:bg-stone-950/80">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
				<a class="group flex items-center gap-3" href="/">
					<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 shadow-rose-500/25 shadow-sm transition-transform group-hover:scale-105">
						<span class="font-bold text-sm text-white">R</span>
					</div>
					<div>
						<h1 class="font-bold text-sm text-stone-900 tracking-tight dark:text-stone-100">
							<span safe>{title || "RSSBook"}</span>
						</h1>
						{!!safeDescription && (
							<p class="hidden text-stone-400 text-xs sm:block" safe>
								{safeDescription}
							</p>
						)}
					</div>
				</a>

				<div class="flex items-center gap-2">
					<button
						class="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
						data-on-click="$filterBar = !$filterBar"
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
					</button>

					<button
						aria-label={t.toggleDarkMode}
						class="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300"
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
