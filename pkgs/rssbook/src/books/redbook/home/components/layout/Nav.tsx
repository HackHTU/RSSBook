import { formatHTML } from "@/utils";
import type { Translations } from "../../i18n";

interface NavProps {
	title: string;
	description?: string;
	t: Translations;
}

export function Nav({ title, description, t }: NavProps) {
	const safeDescription = description ? formatHTML(description) : "";
	const NavButtons = () => (
		<>
			<button
				class="rounded-xl px-4 py-2 text-center font-medium text-sm text-stone-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:text-stone-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
				data-on-click="$filiterBar = !$filiterBar"
				type="button"
			>
				<span safe>{t.search}</span>
			</button>
			<a
				class="rounded-xl px-4 py-2 text-center font-medium text-sm text-stone-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:text-stone-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
				href="/"
			>
				<span safe>{t.home}</span>
			</a>
		</>
	);

	return (
		<nav
			class="sticky top-0 z-10 bg-white/70 shadow-rose-100/50 shadow-sm ring-1 ring-stone-200/50 backdrop-blur-xl dark:bg-stone-900/70 dark:shadow-rose-950/50 dark:ring-stone-800/50"
			data-store='{"mobileMenuOpen": false}'
		>
			<div class="container mx-auto px-4">
				<div class="flex h-16 items-center justify-between md:h-20">
					<div class="flex items-center gap-3">
						<a aria-label={t.backToHome} class="group flex items-center gap-3" href="/">
							<div class="relative">
								<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-300/50 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 md:h-12 md:w-12 dark:from-rose-600 dark:to-pink-600 dark:shadow-rose-900/50">
									<svg
										aria-hidden="true"
										class="h-7 w-7 md:h-8 md:w-8"
										fill="none"
										viewBox="0 0 512 512"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M446 157c7 9 8 20 5 31l-65 214c-3 10-9 18-18 25s-19 10-29 10H121c-12 0-24-4-35-12-11-9-19-19-23-31-4-11-4-21-1-30C147 75 148 75 204 75h178c12 0 21 4 27 13s8 19 4 31l-64 213c-6 19-12 31-17 37-6 5-16 8-31 8H97c-5 0-8 1-9 3-2 3-2 6-1 10 4 11 15 17 34 17h218c5 0 9-1 13-4 4-2 7-5 8-9l71-233c2-6 8-11 13-7l2 3Zm-251 1 1 5c1 2 2 2 5 2h143c2 0 4 0 6-2l4-5 5-15-1-6-4-2H210l-6 2-4 6-5 15Zm-19 60v6l5 2h143l6-2c2-2 4-4 4-6l5-15v-5c-1-2-3-2-5-2H191c-2 0-4 0-6 2-2 1-4 3-4 5l-5 15Z"
											fill="white"
										/>
									</svg>
								</div>
								<div class="absolute inset-0 rounded-xl bg-rose-400 opacity-0 group-hover:animate-ping group-hover:opacity-50 dark:bg-rose-600"></div>
							</div>

							<div>
								<h1 class="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text font-bold text-transparent text-xl md:text-2xl dark:from-rose-400 dark:to-orange-400">
									<span safe>{title || "RSSBook"}</span>
								</h1>
								{!!safeDescription && (
									<p class="hidden text-stone-500 text-xs md:block dark:text-stone-400">
										<span>{safeDescription}</span>
									</p>
								)}
							</div>
						</a>
					</div>

					<div class="flex items-center gap-2 md:gap-4">
						<div class="hidden items-center gap-2 sm:flex">
							<NavButtons />
						</div>

						<button
							aria-label={t.toggleDarkMode}
							class="rounded-xl bg-white/80 p-2 text-stone-700 ring-1 ring-stone-200/50 transition-all duration-200 hover:scale-110 hover:bg-rose-50 hover:text-rose-600 active:scale-95 md:p-2.5 dark:bg-stone-800/80 dark:text-stone-300 dark:ring-stone-700/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
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

						<button
							aria-label={t.menu}
							class="rounded-xl bg-white/80 p-2 text-stone-700 ring-1 ring-stone-200/50 transition-all duration-200 hover:scale-110 hover:bg-rose-50 active:scale-95 sm:hidden dark:bg-stone-800/80 dark:text-stone-300 dark:ring-stone-700/50 dark:hover:bg-rose-950/30"
							data-on-click="$mobileMenuOpen = !$mobileMenuOpen"
							type="button"
						>
							<svg
								aria-hidden="true"
								class="h-6 w-6"
								data-show="!$mobileMenuOpen"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M4 6h16M4 12h16M4 18h16"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								/>
							</svg>

							<svg
								aria-hidden="true"
								class="h-6 w-6"
								data-show="$mobileMenuOpen"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M6 18L18 6M6 6l12 12"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div data-show="$mobileMenuOpen">
					<div class="flex animate-fade-in flex-col space-y-2 border-stone-200/50 border-t py-4 sm:hidden dark:border-stone-800/50">
						<NavButtons />

						<div class="my-3 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent dark:via-stone-700"></div>
					</div>
				</div>
			</div>

			<div
				class="fixed inset-0 -z-10 bg-stone-200/20 backdrop-blur-sm transition-opacity duration-300 sm:hidden dark:bg-stone-900/40"
				data-class="$mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
				data-on-click="$mobileMenuOpen = false"
				data-show="$mobileMenuOpen"
			></div>
		</nav>
	);
}
