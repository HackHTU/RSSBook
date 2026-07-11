import type { DataItem } from "@/types";
import { formatHTML } from "@/utils/formatHTML";
import type { Translations } from "../../i18n";

interface Item {
	item: DataItem;
	index: number;
	t: Translations;
}

export function Item({ item, t }: Item) {
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

	const safeDescription = item.description ? formatHTML(item.description) : "";
	const safeDurationMinutes = Math.floor((item.enclosure?.duration ?? 0) / 60);
	const safeDurationSeconds = String((item.enclosure?.duration ?? 0) % 60).padStart(2, "0");
	const safeDurationText = `${t.duration} ${safeDurationMinutes}:${safeDurationSeconds}`;

	return (
		<article class="py-8 first:pt-0">
			<div class="mb-3 flex flex-wrap items-center gap-3">
				<time
					class="font-medium text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600"
					datetime={item.date?.toISOString()}
				>
					<span safe>{item.date ? formatDate(item.date) : t.unknownDate}</span>
					{!!item.date && (
						<span class="ml-2 text-neutral-300 dark:text-neutral-700" safe>
							{formatTime(item.date)}
						</span>
					)}
				</time>

				{!!item.category && item.category.length > 0 && (
					<div class="flex flex-wrap gap-1.5">
						{item.category.map((cat) => (
							<span
								class="font-medium text-neutral-500 text-xs uppercase tracking-wider dark:text-neutral-500"
								safe
							>
								{cat.name}
							</span>
						))}
					</div>
				)}
			</div>

			<h2 class="font-bold font-serif text-2xl text-neutral-900 leading-tight tracking-tight dark:text-neutral-100">
				{item.link ? (
					<a
						class="transition-opacity hover:opacity-70"
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
				<p class="mt-3 text-neutral-600 text-sm leading-relaxed dark:text-neutral-400">
					{safeDescription}
				</p>
			)}

			{!!item.author && item.author.length > 0 && (
				<div class="mt-4 flex flex-wrap items-center gap-1">
					<span class="text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600">
						{item.author.length > 1 ? "Authors" : "Author"}:
					</span>
					{item.author.map((author, idx) => {
						const authorLength = item.author?.length || 0;
						return (
							<span>
								{author.link ? (
									<a
										class="font-medium text-neutral-700 text-xs transition-opacity hover:opacity-70 dark:text-neutral-300"
										href={author.link}
										rel="noopener noreferrer"
										safe
										target="_blank"
									>
										{author.name}
									</a>
								) : (
									<span class="font-medium text-neutral-700 text-xs dark:text-neutral-300" safe>
										{author.name}
									</span>
								)}
								{idx < authorLength - 1 && (
									<span class="text-neutral-300 dark:text-neutral-700">, </span>
								)}
							</span>
						);
					})}
				</div>
			)}

			{!!item.enclosure && (
				<div class="mt-4 flex items-center gap-4 border-neutral-100 border-t pt-4 dark:border-neutral-800">
					<div class="min-w-0 flex-1">
						<p class="truncate font-medium text-neutral-700 text-xs dark:text-neutral-300" safe>
							{item.enclosure.title || t.mediaAttachment}
						</p>
						{!!item.enclosure.duration && (
							<p class="text-neutral-400 text-xs dark:text-neutral-600">{safeDurationText}</p>
						)}
					</div>
					<a
						class="font-medium text-neutral-900 text-xs underline underline-offset-4 transition-opacity hover:opacity-70 dark:text-neutral-100"
						href={item.enclosure.url}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span safe>{t.play}</span>
					</a>
				</div>
			)}
		</article>
	);
}
