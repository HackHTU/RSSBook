import { type AnyElysia, Elysia } from "elysia";
import type { Source } from "./source";

// biome-ignore lint/suspicious/noExplicitAny: Source can be any type
type AnySource = Source<any, any>;

export class Category {
	sources: AnySource[] = [];

	constructor(
		public name: string,
		public description: string,
	) {}

	/**
	 * Adds sources to the category.
	 * @param sources - The sources to add.
	 * @returns The category instance.
	 */
	use(sources: Record<string, AnySource>): this {
		for (const source of Object.values(sources)) {
			if (!this.sources.includes(source)) {
				this.sources.push(source);
			} else {
				throw new Error(
					`Source ${source.getConfig().title} is already added to category ${this.name}`,
				);
			}
		}

		return this;
	}
	getApp(): AnyElysia {
		return new Elysia({
			detail: {
				description: this.description,
				summary: `${this.name} Feeds`,
			},
			name: `RSSBook/Router/Feeds/${this.name[0].toUpperCase()}${this.name.slice(1).toLowerCase()}`,
			prefix: `/${this.name.toLowerCase()}`,
			tags: [this.name.toLowerCase()],
		})
			.use(this.sources.map((source) => source.getApp()))
			.as("scoped");
	}
}
