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
		<footer class="relative mt-16 bg-white/70 ring-1 ring-stone-200/50 backdrop-blur-xl md:mt-24 dark:bg-stone-900/70 dark:ring-stone-800/50">
			<div class="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent dark:via-rose-700/50"></div>

			<div class="container mx-auto px-4 py-8 md:py-12">
				<div class="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
					<div class="text-center md:text-left">
						<div class="mb-4 flex items-center justify-center gap-3 md:justify-start">
							<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-300/50 dark:from-rose-600 dark:to-pink-600 dark:shadow-rose-900/50">
								<svg
									aria-hidden="true"
									class="h-6 w-6"
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
							<h2
								class="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text font-bold text-transparent text-xl dark:from-rose-400 dark:to-orange-400"
								safe
							>
								{title}
							</h2>
						</div>
						{!!safeDescription && (
							<p class="text-sm text-stone-600 leading-relaxed dark:text-stone-400">
								{safeDescription}
							</p>
						)}
					</div>

					<div class="text-center md:text-left">
						<h3 class="mb-4 font-bold text-sm text-stone-900 uppercase tracking-wider dark:text-stone-100">
							<span safe>{t.quickNavigation}</span>
						</h3>
						<ul class="space-y-2">
							<li>
								<a
									class="text-sm text-stone-600 transition-colors duration-200 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400"
									href="/"
								>
									<span safe>{t.home}</span>
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
						&copy; {currentYear} <span safe>{title || "RSSBook"}</span>.{" "}
						<span safe>{t.allRightsReserved}</span>
					</p>
					<div class="flex items-center gap-6">
						<a
							class="transition-colors duration-200 hover:text-rose-600 dark:hover:text-rose-400"
							href="https://github.com/HackHTU/RSSBook"
							rel="noopener noreferrer"
							target="_blank"
						>
							<span safe>{t.proudlyMadeWith}</span>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
