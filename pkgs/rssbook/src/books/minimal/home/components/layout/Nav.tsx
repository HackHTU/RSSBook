import { formatHTML } from "@/utils";
import type { Translations } from "../../i18n";

interface NavProps {
	title: string;
	description?: string;
	t: Translations;
}

export function Nav({ title, description, t }: NavProps) {
	const safeDescription = description ? formatHTML(description) : "";

	return (
		<nav class="fixed top-0 left-0 z-20 hidden h-screen w-64 flex-col border-neutral-200 border-r bg-white p-8 lg:flex dark:border-neutral-800 dark:bg-neutral-950">
			<div class="mb-12">
				<a class="group block" href="/">
					<h1 class="font-bold font-serif text-2xl text-neutral-900 tracking-tight dark:text-neutral-100">
						<span safe>{title || "RSSBook"}</span>
					</h1>
					{!!safeDescription && (
						<p class="mt-1 text-neutral-500 text-xs uppercase tracking-widest dark:text-neutral-600">
							<span safe>{safeDescription}</span>
						</p>
					)}
				</a>
			</div>

			<div class="flex flex-col gap-1">
				<a
					class="py-2 font-medium text-neutral-900 text-sm uppercase tracking-wide dark:text-neutral-100"
					href="/"
				>
					<span safe>{t.home}</span>
				</a>
				<button
					class="py-2 text-left font-medium text-neutral-500 text-sm uppercase tracking-wide transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
					data-on-click="$filiterBar = !$filiterBar"
					type="button"
				>
					<span safe>{t.search}</span>
				</button>
			</div>

			<div class="mt-auto">
				<button
					aria-label={t.toggleDarkMode}
					class="flex items-center gap-2 font-medium text-neutral-500 text-xs uppercase tracking-widest transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
					data-effect="document.documentElement.classList.toggle('dark', $darkMode)"
					data-on-click="$darkMode = !$darkMode"
					type="button"
				>
					<svg
						aria-hidden="true"
						class="h-4 w-4 dark:hidden"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
						/>
					</svg>
					<svg
						aria-hidden="true"
						class="hidden h-4 w-4 dark:block"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
						/>
					</svg>
					<span safe>{t.toggleDarkMode}</span>
				</button>
			</div>
		</nav>
	);
}
