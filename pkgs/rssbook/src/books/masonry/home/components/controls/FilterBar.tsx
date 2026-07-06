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
			class="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-white/95 backdrop-blur-xl dark:bg-stone-950/95"
			data-show="$filterBar"
		>
			<div class="relative mx-auto w-full max-w-xl px-6">
				<button
					aria-label={t.closeFilterBar}
					class="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600 dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
					data-on-click="$filterBar = false"
					type="button"
				>
					<svg
						aria-hidden="true"
						class="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							d="M6 18L18 6M6 6l12 12"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
						/>
					</svg>
				</button>

				<form action="/" class="mb-10" method="get">
					<label
						class="mb-3 block font-medium text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500"
						for="search"
					>
						<span safe>{t.searchArticles}</span>
					</label>
					<div class="relative">
						<input
							class="w-full rounded-xl border border-stone-200 bg-stone-50 px-5 py-4 text-lg text-stone-900 placeholder-stone-300 outline-none transition-all focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder-stone-600 dark:focus:border-rose-500 dark:focus:ring-rose-500/10"
							id="search"
							name="search"
							placeholder={t.enterKeywords}
							type="text"
							value={search}
						/>

						{category !== "all" && <input name="category" type="hidden" value={category} />}
						<input name="limit" type="hidden" value={limit.toString()} />
						<input name="page" type="hidden" value="1" />
						<button
							class="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-rose-500 px-4 py-2 font-medium text-sm text-white transition-opacity hover:opacity-80"
							type="submit"
						>
							<span safe>{t.search}</span>
						</button>
					</div>
				</form>

				<div>
					<span class="mb-4 block font-medium text-stone-400 text-xs uppercase tracking-widest dark:text-stone-500">
						<span safe>{t.filterByCategory}</span>
					</span>
					<div class="flex flex-wrap gap-2">
						<a
							class={`rounded-full px-4 py-2 font-medium text-sm transition-all ${
								category === "all"
									? "bg-rose-500 text-white shadow-rose-500/25 shadow-sm"
									: "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
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
									class={`rounded-full px-4 py-2 font-medium text-sm transition-all ${
										category === cat.name
											? "bg-rose-500 text-white shadow-rose-500/25 shadow-sm"
											: "bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
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
					<div class="mt-8 flex items-center justify-between rounded-xl bg-stone-50 p-4 dark:bg-stone-900">
						<span class="text-stone-400 text-xs uppercase tracking-wider dark:text-stone-500">
							<span safe>{t.currentFilter}</span>{" "}
							<span class="text-stone-700 dark:text-stone-300">
								{category !== "all" ? category : ""} {search ? `「${search}」` : ""}
							</span>
						</span>

						<a
							class="font-medium text-rose-500 text-xs underline underline-offset-4 transition-opacity hover:opacity-70"
							href={clearFilterUrl}
						>
							<span safe>{t.clearFilter}</span>
						</a>
					</div>
				)}
			</div>
		</div>
	);
}
