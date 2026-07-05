import type { ThemeProps } from "@/types";
import { Timeline } from "./components/content/Timeline";
import { FilterBar } from "./components/controls/FilterBar";
import { Status } from "./components/controls/Status";
import { Background } from "./components/layout/Background";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import { getTranslations } from "./i18n";

export const defaultTheme = {
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

					{/* Twitter Card */}
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

					{/* UnoCSS Runtime */}
					<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>

					{/* Datastar */}
					<script
						src="https://cdn.jsdelivr.net/gh/starfederation/datastar@1.0.0-RC.5/bundles/datastar.js"
						type="module"
					></script>

					{/* TailwindCSS Reset */}
					<link
						href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css"
						rel="stylesheet"
					/>
					<style>{`[un-cloak] { display: none; }`}</style>
				</head>
				<body
					class="min-h-screen transition-colors duration-300"
					data-signals-current-page={`${pagination.page}`}
					data-signals-dark-mode="matchMedia('(prefers-color-scheme: dark)').matches"
					data-signals-filiter-bar="false"
					data-signals-search-query={`'${filterInfo.search}'`}
					data-signals-selected-category={`'${filterInfo.category}'`}
					data-signals-total-pages={`${pagination.totalPages}`}
					un-cloak
				>
					<Background />

					<div class="relative z-10 flex min-h-screen flex-col">
						<Nav t={t} title={title || "RSSBook"} />

						<main class="container mx-auto flex-1 px-4 py-8 md:py-12 lg:py-16">
							<FilterBar
								categories={categories}
								filter={filterInfo}
								pagination={pagination}
								t={t}
							/>
							<Timeline filter={filterInfo} items={items} t={t} />
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
						<style>{`.un-cloak { display: block !important; }`}</style>
					</noscript>
				</body>
			</html>
		);
	},
};
