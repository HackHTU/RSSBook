import type { Language } from "./data";
import type { MaybeArray } from "./utils";

export interface RouteConfig {
	/**
	 * The title of the route
	 *
	 * Suggested to be less than 10 characters.
	 */
	title: string;

	/**
	 * A detailed description of this route.
	 *
	 * Explain what this route does and what each path parameter is used for.
	 *
	 * **Configuration should be set in `Source.config`.**
	 *
	 * Markdown syntax is supported.
	 */
	description: string;

	/**
	 * The maintainer(s) of the route.
	 *
	 * Can be a single maintainer or an array of maintainers.
	 * Each maintainer can have a name, description, email, and URL.
	 *
	 * It will be rendered in the documentation.
	 *
	 * The maintainer's name is required, **MUST BE** your GitHub username.
	 */
	maintainer: MaybeArray<{
		/**
		 * GitHub username (required).
		 *
		 * @example "@HackHTU"
		 */
		name: string;
		/** Markdown syntax is supported */
		description?: string;
		email?: string;
		url?: string;
	}>;

	fulltext?: boolean;
	withImage?: "Always" | "If-Present" | "None";
	language: MaybeArray<Language>;
}
