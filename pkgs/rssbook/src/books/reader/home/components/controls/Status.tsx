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
		<div class="mt-8">
			<div class="flex flex-col items-center gap-4 border-zinc-100 border-t py-8 dark:border-zinc-800/60">
				<p class="text-sm text-zinc-400 dark:text-zinc-500">
					{safeItemCount} {safeArticlesOfTotal}
				</p>

				<div class="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
					<span safe>{t.page}</span>
					<span class="font-medium text-zinc-900 dark:text-zinc-100">{safePage}</span>
					{!!t.total && <span safe>{t.total}</span>}
					<span>/</span>
					<span safe>{t.of}</span>
					<span class="font-medium text-zinc-900 dark:text-zinc-100">{safeTotalPages}</span>
					{!!t.pages && <span safe>{t.pages}</span>}
				</div>

				<div class="flex items-center gap-6">
					<a
						aria-disabled={!hasPrev}
						aria-label={t.previousPage}
						class={`font-medium text-sm transition-opacity ${
							hasPrev
								? "text-blue-600 hover:opacity-70 dark:text-blue-400"
								: "cursor-not-allowed text-zinc-300 dark:text-zinc-700"
						}`}
						href={prevUrl}
					>
						<span safe>← {t.previousPage}</span>
					</a>
					<a
						aria-disabled={!hasNext}
						aria-label={t.nextPage}
						class={`font-medium text-sm transition-opacity ${
							hasNext
								? "text-blue-600 hover:opacity-70 dark:text-blue-400"
								: "cursor-not-allowed text-zinc-300 dark:text-zinc-700"
						}`}
						href={nextUrl}
					>
						<span safe>{t.nextPage} →</span>
					</a>
				</div>
			</div>
		</div>
	);
}
