import type { DataItem } from "@/types";
import { Item } from "./Item";

interface TimelineProps {
	items: DataItem[];
}

export function Timeline({ items }: TimelineProps) {
	return (
		<div class="mx-auto max-w-5xl animate-fade-in">
			<div class="relative">
				<div class="absolute top-0 bottom-0 left-0 hidden w-1 rounded-full bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 shadow-lg shadow-rose-300/50 md:block md:w-1.5 dark:from-rose-600 dark:via-rose-700 dark:to-rose-800 dark:shadow-rose-900/50">
					<div class="-translate-x-1/2 absolute left-1/2 h-full w-[2px] bg-gradient-to-b from-rose-300/30 via-rose-200/50 to-rose-300/30 dark:from-rose-900/30 dark:via-rose-800/50 dark:to-rose-900/30"></div>
				</div>

				<div class="mb-8 flex items-center justify-center md:hidden">
					<div class="h-1 w-32 rounded-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 shadow-lg shadow-rose-300/50 dark:from-rose-600 dark:via-rose-700 dark:to-rose-800 dark:shadow-rose-900/50"></div>
				</div>

				<div class="space-y-8 md:space-y-12 md:pl-12">
					{items.map((item, index) => (
						<Item
							data-show={`
                                ($selectedCategory === 'all' || $item.category?.some(cat => cat.name === $selectedCategory)) &&
                                ($searchQuery === '' || $item.title?.toLowerCase().includes($searchQuery.toLowerCase()) || $item.description?.toLowerCase().includes($searchQuery.toLowerCase()))
                            `}
							index={index}
							item={item}
						/>
					))}
				</div>

				<div class="pt-8 md:pt-12 md:pl-12">
					<div class="flex items-center gap-4">
						<div class="-ml-14 relative hidden md:block">
							<div class="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-300/50 ring-4 ring-white/80 dark:from-rose-600 dark:to-rose-800 dark:shadow-rose-900/50 dark:ring-stone-900/80"></div>
							<div class="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-20 dark:bg-rose-600"></div>
						</div>

						<div class="flex-1 text-center md:text-left">
							<p class="font-medium text-sm text-stone-500 dark:text-stone-400">
								{items.length === 0 ? "暂无内容" : "当前页内容已展示完毕"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
