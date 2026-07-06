import type { FilterInfo, PaginationInfo } from "@/types";
import type { Translations } from "../../i18n";

interface StatusProps {
	pagination: PaginationInfo;
	itemCount: number;
	filter: FilterInfo;
	t: Translations;
}

export function Status({ pagination, itemCount, filter, t }: StatusProps) {
	const { page, totalPages, total, limit, hasNext } = pagination;
	const { search, category } = filter;

	const buildPageUrl = (targetPage: number): string => {
		const parts = [`page=${targetPage}`, `limit=${limit}`];
		if (search) parts.push(`search=${encodeURIComponent(search)}`);
		if (category && category !== "all") parts.push(`category=${encodeURIComponent(category)}`);
		return `/?${parts.join("&")}`;
	};

	const nextUrl = hasNext ? buildPageUrl(page + 1) : undefined;
	const safeItemCount = itemCount;
	const safeArticlesOfTotal = t.articlesOfTotal.replace("{total}", String(total));
	const safePage = page;
	const safeTotalPages = totalPages;
	const safeStatusText = `${t.loaded} ${safeItemCount} ${safeArticlesOfTotal}`;
	const safePageText = `${t.page} ${safePage} / ${safeTotalPages}`;

	return (
		<div class="mx-auto max-w-[1800px] px-4 pb-16 sm:px-6 lg:px-10">
			<div class="flex flex-col items-center gap-6">
				<div class="flex items-center gap-4 text-neutral-500 text-sm dark:text-white/30">
					<span>{safeStatusText}</span>
					<span class="h-1 w-1 rounded-full bg-neutral-300 dark:bg-white/20"></span>
					<span>{safePageText}</span>
				</div>

				{hasNext && (
					<a
						class="group/btn inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50 px-8 py-3.5 font-medium text-neutral-600 text-sm backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-emerald-500/10 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300 dark:hover:shadow-emerald-500/10 dark:hover:shadow-lg"
						href={nextUrl}
					>
						<span safe>{t.loadMore}</span>
						<svg
							aria-hidden="true"
							class="h-4 w-4 transition-transform group-hover/btn:translate-y-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M19 14l-7 7m0 0l-7-7m7 7V3"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
							/>
						</svg>
					</a>
				)}
			</div>
		</div>
	);
}
