import type { FilterInfo, PaginationInfo } from "@/types";
import type { Translations } from "../../i18n";

interface FilterBarProps {
	categories: { name: string }[];
	filter: FilterInfo;
	pagination: PaginationInfo;
	t: Translations;
}

export function FilterBar({ categories, filter, pagination, t }: FilterBarProps) {
	const { search, category } = filter;
	const { limit } = pagination;

	const allCategoryUrl = search
		? `/?search=${encodeURIComponent(search)}&limit=${limit}&page=1`
		: `/?limit=${limit}&page=1`;
	const clearFilterUrl = `/?limit=${limit}&page=1`;

	return (
		<div
			class="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-[#faf8f5]/95 backdrop-blur-xl dark:bg-[#1a1a1a]/95"
			data-show="$filterBar"
		>
			<div class="relative mx-auto w-full max-w-3xl px-6">
				<form action="/" class="mb-12" method="get">
					<label
						class="mb-4 block font-bold text-[10px] text-neutral-400 uppercase tracking-[0.3em] dark:text-neutral-600"
						for="search-magazine"
					>
						<span safe>{t.searchArticles}</span>
					</label>
					<div class="relative">
						<input
							class="w-full border-neutral-900 border-b-2 bg-transparent py-5 pr-28 pl-0 font-black font-serif text-3xl text-neutral-900 placeholder-neutral-300 outline-none transition-colors focus:border-red-600 dark:border-neutral-100 dark:text-neutral-100 dark:placeholder-neutral-700 dark:focus:border-red-500"
							id="search-magazine"
							name="search"
							placeholder={t.enterKeywords}
							type="text"
							value={search}
						/>

						{category !== "all" && <input name="category" type="hidden" value={category} />}
						<input name="limit" type="hidden" value={limit.toString()} />
						<input name="page" type="hidden" value="1" />
						<button
							class="absolute right-0 bottom-5 font-bold text-red-600 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-70 dark:text-red-500"
							type="submit"
						>
							<span safe>{t.search}</span>
						</button>
					</div>
				</form>

				<div>
					<span class="mb-5 block font-bold text-[10px] text-neutral-400 uppercase tracking-[0.3em] dark:text-neutral-600">
						<span safe>{t.filterByCategory}</span>
					</span>
					<div class="flex flex-wrap gap-x-8 gap-y-3">
						<a
							class={`font-semibold text-sm transition-colors ${
								category === "all"
									? "text-red-600 dark:text-red-500"
									: "text-neutral-400 hover:text-neutral-900 dark:text-neutral-600 dark:hover:text-neutral-100"
							}`}
							href={allCategoryUrl}
						>
							<span safe>{t.all}</span>
						</a>

						{categories.map((cat) => {
							const catUrl = search
								? `/?search=${encodeURIComponent(search)}&category=${encodeURIComponent(cat.name)}&limit=${limit}&page=1`
								: `/?category=${encodeURIComponent(cat.name)}&limit=${limit}&page=1`;
							return (
								<a
									class={`font-semibold text-sm transition-colors ${
										category === cat.name
											? "text-red-600 dark:text-red-500"
											: "text-neutral-400 hover:text-neutral-900 dark:text-neutral-600 dark:hover:text-neutral-100"
									}`}
									href={catUrl}
									safe
								>
									{cat.name}
								</a>
							);
						})}
					</div>
				</div>

				{(category !== "all" || !!search) && (
					<div class="mt-10 flex items-center justify-between border-neutral-200/60 border-t pt-6 dark:border-neutral-800/60">
						<span class="font-semibold text-neutral-500 text-xs uppercase tracking-[0.15em] dark:text-neutral-500">
							<span safe>{t.currentFilter}</span>{" "}
							<span class="text-neutral-900 dark:text-neutral-100">
								{category !== "all" ? category : ""} {search ? `「${search}」` : ""}
							</span>
						</span>

						<a
							class="font-semibold text-red-600 text-xs underline underline-offset-4 transition-opacity hover:opacity-70 dark:text-red-500"
							href={clearFilterUrl}
						>
							<span safe>{t.clearFilter}</span>
						</a>
					</div>
				)}

				<button
					aria-label={t.closeFilterBar}
					class="absolute top-0 right-0 p-2 font-bold text-neutral-400 text-xs uppercase tracking-[0.2em] transition-colors hover:text-neutral-900 dark:text-neutral-600 dark:hover:text-neutral-100"
					data-on:click="$filterBar = false"
					type="button"
				>
					Close
				</button>
			</div>
		</div>
	);
}
