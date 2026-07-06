import type { DataItem, FilterInfo } from "@/types";
import type { Translations } from "../../i18n";
import { Item } from "./Item";

interface GridProps {
	items: DataItem[];
	filter: FilterInfo;
	t: Translations;
}

export function Grid({ items, filter, t }: GridProps) {
	const { search, category } = filter;
	const hasFilter = !!search || category !== "all";
	const clearUrl = `/?limit=20&page=1`;

	return (
		<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			{hasFilter && (
				<div class="mb-8 flex flex-wrap items-center gap-3">
					<div class="flex flex-wrap items-center gap-2 text-xs">
						{!!search && (
							<span class="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
								<span safe>{t.searchResultsFor}</span>{" "}
								<span class="text-stone-900 dark:text-stone-100" safe>
									「{search}」
								</span>
							</span>
						)}
						{category !== "all" && (
							<span class="rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
								<span safe>{t.filteredByCategory}</span>{" "}
								<span class="text-rose-700 dark:text-rose-300" safe>
									{category}
								</span>
							</span>
						)}
					</div>
					<a
						class="font-medium text-stone-400 text-xs underline underline-offset-4 transition-opacity hover:opacity-70 dark:text-stone-500"
						href={clearUrl}
					>
						<span safe>{t.clearAll}</span>
					</a>
				</div>
			)}

			<div class="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
				{items.map((item, index) => (
					<Item
						data-show={`
							($selectedCategory === 'all' || $item.category?.some(cat => cat.name === $selectedCategory)) &&
							($searchQuery === '' || $item.title?.toLowerCase().includes($searchQuery.toLowerCase()) || $item.description?.toLowerCase().includes($searchQuery.toLowerCase()))
						`}
						index={index}
						item={item}
						t={t}
					/>
				))}
			</div>

			{items.length === 0 && (
				<div class="flex flex-col items-center justify-center py-24">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
						<svg
							aria-hidden="true"
							class="h-8 w-8 text-stone-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
							/>
						</svg>
					</div>
					<p class="font-medium text-sm text-stone-400 dark:text-stone-500">
						<span safe>{t.noContent}</span>
					</p>
				</div>
			)}

			<div class="mt-8 text-center">
				<p class="text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500">
					<span safe>{items.length === 0 ? "" : t.pageContentDisplayed}</span>
				</p>
			</div>
		</div>
	);
}
