import type { Translations } from "../../i18n";

interface NavProps {
	title: string;
	description?: string;
	t: Translations;
}

export function Nav({ title, t }: NavProps) {
	return (
		<nav class="fixed top-0 right-0 left-0 z-50 px-4 pt-4">
			<div class="mx-auto max-w-[1800px] rounded-2xl bg-black/40 backdrop-blur-xl dark:bg-black/60">
				<div class="flex items-center justify-between px-6 py-4 sm:px-10">
					<a class="group flex items-center gap-3" href="/">
						<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-emerald-500/40">
							<span class="font-bold text-sm text-white">G</span>
						</div>
						<span class="font-semibold text-lg text-white tracking-tight">
							<span safe>{title || "RSSBook"}</span>
						</span>
					</a>

					<div class="flex items-center gap-3">
						<button
							class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
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
							class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
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
									stroke-width="2"
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
									stroke-width="2"
								/>
							</svg>
						</button>

						<a
							class="hidden h-10 items-center gap-2 rounded-full bg-white/10 px-5 text-sm text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white sm:flex"
							href="/"
						>
							<span safe>{t.home}</span>
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
}
