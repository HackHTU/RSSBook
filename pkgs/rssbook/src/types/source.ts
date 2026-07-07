export type ConfigName<Slug extends string> = `${Uppercase<Slug>}_${string}`;

// Helper type to validate that all keys in T match the pattern ConfigName<Slug>
export type ValidateConfigKeys<Slug extends string, T> = {
	[K in keyof T]: K extends ConfigName<Slug>
		? T[K]
		: `Your config keys must start with "${Uppercase<Slug>}_"`;
};

export interface Config {
	description: string;
	required?: boolean;
	default?: string;
}

/**
 * Source configuration.
 *
 * You can use `meta` config in route handlers to get source information.
 */
export interface SourceConfigs<
	Slug extends string,
	Configs extends Record<ConfigName<Slug>, Config> = Record<ConfigName<Slug>, Config>,
> {
	/**
	 * The unique name of the source
	 *
	 * **Only lowercase letters, numbers, and hyphens are allowed.**
	 */
	slug: Slug;

	/**
	 * The title of the source
	 *
	 * Suggested to be less than 10 characters.
	 */
	title: string;

	/**
	 * A brief description of the source.
	 *
	 * Markdown syntax is supported.
	 */
	description: string;

	/**
	 * The website domain for this source.
	 *
	 * This is metadata for building upstream request URLs and feed links. It is
	 * not the RSSBook route URL; feed routes are mounted with the source `slug`
	 * as their prefix, for example `/example/latest`.
	 *
	 * You can read it from `meta.domain` in route handlers.
	 *
	 * @example
	 * ```ts
	 * (app) =>
	 *   app.get("/latest", ({ meta: { domain } }) => {
	 *     const link = `https://${domain}/some/path`;
	 *
	 *     return {
	 *       title: "Latest",
	 *       link,
	 *       item: [],
	 *     };
	 *   });
	 * ```
	 */
	domain: string;

	/**
	 * Configuration for the source.
	 *
	 * Each config option includes a description, whether it's required, and an optional default value.
	 *
	 * **If not configured, the props in the `Handler` will be undefined.**
	 *
	 * **All config keys MUST start with the uppercase slug followed by underscore (e.g., DEEPIN_*).**
	 *
	 * @example
	 * ```ts
	 * config: {
	 *		DEEPIN_CATEGORY: {
	 *			description: "the category of the news",
	 *			required: true,
	 *			default: "news",
	 *		},
	 * }
	 * ```
	 */
	config?: ValidateConfigKeys<Slug, Configs>;
}

export type GeneratedConfig<
	Spec extends Record<string, { description: string; required?: boolean; default?: string }>,
> = {
	[K in keyof Spec]: Spec[K] extends { default: infer D }
		? D extends string
			? string
			: string // If has default, treat as string
		: string | undefined; // If no default, treat as string | undefined
};
