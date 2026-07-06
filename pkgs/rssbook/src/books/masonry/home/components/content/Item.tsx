import type { DataItem } from "@/types";
import { formatHTML } from "@/utils";
import type { Translations } from "../../i18n";

interface ItemProps {
	item: DataItem;
	index: number;
	t: Translations;
}

export function Item({ item, t }: ItemProps) {
	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const imageUrl = typeof item.image === "string" ? item.image : item.image?.url;
	const hasImage = !!imageUrl;
	const hasDescription = !!item.description && item.description.length > 0;
	const descriptionLength = item.description?.length || 0;
	const safeDescription = item.description ? formatHTML(item.description) : "";
	const safeDurationMinutes = Math.floor((item.enclosure?.duration ?? 0) / 60);
	const safeDurationSeconds = String((item.enclosure?.duration ?? 0) % 60).padStart(2, "0");

	return (
		<article class="group mb-4 break-inside-avoid">
			<div class="overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 dark:border-stone-800/60 dark:bg-stone-900 dark:hover:shadow-rose-500/5">
				{hasImage && (
					<a
						class="block overflow-hidden"
						href={item.link}
						rel="noopener noreferrer"
						target="_blank"
					>
						<img
							alt={item.title || ""}
							class="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
							src={imageUrl}
						/>
					</a>
				)}

				<div class="p-5">
					{!!item.category && item.category.length > 0 && (
						<div class="mb-3 flex flex-wrap gap-1.5">
							{item.category.map((cat) => (
								<span
									class="inline-block rounded-full bg-rose-50 px-2.5 py-0.5 font-medium text-rose-600 text-xs dark:bg-rose-950/50 dark:text-rose-400"
									safe
								>
									{cat.name}
								</span>
							))}
						</div>
					)}

					<h2 class="font-bold text-base text-stone-900 leading-snug tracking-tight dark:text-stone-100">
						{item.link ? (
							<a
								class="transition-colors hover:text-rose-500 dark:hover:text-rose-400"
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

					{hasDescription && (
						<p
							class={`mt-2.5 text-sm text-stone-500 leading-relaxed dark:text-stone-400 ${descriptionLength > 150 ? "line-clamp-4" : ""}`}
						>
							{safeDescription}
						</p>
					)}

					<div class="mt-4 flex items-center justify-between border-stone-100 border-t pt-3 dark:border-stone-800">
						<div class="flex items-center gap-2">
							{!!item.author && item.author.length > 0 && (
								<div class="flex items-center gap-1.5">
									{item.author.slice(0, 2).map((author, idx) => (
										<span>
											{author.link ? (
												<a
													class="text-stone-400 text-xs transition-colors hover:text-rose-500 dark:text-stone-500 dark:hover:text-rose-400"
													href={author.link}
													rel="noopener noreferrer"
													safe
													target="_blank"
												>
													{author.name}
												</a>
											) : (
												<span class="text-stone-400 text-xs dark:text-stone-500" safe>
													{author.name}
												</span>
											)}
											{idx < Math.min(item.author?.length || 0, 2) - 1 && (
												<span class="text-stone-300 dark:text-stone-700">·</span>
											)}
										</span>
									))}
								</div>
							)}
						</div>

						<time
							class="text-stone-400 text-xs dark:text-stone-500"
							datetime={item.date?.toISOString()}
						>
							<span safe>{item.date ? formatDate(item.date) : t.unknownDate}</span>
						</time>
					</div>

					{!!item.enclosure && (
						<div class="mt-3 flex items-center gap-3 rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50">
							<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
								<svg
									aria-hidden="true"
									class="h-4 w-4 text-rose-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
									/>
									<path
										d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
									/>
								</svg>
							</div>
							<div class="min-w-0 flex-1">
								<p class="truncate font-medium text-stone-700 text-xs dark:text-stone-300" safe>
									{item.enclosure.title || t.mediaAttachment}
								</p>
								{!!item.enclosure.duration && (
									<p class="text-stone-400 text-xs dark:text-stone-500">
										{safeDurationMinutes}:{safeDurationSeconds}
									</p>
								)}
							</div>
							<a
								class="flex-shrink-0 rounded-full bg-rose-500 px-3 py-1 font-medium text-white text-xs transition-opacity hover:opacity-80"
								href={item.enclosure.url}
								rel="noopener noreferrer"
								target="_blank"
							>
								<span safe>{t.play}</span>
							</a>
						</div>
					)}
				</div>
			</div>
		</article>
	);
}
