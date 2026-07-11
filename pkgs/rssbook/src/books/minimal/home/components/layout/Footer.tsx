import { formatHTML } from "@/utils/formatHTML";
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
		<footer class="border-neutral-200 border-t dark:border-neutral-800">
			<div class="mx-auto max-w-3xl px-6 py-16 lg:ml-64 lg:max-w-none lg:px-12">
				<div class="grid grid-cols-1 gap-12 md:grid-cols-3">
					<div>
						<h2
							class="font-bold font-serif text-lg text-neutral-900 tracking-tight dark:text-neutral-100"
							safe
						>
							{title}
						</h2>
						{!!safeDescription && (
							<p class="mt-2 text-neutral-500 text-sm leading-relaxed dark:text-neutral-500">
								{safeDescription}
							</p>
						)}
					</div>

					<div>
						<h3 class="font-medium text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600">
							<span safe>{t.quickNavigation}</span>
						</h3>
						<ul class="mt-4 space-y-2">
							<li>
								<a
									class="text-neutral-600 text-sm transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
									href="/"
								>
									<span safe>{t.home}</span>
								</a>
							</li>
							<li>
								<a
									class="text-neutral-600 text-sm transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
									href={rss}
								>
									RSS
								</a>
							</li>
							<li>
								<a
									class="text-neutral-600 text-sm transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
									href={atom}
								>
									Atom
								</a>
							</li>
							<li>
								<a
									class="text-neutral-600 text-sm transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
									href={json}
								>
									JSON Feed
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h3 class="font-medium text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600">
							<span safe>{t.proudlyMadeWith}</span>
						</h3>
						<p class="mt-4 text-neutral-500 text-sm dark:text-neutral-500">
							&copy; {currentYear} <span safe>{title || "RSSBook"}</span>.{" "}
							<span safe>{t.allRightsReserved}</span>
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
