import type { Translations } from "../../i18n";

interface FooterProps {
	title: string;
	description?: string;
	rss?: string;
	atom?: string;
	json?: string;
	t: Translations;
}

export function Footer({ title, description, rss, atom, json, t }: FooterProps) {
	const currentYear = new Date().getFullYear();

	return (
		<footer class="border-stone-200/60 border-t bg-white/50 dark:border-stone-800/60 dark:bg-stone-950/50">
			<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
					<div>
						<div class="flex items-center gap-3">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500">
								<span class="font-bold text-white text-xs">R</span>
							</div>
							<h2 class="font-bold text-sm text-stone-900 tracking-tight dark:text-stone-100" safe>
								{title}
							</h2>
						</div>
						{!!description && (
							<p class="mt-3 text-sm text-stone-500 leading-relaxed dark:text-stone-400" safe>
								{description}
							</p>
						)}
					</div>

					<div>
						<h3 class="font-medium text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500">
							<span safe>{t.quickNavigation}</span>
						</h3>
						<ul class="mt-4 space-y-2.5">
							<li>
								<a
									class="text-sm text-stone-500 transition-colors hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400"
									href="/"
								>
									<span safe>{t.home}</span>
								</a>
							</li>
							<li>
								<a
									class="text-sm text-stone-500 transition-colors hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400"
									href={rss}
								>
									RSS
								</a>
							</li>
							<li>
								<a
									class="text-sm text-stone-500 transition-colors hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400"
									href={atom}
								>
									Atom
								</a>
							</li>
							<li>
								<a
									class="text-sm text-stone-500 transition-colors hover:text-rose-500 dark:text-stone-400 dark:hover:text-rose-400"
									href={json}
								>
									JSON Feed
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h3 class="font-medium text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500">
							<span safe>{t.proudlyMadeWith}</span>
						</h3>
						<p class="mt-4 text-sm text-stone-500 dark:text-stone-400">
							&copy; {currentYear} <span safe>{title || "RSSBook"}</span>.{" "}
							<span safe>{t.allRightsReserved}</span>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
