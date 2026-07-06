import type { FilterInfo, PaginationInfo } from "@/types";
import type { Translations } from "../../i18n";

interface StatusProps {
	pagination: PaginationInfo;
	itemCount: number;
	filter: FilterInfo;
	t: Translations;
}

export function Status({ pagination, itemCount, filter, t }: StatusProps) {
	const { page, totalPages, total, limit, hasPrev, hasNext } = pagination;
	const { search, category } = filter;

	const buildPageUrl = (targetPage: number): string => {
		const parts = [`page=${targetPage}`, `limit=${limit}`];
		if (search) parts.push(`search=${encodeURIComponent(search)}`);
		if (category && category !== "all") parts.push(`category=${encodeURIComponent(category)}`);
		return `/?${parts.join("&")}`;
	};

	const prevUrl = hasPrev ? buildPageUrl(page - 1) : undefined;
	const nextUrl = hasNext ? buildPageUrl(page + 1) : undefined;
	const safeItemCount = itemCount;
	const safeArticlesOfTotal = t.articlesOfTotal.replace("{total}", String(total));
	const safePage = page;
	const safeTotalPages = totalPages;

	return (
		<div class="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
			<div class="flex flex-col items-center justify-between gap-4 rounded-2xl border border-stone-200/60 bg-white p-6 shadow-sm sm:flex-row dark:border-stone-800/60 dark:bg-stone-900">
				<div class="flex items-center gap-3">
					<span class="text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500">
						<span safe>{t.loaded}</span>
					</span>
					<span class="font-medium text-sm text-stone-700 dark:text-stone-300">
						{safeItemCount} {safeArticlesOfTotal}
					</span>
				</div>

				<div class="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-wider dark:text-stone-500">
					<span safe>{t.page}</span>
					<span class="font-bold text-base text-rose-500">{safePage}</span>
					<span>/</span>
					<span class="font-medium text-stone-700 dark:text-stone-300">{safeTotalPages}</span>
					<span safe>{t.pages}</span>
				</div>

				<div class="flex items-center gap-2">
					<a
						aria-disabled={!hasPrev}
						aria-label={t.previousPage}
						class={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium text-sm transition-all ${
							hasPrev
								? "bg-rose-500 text-white shadow-rose-500/25 shadow-sm hover:opacity-80"
								: "cursor-not-allowed bg-stone-100 text-stone-300 dark:bg-stone-800 dark:text-stone-600"
						}`}
						href={prevUrl}
					>
						<svg
							aria-hidden="true"
							class="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M15 19l-7-7 7-7"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
							/>
						</svg>
						<span safe>{t.previousPage}</span>
					</a>
					<a
						aria-disabled={!hasNext}
						aria-label={t.nextPage}
						class={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-medium text-sm transition-all ${
							hasNext
								? "bg-rose-500 text-white shadow-rose-500/25 shadow-sm hover:opacity-80"
								: "cursor-not-allowed bg-stone-100 text-stone-300 dark:bg-stone-800 dark:text-stone-600"
						}`}
						href={nextUrl}
					>
						<span safe>{t.nextPage}</span>
						<svg
							aria-hidden="true"
							class="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M9 5l7 7-7 7"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
							/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	);
}
