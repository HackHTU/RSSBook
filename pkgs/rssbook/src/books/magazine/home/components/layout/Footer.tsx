import { formatHTML } from "@/utils";
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
	const safeDescription = description ? formatHTML(description) : "";

	return (
		<footer class="border-neutral-200/60 border-t bg-neutral-900 dark:border-neutral-800/60 dark:bg-neutral-950">
			<div class="mx-auto max-w-7xl px-6 py-16 lg:px-12">
				<div class="grid grid-cols-1 gap-12 md:grid-cols-4">
					<div class="md:col-span-2">
						<h2 class="font-black font-serif text-2xl text-white tracking-tight">
							<span safe>{title}</span>
						</h2>
						{!!safeDescription && (
							<p class="mt-3 max-w-md text-neutral-400 text-sm leading-relaxed">
								{safeDescription}
							</p>
						)}
					</div>

					<div>
						<h3 class="font-semibold text-[10px] text-neutral-500 uppercase tracking-[0.25em]">
							<span safe>{t.quickNavigation}</span>
						</h3>
						<ul class="mt-5 space-y-3">
							<li>
								<a class="text-neutral-400 text-sm transition-colors hover:text-white" href="/">
									<span safe>{t.home}</span>
								</a>
							</li>
							<li>
								<a class="text-neutral-400 text-sm transition-colors hover:text-white" href={rss}>
									RSS
								</a>
							</li>
							<li>
								<a class="text-neutral-400 text-sm transition-colors hover:text-white" href={atom}>
									Atom
								</a>
							</li>
							<li>
								<a class="text-neutral-400 text-sm transition-colors hover:text-white" href={json}>
									JSON Feed
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h3 class="font-semibold text-[10px] text-neutral-500 uppercase tracking-[0.25em]">
							<span safe>{t.proudlyMadeWith}</span>
						</h3>
						<p class="mt-5 text-neutral-500 text-sm">
							&copy; {currentYear} <span safe>{title || "RSSBook"}</span>.{" "}
							<span safe>{t.allRightsReserved}</span>
						</p>
					</div>
				</div>

				<div class="mt-16 border-neutral-800 border-t pt-8">
					<p class="font-medium text-[10px] text-neutral-700 uppercase tracking-[0.3em]">
						Magazine Theme &mdash; RSSBook
					</p>
				</div>
			</div>
		</footer>
	);
}
