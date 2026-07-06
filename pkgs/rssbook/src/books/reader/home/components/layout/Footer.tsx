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
		<footer class="border-zinc-200 border-t dark:border-zinc-800">
			<div class="mx-auto max-w-2xl px-6 py-12">
				<div class="flex flex-col items-center gap-6 text-center">
					<div>
						<p class="font-medium text-sm text-zinc-900 dark:text-zinc-100" safe>
							{title}
						</p>
						{!!safeDescription && (
							<p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400" safe>
								{safeDescription}
							</p>
						)}
					</div>

					<div class="flex items-center gap-4 text-xs">
						{!!rss && (
							<a
								class="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
								href={rss}
							>
								RSS
							</a>
						)}
						{!!atom && (
							<a
								class="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
								href={atom}
							>
								Atom
							</a>
						)}
						{!!json && (
							<a
								class="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
								href={json}
							>
								JSON
							</a>
						)}
					</div>

					<p class="text-xs text-zinc-400 dark:text-zinc-500">
						&copy; {currentYear} <span safe>{title || "RSSBook"}</span>.{" "}
						<span safe>{t.allRightsReserved}</span>
					</p>
				</div>
			</div>
		</footer>
	);
}
