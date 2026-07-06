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
			class="fixed inset-0 z-[60] flex h-screen w-screen items-center justify-center bg-neutral-950/98 backdrop-blur-2xl"
			data-show="$filterBar"
		>
			<div class="relative mx-auto w-full max-w-xl px-6">
				<button
					aria-label={t.closeFilterBar}
					class="absolute -top-16 right-0 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white/20 hover:text-white"
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
						class="mb-4 block font-medium text-white/40 text-xs uppercase tracking-[0.2em]"
						for="search"
					>
						<span safe>{t.searchArticles}</span>
					</label>
					<div class="relative">
						<input
							class="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-lg text-white placeholder-white/20 outline-none backdrop-blur-sm transition-all focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
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
							class="absolute top-1/2 right-3 -translate-y-1/2 rounded-xl bg-emerald-500 px-5 py-2.5 font-medium text-sm text-white transition-all hover:bg-emerald-400 hover:shadow-emerald-500/25 hover:shadow-lg"
							type="submit"
						>
							<span safe>{t.search}</span>
						</button>
					</div>
				</form>

				<div>
					<span class="mb-5 block font-medium text-white/40 text-xs uppercase tracking-[0.2em]">
						<span safe>{t.filterByCategory}</span>
					</span>
					<div class="flex flex-wrap gap-2">
						<a
							class={`rounded-full px-5 py-2.5 font-medium text-sm transition-all ${
								category === "all"
									? "bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg"
									: "bg-white/10 text-white/60 backdrop-blur-sm hover:bg-white/20 hover:text-white"
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
									class={`rounded-full px-5 py-2.5 font-medium text-sm transition-all ${
										category === cat.name
											? "bg-emerald-500 text-white shadow-emerald-500/25 shadow-lg"
											: "bg-white/10 text-white/60 backdrop-blur-sm hover:bg-white/20 hover:text-white"
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
					<div class="mt-10 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
						<span class="text-white/40 text-xs uppercase tracking-wider">
							<span safe>{t.currentFilter}</span>{" "}
							<span class="text-white/80">
								{category !== "all" ? category : ""} {search ? `「${search}」` : ""}
							</span>
						</span>

						<a
							class="font-medium text-emerald-400 text-xs underline underline-offset-4 transition-opacity hover:opacity-70"
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
