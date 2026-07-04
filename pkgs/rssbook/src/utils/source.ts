import { type AnyElysia, Elysia } from "elysia";
import { injectPlugin, renderPlugin } from "@/plugins";
import type { Config, GeneratedConfig, RouteConfig, Slug, SourceConfigs } from "@/types";
import { detectLanguage } from "@/utils";
import { logger } from "./logger";

/**
 * Source class to manage routes and configurations.
 *
 * @example
 * ```ts
 * export default new Source({
 *   slug: "example", // only allows lowercase letters, numbers, and hyphens
 *   title: "Example Source",
 *   description: `An example source`, // markdown supported
 *   rootURL: "https://example.com", // root URL of the source
 *   config: {
 *     category: {
 *       description: "Category of the feed",
 *       required: true,
 *       default: "general",
 *     },
 *   },
 * });
 * ```
 */
export class Source<
	Name extends string,
	Configs extends Record<string, Config> = Record<string, Config>,
> {
	private routes: RouteConfig[] = [];
	/**
	 * Collection of Elysia app for each route.
	 * Initialized as empty array, populated via addRoute() calls.
	 * @private
	 */
	private handlers: AnyElysia[] = [];

	/**
	 * Constructor for the Source class.
	 *
	 * @example
	 * ```ts
	 * export default new Source({
	 *   slug: "example", // only allows lowercase letters, numbers, and hyphens
	 *   title: "Example Source",
	 *   description: `An example source`, // markdown supported
	 *   rootURL: "https://example.com", // root URL of the source
	 *   config: {
	 *     category: {
	 *       description: "Category of the feed",
	 *       required: true,
	 *       default: "general",
	 *     },
	 *   },
	 * });
	 * ```
	 * @param sourceConfig - The configuration for the source.
	 * @param _app - !**DO NOT USE** If you don't know what this is.
	 */
	constructor(
		private sourceConfig: SourceConfigs<Name & Slug<Name>, Configs>,
		public _app = new Elysia({
			name: `RSSBook/${sourceConfig.slug as string}`,
			prefix: `/${sourceConfig.slug as string}`,
		})
			// for type inference
			.use(injectPlugin)
			.use(renderPlugin)
			// map config
			.resolve(({ config, headers }) => {
				// generate config with default values
				const mapConfig = Object.fromEntries(
					Object.entries(sourceConfig.config ?? {}).map(([key, value]) => {
						return [key, config[key] ?? value.default];
					}),
				) as GeneratedConfig<Configs>;

				const acceptLanguage =
					headers["accept-language"] ??
					headers["Accept-Language"] ??
					headers["content-language"] ??
					headers["Content-Language"] ??
					"";

				return {
					lang: detectLanguage(acceptLanguage),
					meta: {
						...this.sourceConfig,
						config: mapConfig,
					},
				};
			}),
	) {
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sourceConfig.slug)) {
			throw new Error(`Error Source Slug: ${sourceConfig.slug}.`);
		}
	}

	/**
	 * Add a new feed item (route) to this source.
	 *
	 * Each item represents a route definition, along with its metadata and handler.
	 *
	 * @example
	 * ```ts
	 * source.feed(
	 *   {
	 *     title: "example", // title of the feed
	 *     description: "An example feed", // markdown supported
	 *     fulltext: true, // whether to enable fulltext extraction
	 *     withImage: "if-present", // image handling strategy
	 *     language: "en", // language of the feed
	 *     maintainer: { name: "RSSBook" }, // maintainer information
	 *   },
	 *   (app) => app.get("/example", () => "Hello World"), // route handler
	 * );
	 * ```
	 *
	 * @param routeConfig - Configuration of the feed route, including name, description, and maintainer.
	 * @param handler - A function that receives and extends the internal Elysia app instance for this route.
	 * @returns Returns the current Source instance for chaining.
	 */
	public feed(routeConfig: RouteConfig, handler: (_app: typeof this._app) => AnyElysia): this {
		if (this.routes.some((route) => route.title === routeConfig.title)) {
			throw new Error(`Duplicate Route Title: ${routeConfig.title}.`);
		}

		const newApp = new Elysia({
			detail: {
				description: this.buildFeedDescription(routeConfig),
				summary: `${this.sourceConfig.title}/${routeConfig.title}`,
			},
			name: `RSSBook/${this.sourceConfig.title}/${routeConfig.title}`,
		});
		const resultApp = handler.call(newApp, newApp as AnyElysia);

		this.routes.push(routeConfig);
		this.handlers.push(resultApp);

		return this;
	}

	private buildFeedDescription(routeConfig: RouteConfig) {
		const maintainers = Array.isArray(routeConfig.maintainer)
			? routeConfig.maintainer
			: [routeConfig.maintainer];
		const languages = Array.isArray(routeConfig.language)
			? routeConfig.language
			: [routeConfig.language];

		const description = [
			this.sourceConfig.description,
			"---",
			routeConfig.description,
			"---",
			`<details><summary>🔍 About This Feed</summary>`,
			// Maintainers section
			...(maintainers.length
				? [
						"### ❤️ Maintainers",
						maintainers.map((m) =>
							[
								m.url ? `- **[${m.name}](${m.url})**` : `- **${m.name}**`,
								m.email ? `[${m.email}](mailto:${m.email})` : "",
								m.description ? `- ${m.description}` : "",
							]
								.filter(Boolean)
								.join(" "),
						),
					]
				: []),

			// Configuration section
			...(this.sourceConfig.config
				? [
						"### 🔧 Configuration",
						...Object.entries(this.sourceConfig.config).map(([key, value]) =>
							[
								`- **\`${key}\`**${value.required ? " **(required)**" : " *(optional)*"}`,

								`  - ${value.description}${value.default ? `\n  - **Default**: \`${value.default}\`` : ""}`,
							].join("\n"),
						),
					]
				: []),

			// Information section
			"### 📖 Information",
			`- **Fulltext**: ${routeConfig.fulltext !== undefined ? (routeConfig.fulltext ? "Enabled" : "Disabled") : "Not specified"}`,
			`- **With Image**: ${routeConfig.withImage ? `${routeConfig.withImage}` : "Not specified"}`,
			`- **Language**: ${languages.join(", ")}`,
			`- **Generate From**: ${this.sourceConfig.domain}`,
			"</details>",
		].join("\n\n");
		return description;
	}

	public getRoutes() {
		return this.routes;
	}

	public getConfig() {
		return this.sourceConfig;
	}

	public getApp(): AnyElysia {
		const app = this._app.use(this.handlers).as("scoped");

		if (process.env.NODE_ENV !== "production") {
			const allRoutes = app.routes;
			if (allRoutes.length === 0) {
				logger.warn(
					`[Source: ${this.sourceConfig.slug}] No routes defined. Did you forget to add feeds to this category?`,
				);
			}

			if (allRoutes.some((route) => route.method !== "GET")) {
				logger.warn(
					`[Source: ${this.sourceConfig.slug}] Some routes are not GET requests. All feed routes should be GET requests only.`,
				);
			}
		}

		return app;
	}
}

export namespace Source {
	/**
	 * AppType extracts the type of the Elysia app associated with a given Source instance.
	 * @template S - The Source instance from which to extract the app type.
	 */
	// biome-ignore lint/suspicious/noExplicitAny: AppType needs to extract type from any Source
	export type AppType<S extends Source<any>> = S["_app"];
}
