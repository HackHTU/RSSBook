import type { Translations } from "../../i18n";

interface FooterProps {
	title: string;
	description?: string;
	rss?: string;
	atom?: string;
	json?: string;
	t: Translations;
}

export function Footer({ title, rss, atom, json, t }: FooterProps) {
	const currentYear = new Date().getFullYear();

	return (
		<footer class="border-neutral-200/50 border-t bg-white/80 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-950/80">
			<div class="mx-auto max-w-[1800px] px-6 py-10 sm:px-10 lg:px-14">
				<div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
							<span class="font-bold text-white text-xs">G</span>
						</div>
						<p class="text-neutral-500 text-sm dark:text-white/40">
							&copy; {currentYear} <span safe>{title || "RSSBook"}</span>.{" "}
							<span safe>{t.allRightsReserved}</span>
						</p>
					</div>

					<div class="flex items-center gap-6">
						{!!rss && (
							<a
								class="text-neutral-400 text-sm transition-colors hover:text-emerald-600 dark:text-white/30 dark:hover:text-emerald-400"
								href={rss}
							>
								RSS
							</a>
						)}
						{!!atom && (
							<a
								class="text-neutral-400 text-sm transition-colors hover:text-emerald-600 dark:text-white/30 dark:hover:text-emerald-400"
								href={atom}
							>
								Atom
							</a>
						)}
						{!!json && (
							<a
								class="text-neutral-400 text-sm transition-colors hover:text-emerald-600 dark:text-white/30 dark:hover:text-emerald-400"
								href={json}
							>
								JSON
							</a>
						)}
						<span class="text-neutral-300 text-sm dark:text-white/20">
							<span safe>{t.proudlyMadeWith}</span>
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
