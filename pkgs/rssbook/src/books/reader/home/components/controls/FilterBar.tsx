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
			class="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-white/95 backdrop-blur-sm dark:bg-zinc-950/95"
			data-show="$filiterBar"
		>
			<div class="relative mx-auto w-full max-w-xl px-6">
				<button
					aria-label={t.closeFilterBar}
					class="absolute -top-12 right-0 font-medium text-sm text-zinc-400 transition-opacity hover:opacity-70 dark:text-zinc-500"
					data-on-click="$filiterBar = false"
					type="button"
				>
					✕
				</button>

				<form action="/" class="mb-10" method="get">
					<label
						class="mb-3 block font-medium text-sm text-zinc-500 dark:text-zinc-400"
						for="search"
					>
						<span safe>{t.searchArticles}</span>
					</label>
					<div class="relative">
						<input
							class="w-full border-zinc-200 border-b bg-transparent py-4 pr-20 pl-0 text-xl text-zinc-900 placeholder-zinc-300 outline-none transition-colors focus:border-zinc-900 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-zinc-100"
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
							class="absolute right-0 bottom-4 font-medium text-blue-600 text-sm transition-opacity hover:opacity-70 dark:text-blue-400"
							type="submit"
						>
							<span safe>{t.search}</span>
						</button>
					</div>
				</form>

				<div>
					<span class="mb-4 block font-medium text-sm text-zinc-500 dark:text-zinc-400">
						<span safe>{t.filterByCategory}</span>
					</span>
					<div class="flex flex-wrap gap-2">
						<a
							class={`rounded-full px-3 py-1 text-sm transition-colors ${
								category === "all"
									? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
									: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
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
									class={`rounded-full px-3 py-1 text-sm transition-colors ${
										category === cat.name
											? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
											: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
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
					<div class="mt-8 flex items-center justify-between">
						<span class="text-sm text-zinc-500 dark:text-zinc-400">
							<span safe>{t.currentFilter}</span>{" "}
							<span class="font-medium text-zinc-900 dark:text-zinc-100">
								{category !== "all" ? category : ""} {search ? `「${search}」` : ""}
							</span>
						</span>

						<a
							class="font-medium text-blue-600 text-sm transition-opacity hover:opacity-70 dark:text-blue-400"
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
