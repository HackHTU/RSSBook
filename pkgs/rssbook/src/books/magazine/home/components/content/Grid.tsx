import type { DataItem, FilterInfo } from "@/types";
import type { Translations } from "../../i18n";
import { Item } from "./Item";

interface GridProps {
	items: DataItem[];
	filter: FilterInfo;
	t: Translations;
}

const GRID_PATTERNS: Array<"wide" | "normal"> = [
	"wide",
	"normal",
	"normal",
	"normal",
	"wide",
	"normal",
	"normal",
	"normal",
];

function getVariant(index: number): "wide" | "normal" {
	return GRID_PATTERNS[index % GRID_PATTERNS.length];
}

export function Grid({ items, filter, t }: GridProps) {
	const { search, category } = filter;
	const hasFilter = !!search || category !== "all";
	const clearUrl = `/?limit=20&page=1`;

	return (
		<div class="mx-auto max-w-7xl px-6 py-12 lg:px-12">
			{hasFilter && (
				<div class="mb-10 flex flex-wrap items-center gap-3 border-neutral-200/60 border-b pb-6 dark:border-neutral-800/60">
					<div class="flex flex-wrap items-center gap-3 text-xs">
						{!!search && (
							<span class="font-semibold text-neutral-500 uppercase tracking-[0.15em] dark:text-neutral-500">
								<span safe>{t.searchResultsFor}</span>{" "}
								<span class="text-neutral-900 dark:text-neutral-100" safe>
									「{search}」
								</span>
							</span>
						)}
						{category !== "all" && (
							<span class="font-semibold text-neutral-500 uppercase tracking-[0.15em] dark:text-neutral-500">
								<span safe>{t.filteredByCategory}</span>{" "}
								<span class="text-neutral-900 dark:text-neutral-100" safe>
									{category}
								</span>
							</span>
						)}
					</div>
					<a
						class="ml-auto font-semibold text-red-600 text-xs underline underline-offset-4 transition-opacity hover:opacity-70 dark:text-red-500"
						href={clearUrl}
					>
						<span safe>{t.clearAll}</span>
					</a>
				</div>
			)}

			{items.length === 0 ? (
				<div class="py-20 text-center">
					<p class="font-black font-serif text-2xl text-neutral-300 dark:text-neutral-700">
						<span safe>{t.noContent}</span>
					</p>
				</div>
			) : (
				<div
					class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
					style="grid-auto-flow: dense;"
				>
					{items.map((item, index) => {
						const variant = getVariant(index);
						return (
							<div class={variant === "wide" ? "lg:col-span-2" : ""}>
								<Item item={item} t={t} />
							</div>
						);
					})}
				</div>
			)}

			<div class="mt-12 border-neutral-200/60 border-t pt-6 dark:border-neutral-800/60">
				<p class="font-semibold text-[10px] text-neutral-400 uppercase tracking-[0.25em] dark:text-neutral-600">
					<span safe>{items.length === 0 ? t.noContent : t.pageContentDisplayed}</span>
				</p>
			</div>
		</div>
	);
}
