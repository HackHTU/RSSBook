import type { FilterInfo, PaginationInfo } from "@/types";

interface FilterBarProps {
	categories: { name: string }[];
	filter: FilterInfo;
	pagination: PaginationInfo;
}

export function FilterBar({ categories, filter, pagination }: FilterBarProps) {
	const { search, category } = filter;
	const { limit } = pagination;

	// 预先计算所有分类的 URL（服务端渲染）
	const allCategoryUrl = search
		? `/?search=${encodeURIComponent(search)}&limit=${limit}&page=1`
		: `/?limit=${limit}&page=1`;
	const clearFilterUrl = `/?limit=${limit}&page=1`;

	return (
		<div
			class="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center backdrop-blur-md transition-all transition-delay-150"
			data-show="$filiterBar"
		>
			<div class="relative mx-auto max-h-[90vh] w-full max-w-4xl animate-duration-300 animate-zoom-in-up overflow-hidden px-4">
				<div class="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white/70 shadow-lg shadow-rose-100/50 ring-1 ring-stone-200/50 backdrop-blur-xl dark:bg-stone-900/70 dark:shadow-rose-950/50 dark:ring-stone-800/50">
					<div class="overflow-y-auto p-6 md:p-8">
						<form action="/" class="mb-6" method="get">
							<label
								class="mb-2 block font-medium text-sm text-stone-700 dark:text-stone-300"
								for="search"
							>
								搜索文章
							</label>
							<div class="relative">
								<input
									class="w-full rounded-2xl border border-stone-300/50 bg-white/80 px-4 py-3 pr-24 pl-11 text-stone-900 placeholder-stone-400 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:border-stone-700/50 dark:bg-stone-800/80 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:ring-rose-400/50"
									id="search"
									name="search"
									placeholder="输入关键词..."
									type="text"
									value={search}
								/>

								{category !== "all" && <input name="category" type="hidden" value={category} />}
								<input name="limit" type="hidden" value={limit.toString()} />
								<input name="page" type="hidden" value="1" />
								<svg
									aria-hidden="true"
									class="absolute top-3.5 left-3.5 h-5 w-5 text-stone-400 dark:text-stone-500"
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
								<button
									class="absolute top-1.5 right-1.5 rounded-xl bg-rose-600 px-4 py-2 font-medium text-sm text-white transition-all duration-200 hover:bg-rose-700 active:scale-95 dark:bg-rose-500 dark:hover:bg-rose-600"
									type="submit"
								>
									搜索
								</button>
							</div>
						</form>

						<div>
							<span class="mb-3 block font-medium text-sm text-stone-700 dark:text-stone-300">
								按分类筛选
							</span>
							<div class="flex flex-wrap gap-2">
								<a
									class={`rounded-xl border px-4 py-2 font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
										category === "all"
											? "bg-rose-600 text-white shadow-md shadow-rose-200 dark:bg-rose-500 dark:shadow-rose-900/50"
											: "bg-white/60 text-stone-600 hover:bg-rose-50 dark:bg-stone-800/60 dark:text-stone-400 dark:hover:bg-rose-950/30"
									}`}
									href={allCategoryUrl}
								>
									全部
								</a>

								{categories.map((cat) => {
									const catUrl = search
										? `/?search=${encodeURIComponent(search)}&category=${encodeURIComponent(cat.name)}&limit=${limit}&page=1`
										: `/?category=${encodeURIComponent(cat.name)}&limit=${limit}&page=1`;
									return (
										<a
											class={`rounded-xl border px-4 py-2 font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${
												category === cat.name
													? "bg-rose-600 text-white shadow-md shadow-rose-200 dark:bg-rose-500 dark:shadow-rose-900/50"
													: "bg-white/60 text-stone-600 hover:bg-rose-50 dark:bg-stone-800/60 dark:text-stone-400 dark:hover:bg-rose-950/30"
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
							<div class="mt-4 flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
								<span>
									当前筛选:{" "}
									<span class="font-medium text-stone-900 dark:text-stone-100">
										{category !== "all" ? category : ""} {search ? `「${search}」` : ""}
									</span>
								</span>

								<a
									class="rounded-lg bg-stone-200/60 px-3 py-1 text-stone-600 transition-all duration-200 hover:bg-stone-300/60 dark:bg-stone-700/60 dark:text-stone-400 dark:hover:bg-stone-600/60"
									href={clearFilterUrl}
								>
									清除筛选
								</a>
							</div>
						)}
					</div>

					<button
						aria-label="关闭筛选栏"
						class="absolute top-5 right-5 rounded-xl bg-white/80 p-2 text-stone-700 ring-1 ring-stone-200/50 transition-all duration-200 hover:scale-110 hover:bg-rose-50 active:scale-95 dark:bg-stone-800/80 dark:text-stone-300 dark:ring-stone-700/50 dark:hover:bg-rose-950/30"
						data-on-click="$filiterBar = false"
						type="button"
					>
						<svg
							aria-hidden="true"
							class="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M6 18L18 6M6 6l12 12"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
