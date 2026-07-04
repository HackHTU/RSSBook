interface NavProps {
	title: string;
	description?: string;
}

export function Nav({ title, description }: NavProps) {
	const NavButtons = () => (
		<>
			<button
				class="rounded-xl px-4 py-2 text-center font-medium text-sm text-stone-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:text-stone-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
				data-on-click="$filiterBar = !$filiterBar"
				type="button"
			>
				搜索
			</button>
			<a
				class="rounded-xl px-4 py-2 text-center font-medium text-sm text-stone-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 dark:text-stone-300 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
				href="/"
			>
				首页
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
						<a aria-label="返回首页" class="group flex items-center gap-3" href="/">
							<div class="relative">
								<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-300/50 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 md:h-12 md:w-12 dark:from-rose-600 dark:to-rose-700 dark:shadow-rose-900/50">
									<svg
										aria-hidden="true"
										class="h-6 w-6 text-white md:h-7 md:w-7"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
										/>
									</svg>
								</div>
								<div class="absolute inset-0 rounded-xl bg-rose-400 opacity-0 group-hover:animate-ping group-hover:opacity-50 dark:bg-rose-600"></div>
							</div>

							<div>
								<h1 class="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text font-bold text-transparent text-xl md:text-2xl dark:from-rose-400 dark:to-orange-400">
									<span safe>{title || "RSSBook"}</span>
								</h1>
								{!!description && (
									<p class="hidden text-stone-500 text-xs md:block dark:text-stone-400">
										<span safe>{description}</span>
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
							aria-label="切换暗色模式"
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
							aria-label="菜单"
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
