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
		<div class="mx-auto max-w-3xl lg:ml-64 lg:max-w-none">
			<div class="flex flex-col items-start justify-between gap-6 border-neutral-100 border-t py-8 md:flex-row md:items-center dark:border-neutral-800">
				<div class="flex items-center gap-4">
					<span class="font-medium text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600">
						<span safe>{t.loaded}</span>
					</span>
					<span class="font-medium text-neutral-900 text-xs tracking-wider dark:text-neutral-100">
						{safeItemCount} {safeArticlesOfTotal}
					</span>
				</div>

				<div class="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wider dark:text-neutral-600">
					<span safe>{t.page}</span>
					<span class="font-medium text-neutral-900 dark:text-neutral-100">{safePage}</span>
					{!!t.total && <span safe>{t.total}</span>}
					<span>/</span>
					<span safe>{t.of}</span>
					<span class="font-medium text-neutral-900 dark:text-neutral-100">{safeTotalPages}</span>
					{!!t.pages && <span safe>{t.pages}</span>}
				</div>

				<div class="flex items-center gap-4">
					<a
						aria-disabled={!hasPrev}
						aria-label={t.previousPage}
						class={`font-medium text-xs uppercase tracking-widest transition-opacity ${
							hasPrev
								? "text-neutral-900 hover:opacity-70 dark:text-neutral-100"
								: "cursor-not-allowed text-neutral-300 dark:text-neutral-700"
						}`}
						href={prevUrl}
					>
						<span safe>{t.previousPage}</span>
					</a>
					<a
						aria-disabled={!hasNext}
						aria-label={t.nextPage}
						class={`font-medium text-xs uppercase tracking-widest transition-opacity ${
							hasNext
								? "text-neutral-900 hover:opacity-70 dark:text-neutral-100"
								: "cursor-not-allowed text-neutral-300 dark:text-neutral-700"
						}`}
						href={nextUrl}
					>
						<span safe>{t.nextPage}</span>
					</a>
				</div>
			</div>
		</div>
	);
}
