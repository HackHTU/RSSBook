import type { DataItem } from "@/types";
import type { Translations } from "../../i18n";

interface ItemProps {
	item: DataItem;
	index: number;
	t: Translations;
}

const gradients = [
	"from-emerald-600/80 to-teal-900/80",
	"from-violet-600/80 to-indigo-900/80",
	"from-rose-600/80 to-pink-900/80",
	"from-amber-600/80 to-orange-900/80",
	"from-cyan-600/80 to-blue-900/80",
	"from-fuchsia-600/80 to-purple-900/80",
	"from-lime-600/80 to-green-900/80",
	"from-sky-600/80 to-blue-900/80",
];

const sizes = [
	"row-span-2",
	"row-span-1",
	"row-span-1",
	"row-span-2",
	"row-span-1",
	"row-span-1",
	"row-span-2",
	"row-span-1",
];

export function Item({ item, index }: ItemProps) {
	const imageUrl = typeof item.image === "string" ? item.image : item.image?.url;
	const hasImage = !!imageUrl;
	const gradient = gradients[index % gradients.length];
	const sizeClass = sizes[index % sizes.length];
	const safeDate = item.date
		? `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}-${String(item.date.getDate()).padStart(2, "0")}`
		: "";

	return (
		<article
			class={`group relative ${sizeClass} overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900`}
			data-show={`
				($selectedCategory === 'all' || $item.category?.some(cat => cat.name === $selectedCategory)) &&
				($searchQuery === '' || $item.title?.toLowerCase().includes($searchQuery.toLowerCase()) || $item.description?.toLowerCase().includes($searchQuery.toLowerCase()))
			`}
		>
			<a class="block h-full w-full" href={item.link} rel="noopener noreferrer" target="_blank">
				{hasImage ? (
					<img
						alt={item.title || ""}
						class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
						loading="lazy"
						src={imageUrl}
					/>
				) : (
					<div
						class={`flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-br ${gradient}`}
					>
						<span class="px-8 text-center font-bold text-2xl text-white/40 leading-tight tracking-tight">
							<span safe>{item.title?.slice(0, 40)}</span>
						</span>
					</div>
				)}

				<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

				<div class="absolute inset-0 flex flex-col justify-end p-6">
					<div>
						{!!item.category && item.category.length > 0 && (
							<div class="mb-3 flex flex-wrap gap-1.5">
								{item.category.slice(0, 3).map((cat) => (
									<span class="inline-block rounded-full bg-emerald-500/30 px-3 py-1 font-medium text-emerald-200 text-xs backdrop-blur-sm">
										<span safe>{cat.name}</span>
									</span>
								))}
							</div>
						)}

						<h2 class="mb-2 font-bold text-lg text-white leading-snug tracking-tight">
							<span safe>{item.title}</span>
						</h2>

						<div class="flex items-center gap-3">
							{!!item.author && item.author.length > 0 && (
								<span class="text-sm text-white/70">
									<span safe>{item.author[0].name}</span>
								</span>
							)}

							{!!item.date && (
								<time class="text-sm text-white/50" datetime={item.date?.toISOString()}>
									<span>{safeDate}</span>
								</time>
							)}

							<span class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-white/80 text-xs backdrop-blur-sm transition-colors group-hover:bg-emerald-500/30">
								<svg
									aria-hidden="true"
									class="h-3 w-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
									/>
								</svg>
								Open
							</span>
						</div>
					</div>
				</div>
			</a>
		</article>
	);
}
