import type { ThemeProps } from "@/types";
import { Timeline } from "./components/content/Timeline";
import { FilterBar } from "./components/controls/FilterBar";
import { Status } from "./components/controls/Status";
import { Background } from "./components/layout/Background";
import { Footer } from "./components/layout/Footer";
import { Nav } from "./components/layout/Nav";
import { getTranslations } from "./i18n";

export const minimalTheme = {
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
						href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap"
						rel="stylesheet"
					/>

					<style>{`
[un-cloak] { display: none; }
.font-serif { font-family: 'Playfair Display', Georgia, serif; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
					`}</style>
				</head>
				<body
					class="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
					data-signals-current-page={`${pagination.page}`}
					data-signals-dark-mode="matchMedia('(prefers-color-scheme: dark)').matches"
					data-signals-filiter-bar="false"
					data-signals-search-query={`'${filterInfo.search}'`}
					data-signals-selected-category={`'${filterInfo.category}'`}
					data-signals-total-pages={`${pagination.totalPages}`}
					un-cloak
				>
					<Background />

					<Nav description={description} t={t} title={title || "RSSBook"} />

					<div class="lg:ml-64">
						<header class="border-neutral-200 border-b dark:border-neutral-800">
							<div class="mx-auto max-w-3xl px-6 py-16 lg:max-w-none lg:px-12">
								<div class="flex items-center justify-between lg:hidden">
									<div>
										<h1 class="font-bold font-serif text-2xl tracking-tight">
											<span safe>{title || "RSSBook"}</span>
										</h1>
									</div>
									<div class="flex items-center gap-4">
										<button
											class="font-medium text-neutral-500 text-xs uppercase tracking-widest transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
											data-on-click="$filiterBar = !$filiterBar"
											type="button"
										>
											<span safe>{t.search}</span>
										</button>
										<button
											aria-label={t.toggleDarkMode}
											class="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
											data-effect="document.documentElement.classList.toggle('dark', $darkMode)"
											data-on-click="$darkMode = !$darkMode"
											type="button"
										>
											<svg
												aria-hidden="true"
												class="h-4 w-4 dark:hidden"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
												/>
											</svg>
											<svg
												aria-hidden="true"
												class="hidden h-4 w-4 dark:block"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
												/>
											</svg>
										</button>
									</div>
								</div>

								<div class="mt-8 lg:mt-0">
									<p class="font-medium text-neutral-400 text-xs uppercase tracking-widest dark:text-neutral-600">
										<span>
											{safeItemCount} {safeArticlesOfTotal}
										</span>
									</p>
								</div>
							</div>
						</header>

						<main class="px-6 py-8 lg:px-12">
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
