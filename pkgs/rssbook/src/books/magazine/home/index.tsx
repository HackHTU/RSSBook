import type { ThemeProps } from "@/types";
import { Featured } from "./components/content/Featured";
import { Grid } from "./components/content/Grid";
import { FilterBar } from "./components/controls/FilterBar";
import { Status } from "./components/controls/Status";
import { Background } from "./components/layout/Background";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import { getTranslations } from "./i18n";

export const magazineTheme = {
	render: ({
		meta: {
			description,
			favicon,
			keywords,
			lang,
			title,
			appleTouchIcon,
			atomFeed,
			jsonFeed,
			rssFeed,
			twitter,
			og,
			extra,
		},
		categories,
		items,
		pagination,
		filter: filterInfo,
	}: ThemeProps) => {
		const t = getTranslations(lang);
		const featuredItem = items[0];
		const gridItems = items.slice(1);
		const safeItemCount = items.length;
		const safeArticlesOfTotal = t.articlesOfTotal.replace("{total}", String(pagination.total));

		return (
			<html lang={lang || "zh-CN"}>
				<head>
					<title safe>{title || "RSSBook"}</title>

					<meta charset="UTF-8" />
					<meta content="width=device-width, initial-scale=1.0" name="viewport" />

					{!!description && <meta content={description} name="description" />}
					{!!keywords && (
						<meta
							content={Array.isArray(keywords) ? keywords.join(", ") : keywords}
							name="keywords"
						/>
					)}

					<link href={favicon || "/favicon.svg"} rel="icon" type="image/svg+xml" />
					<link href={favicon || "/favicon.svg"} rel="mask-icon" />
					{!!appleTouchIcon && <link href={appleTouchIcon} rel="apple-touch-icon" />}

					{!!atomFeed && <link href={atomFeed} rel="alternate" type="application/atom+xml" />}
					{!!rssFeed && <link href={rssFeed} rel="alternate" type="application/rss+xml" />}
					{!!jsonFeed && <link href={jsonFeed} rel="alternate" type="application/json" />}

					{!!og?.title && <meta content={og.title} property="og:title" />}
					{!!og?.description && <meta content={og.description} property="og:description" />}
					{!!og?.type && <meta content={og.type} property="og:type" />}
					{!!og?.url && <meta content={og.url} property="og:url" />}
					{!!og?.image && <meta content={og.image} property="og:image" />}
					{!!og?.siteName && <meta content={og.siteName} property="og:site_name" />}

					{!!twitter?.card && <meta content={twitter.card} name="twitter:card" />}
					{!!twitter?.title && <meta content={twitter.title} name="twitter:title" />}
					{!!twitter?.description && (
						<meta content={twitter.description} name="twitter:description" />
					)}
					{!!twitter?.image && <meta content={twitter.image} name="twitter:image" />}
					{!!twitter?.site && <meta content={twitter.site} name="twitter:site" />}

					{extra?.map((prop) => {
						return <meta {...prop} />;
					})}

					<link href="https://cdn.jsdelivr.net" rel="preconnect" />
					<link href="https://cdn.jsdelivr.net" rel="dns-prefetch" />

					<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>

					<script
						src="https://cdn.jsdelivr.net/gh/starfederation/datastar@1.0.0-RC.5/bundles/datastar.js"
						type="module"
					></script>

					<link
						href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css"
						rel="stylesheet"
					/>

					<link href="https://fonts.googleapis.com" rel="preconnect" />
					<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect" />
					<link
						href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap"
						rel="stylesheet"
					/>

					<style>{`
[un-cloak] { display: none; }
.font-serif { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-6 { display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
					`}</style>
				</head>
				<body
					class="min-h-screen bg-[#faf8f5] text-neutral-900 dark:bg-[#1a1a1a] dark:text-neutral-100"
					data-signals-current-page={`${pagination.page}`}
					data-signals-dark-mode="matchMedia('(prefers-color-scheme: dark)').matches"
					data-signals-filter-bar="false"
					data-signals-search-query={`'${filterInfo.search}'`}
					data-signals-selected-category={`'${filterInfo.category}'`}
					data-signals-total-pages={`${pagination.totalPages}`}
					un-cloak
				>
					<Background />

					<Nav description={description} t={t} title={title || "RSSBook"} />

					<div class="mb-4 flex items-center justify-between px-6 pt-6 lg:px-12">
						<p class="font-bold text-[10px] text-neutral-400 uppercase tracking-[0.3em] dark:text-neutral-600">
							<span>
								{safeItemCount} {safeArticlesOfTotal}
							</span>
						</p>
						<div class="h-px flex-1 bg-neutral-200/60 dark:bg-neutral-800/60" />
					</div>

					{!!featuredItem && (
						<div class="mx-auto max-w-7xl px-6 lg:px-12">
							<Featured item={featuredItem} t={t} />
						</div>
					)}

					<FilterBar categories={categories} filter={filterInfo} pagination={pagination} t={t} />

					<Grid filter={filterInfo} items={gridItems} t={t} />

					<Status filter={filterInfo} itemCount={items.length} pagination={pagination} t={t} />

					<Footer
						atom={atomFeed}
						description={description}
						json={jsonFeed}
						rss={rssFeed}
						t={t}
						title={title || "RSSBook"}
					/>

					<noscript>
						<style>{`[un-cloak] { display: block !important; }`}</style>
					</noscript>
				</body>
			</html>
		);
	},
};
