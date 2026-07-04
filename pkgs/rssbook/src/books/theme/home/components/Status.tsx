import type { FilterInfo, PaginationInfo } from "@/types";

interface StatusProps {
	pagination: PaginationInfo;
	itemCount: number;
	filter: FilterInfo;
}

export function Status({ pagination, itemCount, filter }: StatusProps) {
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

	return (
		<div class="mx-auto mt-12 max-w-4xl md:mt-16">
			<div class="rounded-2xl bg-white/60 p-6 shadow-lg shadow-rose-100/50 ring-1 ring-stone-200/50 backdrop-blur-xl dark:bg-stone-900/60 dark:shadow-rose-950/50 dark:ring-stone-800/50">
				<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-2">
							<div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
							<span class="font-medium text-sm text-stone-600 dark:text-stone-400">已加载</span>
						</div>
						<span class="font-bold text-sm text-stone-900 dark:text-stone-100">
							{itemCount} 篇文章 / 共 {total} 篇
						</span>
					</div>

					<div class="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
						<span>第</span>
						<span class="rounded-lg bg-rose-100 px-3 py-1 font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
							{page}
						</span>
						<span>页</span>
						<span class="text-stone-400 dark:text-stone-500">/</span>
						<span>共</span>
						<span class="font-bold text-stone-900 dark:text-stone-100">{totalPages}</span>
						<span>页</span>
					</div>

					<div class="flex items-center gap-2">
						<a
							aria-disabled={!hasPrev}
							aria-label="上一页"
							class={`rounded-xl px-4 py-2 font-medium text-sm ring-1 transition-all duration-200 ${
								hasPrev
									? "bg-white/80 text-stone-600 ring-stone-200/50 hover:bg-rose-50 hover:text-rose-600 dark:bg-stone-800/80 dark:text-stone-400 dark:ring-stone-700/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
									: "cursor-not-allowed bg-stone-100 text-stone-400 opacity-50 ring-stone-200/50 dark:bg-stone-800/50 dark:text-stone-600 dark:ring-stone-700/50"
							}`}
							href={prevUrl}
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<title>上一页</title>
								<path
									d="M15 19l-7-7 7-7"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								/>
							</svg>
						</a>
						<a
							aria-disabled={!hasNext}
							aria-label="下一页"
							class={`rounded-xl px-4 py-2 font-medium text-sm ring-1 transition-all duration-200 ${
								hasNext
									? "bg-white/80 text-stone-600 ring-stone-200/50 hover:bg-rose-50 hover:text-rose-600 dark:bg-stone-800/80 dark:text-stone-400 dark:ring-stone-700/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
									: "cursor-not-allowed bg-stone-100 text-stone-400 opacity-50 ring-stone-200/50 dark:bg-stone-800/50 dark:text-stone-600 dark:ring-stone-700/50"
							}`}
							href={nextUrl}
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<title>下一页</title>
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
		</div>
	);
}
