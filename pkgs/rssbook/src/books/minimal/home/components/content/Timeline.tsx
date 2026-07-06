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
		<div class="mx-auto max-w-3xl lg:ml-64 lg:max-w-none">
			<div class="relative">
				<div class="absolute top-0 bottom-0 left-4 w-px bg-neutral-200 md:left-8 dark:bg-neutral-800"></div>

				<div class="ml-12 md:ml-20">
					{hasFilter && (
						<div class="mb-8 flex flex-wrap items-center gap-3 py-4">
							<div class="flex flex-wrap items-center gap-2 text-xs">
								{!!search && (
									<span class="font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-500">
										<span safe>{t.searchResultsFor}</span>{" "}
										<span class="text-neutral-900 dark:text-neutral-100" safe>
											「{search}」
										</span>
									</span>
								)}
								{category !== "all" && (
									<span class="font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-500">
										<span safe>{t.filteredByCategory}</span>{" "}
										<span class="text-neutral-900 dark:text-neutral-100" safe>
											{category}
										</span>
									</span>
								)}
							</div>
							<a
								class="font-medium text-neutral-400 text-xs underline underline-offset-4 transition-opacity hover:opacity-70 dark:text-neutral-600"
								href={clearUrl}
							>
								<span safe>{t.clearAll}</span>
							</a>
						</div>
					)}

					<div class="divide-y divide-neutral-100 dark:divide-neutral-800">
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

					<div class="py-8">
						<p class="text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600">
							<span safe>{items.length === 0 ? t.noContent : t.pageContentDisplayed}</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
