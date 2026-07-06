import type { DataItem } from "@/types";
import { formatHTML } from "@/utils";
import type { Translations } from "../../i18n";

interface FeaturedProps {
	item: DataItem;
	t: Translations;
}

export function Featured({ item, t }: FeaturedProps) {
	const formatDate = (date: Date) => {
		const months = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
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
		<article class="group relative overflow-hidden bg-neutral-900 dark:bg-neutral-950">
			{!!imageUrl && (
				<div class="absolute inset-0">
					<img
						alt=""
						class="h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
						src={imageUrl}
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
				</div>
			)}

			<div class="relative mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-32">
				<div class="max-w-3xl">
					<div class="mb-6 flex items-center gap-4">
						<span class="bg-red-600 px-3 py-1 font-bold text-[10px] text-white uppercase tracking-[0.3em]">
							<span safe>{t.featured}</span>
						</span>
						<time
							class="font-medium text-neutral-400 text-xs uppercase tracking-[0.2em]"
							datetime={item.date?.toISOString()}
						>
							<span safe>{item.date ? formatDate(item.date) : t.unknownDate}</span>
						</time>
					</div>

					<h2 class="font-black font-serif text-4xl text-white leading-[1.1] tracking-tight lg:text-6xl">
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
					</h2>

					{!!item.description && (
						<p class="mt-6 line-clamp-3 max-w-2xl text-lg text-neutral-300 leading-relaxed">
							{safeDescription}
						</p>
					)}

					<div class="mt-8 flex flex-wrap items-center gap-4">
						{!!item.author && item.author.length > 0 && (
							<div class="flex flex-wrap items-center gap-2">
								{item.author.map((author, idx) => (
									<span>
										{author.link ? (
											<a
												class="font-semibold text-sm text-white transition-opacity hover:opacity-80"
												href={author.link}
												rel="noopener noreferrer"
												safe
												target="_blank"
											>
												{author.name}
											</a>
										) : (
											<span class="font-semibold text-sm text-white" safe>
												{author.name}
											</span>
										)}
										{idx < (item.author?.length || 0) - 1 && (
											<span class="text-neutral-500">, </span>
										)}
									</span>
								))}
							</div>
						)}

						{!!item.category && item.category.length > 0 && (
							<div class="flex flex-wrap gap-2">
								{item.category.map((cat) => (
									<span
										class="border border-neutral-600 px-2 py-0.5 font-semibold text-[10px] text-neutral-300 uppercase tracking-[0.2em]"
										safe
									>
										{cat.name}
									</span>
								))}
							</div>
						)}
					</div>

					{!!item.link && (
						<a
							class="mt-8 inline-flex items-center gap-2 font-bold text-red-500 text-sm uppercase tracking-[0.2em] transition-colors hover:text-red-400"
							href={item.link}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span safe>{t.readMore}</span>
							<svg
								aria-hidden="true"
								class="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M17 8l4 4m0 0l-4 4m4-4H3"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								/>
							</svg>
						</a>
					)}
				</div>
			</div>
		</article>
	);
}
