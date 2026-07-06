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
		<div class="mx-auto max-w-[1800px] px-4 pt-28 pb-12 sm:px-6 lg:px-10">
			{hasFilter && (
				<div class="mb-8 flex flex-wrap items-center gap-3">
					<div class="flex flex-wrap items-center gap-2 text-xs">
						{!!search && (
							<span class="rounded-full bg-white/10 px-3 py-1 font-medium text-white/70 backdrop-blur-sm">
								<span safe>{t.searchResultsFor}</span>{" "}
								<span class="text-white" safe>
									「{search}」
								</span>
							</span>
						)}
						{category !== "all" && (
							<span class="rounded-full bg-emerald-500/20 px-3 py-1 font-medium text-emerald-300 backdrop-blur-sm">
								<span safe>{t.filteredByCategory}</span>{" "}
								<span class="text-emerald-200" safe>
									{category}
								</span>
							</span>
						)}
					</div>
					<a
						class="font-medium text-white/40 text-xs underline underline-offset-4 transition-opacity hover:text-emerald-400 hover:opacity-100"
						href={clearUrl}
					>
						<span safe>{t.clearAll}</span>
					</a>
				</div>
			)}

			<div class="grid auto-rows-[180px] grid-cols-1 gap-3 sm:auto-rows-[220px] sm:grid-cols-2 md:auto-rows-[260px] md:grid-cols-3 lg:auto-rows-[300px] lg:grid-cols-4 xl:grid-cols-5">
				{items.map((item, index) => (
					<Item index={index} item={item} t={t} />
				))}
			</div>

			{items.length === 0 && (
				<div class="flex flex-col items-center justify-center py-32">
					<div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
						<svg
							aria-hidden="true"
							class="h-10 w-10 text-white/20"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
							/>
						</svg>
					</div>
					<p class="font-medium text-lg text-white/30">
						<span safe>{t.noContent}</span>
					</p>
				</div>
			)}
		</div>
	);
}
