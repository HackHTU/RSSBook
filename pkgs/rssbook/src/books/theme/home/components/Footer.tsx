interface FooterProps {
	title: string;
	description?: string;
	rss?: string;
	atom?: string;
	json?: string;
}

export function Footer({ title, description, rss, atom, json }: FooterProps) {
	const currentYear = new Date().getFullYear();

	return (
		<footer class="relative mt-16 bg-white/70 ring-1 ring-stone-200/50 backdrop-blur-xl md:mt-24 dark:bg-stone-900/70 dark:ring-stone-800/50">
			<div class="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent dark:via-rose-700/50"></div>

			<div class="container mx-auto px-4 py-8 md:py-12">
				<div class="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
					<div class="text-center md:text-left">
						<div class="mb-4 flex items-center justify-center gap-3 md:justify-start">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg shadow-rose-300/50 dark:from-rose-600 dark:to-rose-700 dark:shadow-rose-900/50">
								<svg
									aria-hidden="true"
									class="h-6 w-6 text-white"
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
							<h2
								class="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text font-bold text-transparent text-xl dark:from-rose-400 dark:to-orange-400"
								safe
							>
								{title}
							</h2>
						</div>
						<p class="text-sm text-stone-600 leading-relaxed dark:text-stone-400" safe>
							{description}
						</p>
					</div>

					<div class="text-center md:text-left">
						<h3 class="mb-4 font-bold text-sm text-stone-900 uppercase tracking-wider dark:text-stone-100">
							快速导航
						</h3>
						<ul class="space-y-2">
							<li>
								<a
									class="text-sm text-stone-600 transition-colors duration-200 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
									href="/"
								>
									首页
								</a>
							</li>
							<li>
								<a
									class="text-sm text-stone-600 transition-colors duration-200 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
									href={rss}
								>
									RSS
								</a>
							</li>
							<li>
								<a
									class="text-sm text-stone-600 transition-colors duration-200 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
									href={atom}
								>
									Atom
								</a>
							</li>
							<li>
								<a
									class="text-sm text-stone-600 transition-colors duration-200 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
									href={json}
								>
									JSON Feed
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div class="my-8 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent dark:via-stone-700"></div>

				<div class="flex flex-col items-center justify-between gap-4 text-sm text-stone-500 md:flex-row dark:text-stone-400">
					<p>
						&copy; {currentYear} <span safe>{title || "RSSBook"}</span>. 保留所有权利.
					</p>
					<div class="flex items-center gap-6">
						<a
							class="transition-colors duration-200 hover:text-rose-600 dark:hover:text-rose-400"
							href="https://github.com/HackHTU/RSSBook"
							rel="noopener noreferrer"
							target="_blank"
						>
							自豪地采用 RSSBook 制作。
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
