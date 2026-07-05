import { Elysia } from "elysia";
import { initPlugin } from "@/plugins";
import type { Data, FeedType } from "@/types";
import type { Source } from "@/utils/source";
import { logger } from "../logger";

type SourceRouteTestOptions = {
	config?: Record<string, string>;
	query?: Record<string, boolean | number | string | undefined>;
	type?: FeedType;
};

/**
 * Runs a single source route and returns the feed data produced by that route.
 */
export async function getRouteData(
	// biome-ignore lint/suspicious/noExplicitAny: Test helpers accept any Source instance.
	source: Source<any, any>,
	path: `/${string}`,
	options: SourceRouteTestOptions = {},
): Promise<Data> {
	const sourceConfig = source.getConfig();
	const query = new URLSearchParams();
	const type = options.type ?? "raw";

	query.set("type", type);

	for (const [key, value] of Object.entries(options.query ?? {})) {
		if (value !== undefined) {
			query.set(key, String(value));
		}
	}

	const app = new Elysia({
		name: `RSSBook/Test/${sourceConfig.slug}`,
	})
		.use(
			initPlugin({
				book: {
					config: options.config,
				},
			}),
		)
		.use(source.getApp());

	const response = await app.handle(
		new Request(`http://rssbook.test/${sourceConfig.slug}${path}?${query.toString()}`),
	);

	if (!response.ok) {
		throw new Error(`Source route failed: ${response.status} ${await response.text()}`);
	}

	if (type !== "raw" && type !== "json") {
		throw new Error(
			`Source route returned ${type}, but Data can only be read from raw or json output.`,
		);
	}
	const data: Data = await response.json();

	logger.info(`[${sourceConfig.slug}] ${path}`, JSON.stringify(data, null, 2));

	return data;
}
