import type { ThemeProps } from "@/types";
import { List } from "./components/content/List";
import { FilterBar } from "./components/controls/FilterBar";
import { Status } from "./components/controls/Status";
import { Background } from "./components/layout/Background";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import { getTranslations } from "./i18n";

export const readerTheme = {
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
						href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500&display=swap"
						rel="stylesheet"
					/>

					<style>{`
[un-cloak] { display: none; }
.font-serif { font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
					`}</style>
				</head>
				<body
					class="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
					data-signals-current-page={`${pagination.page}`}
					data-signals-dark-mode="matchMedia('(prefers-color-scheme: dark)').matches"
					data-signals-filiter-bar="false"
					data-signals-search-query={`'${filterInfo.search}'`}
					data-signals-selected-category={`'${filterInfo.category}'`}
					data-signals-total-pages={`${pagination.totalPages}`}
					un-cloak
				>
					<Background />

					<div class="flex min-h-screen flex-col">
						<Nav t={t} title={title || "RSSBook"} />

						<main class="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
							<FilterBar
								categories={categories}
								filter={filterInfo}
								pagination={pagination}
								t={t}
							/>
							<List filter={filterInfo} items={items} t={t} />
							<Status filter={filterInfo} itemCount={items.length} pagination={pagination} t={t} />
						</main>

						<Footer
							atom={atomFeed}
							description={description}
							json={jsonFeed}
							rss={rssFeed}
							t={t}
							title={title || "RSSBook"}
						/>
					</div>

					<noscript>
						<style>{`[un-cloak] { display: block !important; }`}</style>
					</noscript>
				</body>
			</html>
		);
	},
};
