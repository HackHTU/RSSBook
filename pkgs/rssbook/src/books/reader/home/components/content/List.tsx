import type { DataItem, FilterInfo } from "@/types";
import type { Translations } from "../../i18n";
import { Item } from "./Item";

interface ListProps {
	items: DataItem[];
	filter: FilterInfo;
	t: Translations;
}

export function List({ items, filter, t }: ListProps) {
	const { search, category } = filter;
	const hasFilter = !!search || category !== "all";
	const clearUrl = `/?limit=20&page=1`;

	return (
		<div>
			{hasFilter && (
				<div class="mb-6 flex flex-wrap items-center gap-3 border-zinc-100 border-b pb-4 dark:border-zinc-800">
					<div class="flex flex-wrap items-center gap-2 text-sm">
						{!!search && (
							<span class="text-zinc-500 dark:text-zinc-400">
								<span safe>{t.searchResultsFor}</span>{" "}
								<span class="font-medium text-zinc-900 dark:text-zinc-100" safe>
									「{search}」
								</span>
							</span>
						)}
						{category !== "all" && (
							<span class="text-zinc-500 dark:text-zinc-400">
								<span safe>{t.filteredByCategory}</span>{" "}
								<span class="font-medium text-zinc-900 dark:text-zinc-100" safe>
									{category}
								</span>
							</span>
						)}
					</div>
					<a
						class="ml-auto font-medium text-blue-600 text-sm transition-opacity hover:opacity-70 dark:text-blue-400"
						href={clearUrl}
					>
						<span safe>{t.clearAll}</span>
					</a>
				</div>
			)}

			{items.length === 0 ? (
				<div class="py-20 text-center">
					<p class="text-zinc-400 dark:text-zinc-500">
						<span safe>{t.noContent}</span>
					</p>
				</div>
			) : (
				<div>
					{items.map((item) => (
						<Item item={item} t={t} />
					))}
				</div>
			)}
		</div>
	);
}
