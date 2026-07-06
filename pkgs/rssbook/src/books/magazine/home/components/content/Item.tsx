import type { DataItem } from "@/types";
import { formatHTML } from "@/utils";
import type { Translations } from "../../i18n";

interface ItemProps {
	item: DataItem;
	t: Translations;
}

export function Item({ item, t }: ItemProps) {
	const formatDate = (date: Date) => {
		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
	};

	const safeDescription = item.description ? formatHTML(item.description) : "";

	const imageUrl =
		typeof item.image === "string"
			? item.image
			: item.enclosure?.type?.startsWith("image")
				? item.enclosure.url
				: undefined;

	return (
		<article class="group relative flex h-[360px] flex-col overflow-hidden border-neutral-200/60 bg-white transition-all duration-300 hover:shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
			{!!imageUrl && (
				<div class="relative h-[180px] w-full shrink-0 overflow-hidden">
					<img
						alt=""
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						src={imageUrl}
					/>
				</div>
			)}

			<div class="flex flex-1 flex-col overflow-hidden p-5 lg:p-6">
				<div class="mb-2 flex flex-wrap items-center gap-3">
					<time
						class="font-medium text-[10px] text-neutral-400 uppercase tracking-[0.2em] dark:text-neutral-600"
						datetime={item.date?.toISOString()}
					>
						<span safe>{item.date ? formatDate(item.date) : t.unknownDate}</span>
					</time>
				</div>

				<h3 class="font-black font-serif text-lg text-neutral-900 leading-tight tracking-tight transition-colors group-hover:text-red-600 dark:text-neutral-100 dark:group-hover:text-red-500">
					{item.link ? (
						<a
							class="transition-opacity hover:opacity-80"
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
				</h3>

				{!!item.description && (
					<p class="mt-2 line-clamp-2 flex-1 text-neutral-600 text-sm leading-relaxed dark:text-neutral-400">
						{safeDescription}
					</p>
				)}

				<div class="mt-auto flex flex-wrap items-center gap-2 pt-3">
					{!!item.category &&
						item.category.length > 0 &&
						item.category.slice(0, 2).map((cat) => (
							<span
								class="rounded-full bg-neutral-100 px-3 py-1 font-medium text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
								safe
							>
								{cat.name}
							</span>
						))}
				</div>
			</div>
		</article>
	);
}
