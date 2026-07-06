import type { DataItem, FilterInfo } from "@/types";
import type { Translations } from "../../i18n";
import { Item } from "./Item";

interface TimelineProps {
	items: DataItem[];
	filter: FilterInfo;
	t: Translations;
}

export function Timeline({ items, filter, t }: TimelineProps) {
	const { search, category } = filter;
	const hasFilter = !!search || category !== "all";
	const clearUrl = `/?limit=20&page=1`;

	return (
		<div class="mx-auto max-w-5xl animate-fade-in">
			<div class="relative">
				<div class="absolute top-0 bottom-0 left-0 hidden w-1 rounded-full bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 shadow-lg shadow-rose-300/50 md:block md:w-1.5 dark:from-rose-600 dark:via-rose-700 dark:to-rose-800 dark:shadow-rose-900/50">
					<div class="absolute left-1/2 h-full w-[2px] -translate-x-1/2 bg-gradient-to-b from-rose-300/30 via-rose-200/50 to-rose-300/30 dark:from-rose-900/30 dark:via-rose-800/50 dark:to-rose-900/30"></div>
				</div>

				<div class="mb-8 flex items-center justify-center md:hidden">
					<div class="h-1 w-32 rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 shadow-lg shadow-rose-300/50 dark:from-rose-600 dark:via-rose-700 dark:to-rose-800 dark:shadow-rose-900/50"></div>
				</div>

				<div class="space-y-8 md:space-y-12 md:pl-12">
					{hasFilter && (
						<div class="rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-stone-200/50 backdrop-blur-xl dark:bg-stone-900/70 dark:ring-stone-800/50">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<div class="flex flex-wrap items-center gap-2 text-sm">
									{!!search && (
										<span class="inline-flex items-center gap-1.5 rounded-lg bg-rose-100/70 px-3 py-1.5 font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
											<svg
												aria-hidden="true"
												class="h-3.5 w-3.5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
												/>
											</svg>
											<span safe>{t.searchResultsFor}</span>{" "}
											<span class="font-bold" safe>
												「{search}」
											</span>
										</span>
									)}
									{category !== "all" && (
										<span class="inline-flex items-center gap-1.5 rounded-lg bg-orange-100/70 px-3 py-1.5 font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
											<span safe>{t.filteredByCategory}</span>{" "}
											<span class="font-bold" safe>
												{category}
											</span>
										</span>
									)}
								</div>
								<a
									class="rounded-lg bg-stone-200/60 px-3 py-1.5 text-sm text-stone-600 transition-all duration-200 hover:bg-stone-300/60 dark:bg-stone-700/60 dark:text-stone-400 dark:hover:bg-stone-600/60"
									href={clearUrl}
								>
									<span safe>{t.clearAll}</span>
								</a>
							</div>
						</div>
					)}

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

				<div class="pt-8 md:pt-12 md:pl-12">
					<div class="flex items-center gap-4">
						<div class="relative -ml-14 hidden md:block">
							<div class="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-300/50 ring-4 ring-white/80 dark:from-rose-600 dark:to-rose-800 dark:shadow-rose-900/50 dark:ring-stone-900/80"></div>
							<div class="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-20 dark:bg-rose-600"></div>
						</div>

						<div class="flex-1 text-center md:text-left">
							<p class="font-medium text-sm text-stone-500 dark:text-stone-400">
								<span safe>{items.length === 0 ? t.noContent : t.pageContentDisplayed}</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
