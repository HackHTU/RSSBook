import type { DataItem } from "@/types";
import { formatHTML } from "@/utils";
import type { Translations } from "../../i18n";

interface ItemProps {
	item: DataItem;
	t: Translations;
}

const TEXT_ONLY_HTML_OPTIONS = {
	allowedAttributes: {},
	allowedTags: [],
	disallowedTagsMode: "discard",
	nonTextTags: ["script", "style", "textarea", "option"],
} satisfies NonNullable<Parameters<typeof formatHTML>[2]>;

function htmlToText(html: string): string {
	return formatHTML(html, undefined, TEXT_ONLY_HTML_OPTIONS);
}

function estimateReadTime(text?: string): number {
	if (!text) return 1;
	const words = htmlToText(text).split(/\s+/).length;
	return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date: Date): string {
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
}

function getExcerpt(description?: string, maxLength = 200): string {
	if (!description) return "";
	const text = htmlToText(description).trim();
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function Item({ item, t }: ItemProps) {
	const excerpt = getExcerpt(item.description);
	const readTime = estimateReadTime(item.description);
	const authors = item.author?.map((a) => a.name).join(", ");
	const safeReadTime = readTime;
	const safeDurationMinutes = Math.floor((item.enclosure?.duration ?? 0) / 60);
	const safeDurationSeconds = String((item.enclosure?.duration ?? 0) % 60).padStart(2, "0");
	const safeReadTimeText = `${safeReadTime} ${t.minRead}`;
	const safeDurationText = `${t.duration} ${safeDurationMinutes}:${safeDurationSeconds}`;

	return (
		<article class="group border-zinc-100 border-b py-10 last:border-b-0 dark:border-zinc-800/60">
			<div class="mb-3 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
				{!!authors && (
					<>
						<span class="font-medium text-zinc-700 dark:text-zinc-300" safe>
							{authors}
						</span>
						<span class="text-zinc-300 dark:text-zinc-600">·</span>
					</>
				)}
				<time datetime={item.date?.toISOString()}>
					<span safe>{item.date ? formatDate(item.date) : t.unknownDate}</span>
				</time>
				<span class="text-zinc-300 dark:text-zinc-600">·</span>
				<span>{safeReadTimeText}</span>
			</div>

			<h2 class="mb-2 font-bold font-serif text-2xl text-zinc-900 leading-snug tracking-tight dark:text-zinc-100">
				{item.link ? (
					<a
						class="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
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

			{!!excerpt && (
				<p class="mb-4 text-base text-zinc-600 leading-relaxed dark:text-zinc-400" safe>
					{excerpt}
				</p>
			)}

			<div class="flex flex-wrap items-center gap-3">
				{!!item.link && (
					<a
						class="font-medium text-blue-600 text-sm transition-opacity hover:opacity-70 dark:text-blue-400"
						href={item.link}
						rel="noopener noreferrer"
						target="_blank"
					>
						<span safe>{t.readMore} →</span>
					</a>
				)}

				{!!item.category && item.category.length > 0 && (
					<div class="flex flex-wrap gap-2">
						{item.category.map((cat) => (
							<span
								class="rounded-full bg-zinc-100 px-2.5 py-0.5 font-medium text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
								safe
							>
								{cat.name}
							</span>
						))}
					</div>
				)}
			</div>

			{!!item.enclosure && (
				<div class="mt-4 flex items-center gap-4 rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">
					<div class="min-w-0 flex-1">
						<p class="truncate font-medium text-sm text-zinc-700 dark:text-zinc-300" safe>
							{item.enclosure.title || t.mediaAttachment}
						</p>
						{!!item.enclosure.duration && (
							<p class="text-xs text-zinc-400 dark:text-zinc-500">{safeDurationText}</p>
						)}
					</div>
					<a
						class="font-medium text-blue-600 text-sm transition-opacity hover:opacity-70 dark:text-blue-400"
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
