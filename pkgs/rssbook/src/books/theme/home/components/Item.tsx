import type { DataItem } from "@/types";

interface Item {
	item: DataItem;
	index: number;
}

export function Item({ item }: Item) {
	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const formatTime = (date: Date) => {
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	return (
		<article class="group relative">
			<div class="absolute top-8 -left-13 hidden md:block">
				<div class="relative">
					<div class="absolute top-1/2 left-1/2 h-[2px] w-8 -translate-y-1/2 bg-gradient-to-r from-rose-500/50 to-rose-400/30 dark:from-rose-700/50 dark:to-rose-600/30"></div>

					<div class="relative z-1 h-4 w-4 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-md shadow-rose-300/50 ring-4 ring-white/80 transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg dark:from-rose-600 dark:to-rose-700 dark:shadow-rose-900/50 dark:ring-stone-900/80">
						<div class="absolute inset-0 rounded-full bg-rose-400 opacity-0 group-hover:animate-ping group-hover:opacity-100 dark:bg-rose-600"></div>
					</div>
				</div>
			</div>

			<div class="relative overflow-hidden rounded-3xl bg-white/80 shadow-rose-100/50 shadow-sm ring-1 ring-stone-200/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg hover:shadow-rose-200/60 dark:bg-stone-900/80 dark:shadow-rose-900/50 dark:ring-stone-800/50 dark:hover:shadow-rose-950/30">
				<div class="relative z-10 p-6 md:p-8">
					<div class="mb-4 flex flex-wrap items-start justify-between gap-4">
						<div class="flex items-center gap-3">
							<time
								class="inline-flex items-center gap-2 rounded-xl bg-rose-100/70 px-3 py-1.5 font-medium text-rose-700 text-sm dark:bg-rose-900/30 dark:text-rose-300"
								datetime={item.date?.toISOString()}
							>
								<svg
									aria-hidden="true"
									class="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
									/>
								</svg>
								<span>{item.date ? formatDate(item.date) : "未知日期"}</span>
								<span class="text-rose-400 dark:text-rose-500">·</span>
								<span>{item.date ? formatTime(item.date) : ""}</span>
							</time>
						</div>

						{!!item.category && item.category.length > 0 && (
							<div class="flex flex-wrap gap-2">
								{item.category.map((cat) => (
									<span
										class="rounded-lg bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1 font-medium text-orange-700 text-xs ring-1 ring-orange-200/50 dark:from-orange-950/30 dark:to-amber-950/30 dark:text-orange-300 dark:ring-orange-800/50"
										safe
									>
										{cat.name}
									</span>
								))}
							</div>
						)}
					</div>

					<h2 class="mb-3 font-bold text-stone-900 text-xl leading-tight transition-colors duration-200 group-hover:text-rose-700 md:text-2xl dark:text-stone-100 dark:group-hover:text-rose-400">
						{item.link ? (
							<a
								class="decoration-2 decoration-rose-500/50 underline-offset-4 hover:underline"
								href={item.link}
								rel="noopener noreferrer"
								safe
								target="_blank"
							>
								{item.title}
							</a>
						) : (
							<span safe>{item.title}</span>
						)}
					</h2>

					{!!item.description && (
						<p class="mb-4 text-base text-stone-600 leading-relaxed dark:text-stone-400" safe>
							{item.description}
						</p>
					)}

					{!!item.author && item.author.length > 0 && (
						<div class="flex items-center gap-2 border-stone-200/50 border-t pt-4 dark:border-stone-800/50">
							<svg
								aria-hidden="true"
								class="h-5 w-5 text-stone-400 dark:text-stone-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								/>
							</svg>
							<div class="flex flex-wrap gap-2">
								{item.author.map((author, idx) => {
									const authorLength = item.author?.length || 0;
									return (
										<span>
											{author.link ? (
												<a
													class="font-medium text-rose-600 text-sm hover:text-rose-700 hover:underline dark:text-rose-400 dark:hover:text-rose-300"
													href={author.link}
													rel="noopener noreferrer"
													safe
													target="_blank"
												>
													{author.name}
												</a>
											) : (
												<span class="font-medium text-sm text-stone-700 dark:text-stone-300" safe>
													{author.name}
												</span>
											)}
											{idx < authorLength - 1 && (
												<span class="text-stone-400 dark:text-stone-500">, </span>
											)}
										</span>
									);
								})}
							</div>
						</div>
					)}

					{!!item.enclosure && (
						<div class="mt-4 rounded-xl bg-stone-100/50 p-4 dark:bg-stone-800/50">
							<div class="flex items-center gap-3">
								{item.enclosure.type?.startsWith("audio/") && (
									<svg
										aria-hidden="true"
										class="h-5 w-5 text-rose-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
										/>
									</svg>
								)}
								<div class="min-w-0 flex-1">
									<p class="truncate font-medium text-sm text-stone-700 dark:text-stone-300" safe>
										{item.enclosure.title || "媒体附件"}
									</p>
									{item.enclosure.duration && (
										<p class="text-stone-500 text-xs dark:text-stone-400">
											时长：
											<span>{Math.floor(item.enclosure.duration / 60)}</span>:
											<span safe>{String(item.enclosure.duration % 60).padStart(2, "0")}</span>
										</p>
									)}
								</div>
								<a
									class="rounded-lg bg-rose-600 px-3 py-1.5 font-medium text-sm text-white transition-colors duration-200 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
									href={item.enclosure.url}
									rel="noopener noreferrer"
									target="_blank"
								>
									播放
								</a>
							</div>
						</div>
					)}
				</div>

				<div class="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:via-rose-700/50"></div>
			</div>
		</article>
	);
}
