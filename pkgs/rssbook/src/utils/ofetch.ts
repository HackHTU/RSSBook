import { ofetch } from "ofetch";
import pkg from "../../package.json" with { type: "json" };
import { logger } from "./logger";

const { version } = pkg;

const fetch = ofetch.create({
	headers: {
		Accept:
			"application/rss+xml, application/atom+xml, application/json, application/xml, text/html, text/xml, */*",
		"Accept-Encoding": "gzip, deflate, br",
		"Cache-Control": "no-cache",
		"User-Agent": `Mozilla/5.0 (compatible; RSSBook/${version};)`,
	},

	onRequest({ request, options }) {
		const url = typeof request === "string" ? request : request.url;
		logger.info(`[Client] -> ${options.method || "GET"} ${url}`);
	},

	onRequestError({ request, error }) {
		const url = typeof request === "string" ? request : request.url;
		logger.error(`[Client] -✗> Request failed: ${url} - ${error.message}`);
	},

	onResponse({ request, response }) {
		const url = typeof request === "string" ? request : request.url;
		const contentType = response.headers.get("content-type") || "unknown";
		logger.info(`[Client] <- ${response.status} ${url} (${contentType})`);
	},

	onResponseError({ request, response }) {
		const url = typeof request === "string" ? request : request.url;
		logger.error(`[Client] <✗- Response error: ${response.status} ${url}`);
	},
	retry: 2,
	retryDelay: 500,
	timeout: 8000,
});

export { fetch as ofetch };
