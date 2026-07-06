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
			class="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-white/95 backdrop-blur-sm dark:bg-neutral-950/95"
			data-show="$filiterBar"
		>
			<div class="relative mx-auto w-full max-w-2xl px-6">
				<form action="/" class="mb-8" method="get">
					<label
						class="mb-3 block font-medium text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600"
						for="search"
					>
						<span safe>{t.searchArticles}</span>
					</label>
					<div class="relative">
						<input
							class="w-full border-neutral-200 border-b bg-transparent py-4 pr-24 pl-0 font-serif text-2xl text-neutral-900 placeholder-neutral-300 outline-none transition-colors focus:border-neutral-900 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-700 dark:focus:border-neutral-100"
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
							class="absolute right-0 bottom-4 font-medium text-neutral-900 text-xs uppercase tracking-widest transition-opacity hover:opacity-70 dark:text-neutral-100"
							type="submit"
						>
							<span safe>{t.search}</span>
						</button>
					</div>
				</form>

				<div>
					<span class="mb-4 block font-medium text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600">
						<span safe>{t.filterByCategory}</span>
					</span>
					<div class="flex flex-wrap gap-x-6 gap-y-2">
						<a
							class={`font-medium text-sm transition-opacity ${
								category === "all"
									? "text-neutral-900 dark:text-neutral-100"
									: "text-neutral-400 hover:opacity-70 dark:text-neutral-600"
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
									class={`font-medium text-sm transition-opacity ${
										category === cat.name
											? "text-neutral-900 dark:text-neutral-100"
											: "text-neutral-400 hover:opacity-70 dark:text-neutral-600"
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
						<span class="text-neutral-400 text-xs uppercase tracking-wider dark:text-neutral-600">
							<span safe>{t.currentFilter}</span>{" "}
							<span class="text-neutral-900 dark:text-neutral-100">
								{category !== "all" ? category : ""} {search ? `「${search}」` : ""}
							</span>
						</span>

						<a
							class="font-medium text-neutral-400 text-xs underline underline-offset-4 transition-opacity hover:opacity-70 dark:text-neutral-600"
							href={clearFilterUrl}
						>
							<span safe>{t.clearFilter}</span>
						</a>
					</div>
				)}

				<button
					aria-label={t.closeFilterBar}
					class="absolute top-0 right-0 font-medium text-neutral-400 text-xs uppercase tracking-widest transition-opacity hover:opacity-70 dark:text-neutral-600"
					data-on-click="$filiterBar = false"
					type="button"
				>
					Close
				</button>
			</div>
		</div>
	);
}
