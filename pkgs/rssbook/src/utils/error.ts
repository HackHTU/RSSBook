/**
 * Stable machine-readable RSSBook error codes used by route handlers, utilities,
 * and the global error handler to classify failures without relying on message text.
 */
export type RSSBookErrorCode =
	| "BROWSER_CLOSED"
	| "BROWSER_ENDPOINT"
	| "BROWSER_INITIALIZATION"
	| "BROWSER_UNAVAILABLE"
	| "CACHE_MISS"
	| "DATA_VALIDATION"
	| "DUPLICATE_ROUTE_TITLE"
	| "DUPLICATE_SOURCE"
	| "FETCH_HTML"
	| "FEED_FORMAT"
	| "FEED_RENDER"
	| "FEED_NOT_FOUND"
	| "FILTER_FEED"
	| "INVALID_DOMAIN_NAME"
	| "INVALID_DOMAIN_SUFFIX"
	| "INVALID_DOMAIN_URL"
	| "INVALID_FEED_FORMAT"
	| "INVALID_JSON"
	| "INVALID_OVERRIDE_JSON"
	| "INVALID_PRIVATE_NETWORK"
	| "INVALID_PROTOCOL"
	| "INVALID_RAW_CONTENT"
	| "INVALID_ROUTE_PATH"
	| "INVALID_SOURCE_SLUG"
	| "INVALID_RANKING_TYPE"
	| "INVALID_URL"
	| "LOCAL_ADDRESS"
	| "LOCAL_IP_ADDRESS"
	| "PARSE_ERROR"
	| "PRIVATE_NETWORK"
	| "SOURCE_FETCH"
	| "SORT_FEED"
	| "UNION_FEED"
	| "INTERSECTION_FEED"
	| "UNSUPPORTED_FEED_FORMAT"
	| "UNSUPPORTED_BROWSER"
	| "UNSUPPORTED_PROTOCOL"
	| "TRANSFORM_FEED"
	| "VALIDATION";

export interface RSSBookErrorOptions {
	code: RSSBookErrorCode;
	message: string;
	status: number;
	retryable?: boolean;
	cause?: unknown;
}

export class RSSBookError extends Error {
	public readonly code: RSSBookErrorCode;
	public readonly retryable: boolean;
	public readonly status: number;
	public readonly cause?: unknown;

	public constructor({ cause, code, message, retryable = false, status }: RSSBookErrorOptions) {
		super(message);
		this.name = new.target.name;
		this.code = code;
		this.retryable = retryable;
		this.status = status;
		this.cause = cause;
	}
}

export class BrowserClosedError extends RSSBookError {
	public constructor() {
		super({
			code: "BROWSER_CLOSED",
			message: "This RSSBook Browser has been deinitialized and cannot be initialized again.",
			status: 500,
		});
	}
}

export class BrowserUnavailableError extends RSSBookError {
	public constructor() {
		super({
			code: "BROWSER_UNAVAILABLE",
			message:
				"This feed route requires browser support, but RSSBook was created with browser: false.",
			status: 503,
		});
	}
}

export class BrowserInitializationError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "BROWSER_INITIALIZATION",
			message,
			status: 500,
		});
	}
}

export class BrowserEndpointError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "BROWSER_ENDPOINT",
			message,
			retryable: true,
			status: 502,
		});
	}
}

export class CacheMissError extends RSSBookError {
	public constructor(key: string) {
		super({
			code: "CACHE_MISS",
			message: `Cache miss for key "${key}" and no fetcher provided`,
			status: 500,
		});
	}
}

export class DataValidationError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "DATA_VALIDATION",
			message,
			status: 500,
		});
	}
}

export class DuplicateRouteTitleError extends RSSBookError {
	public constructor(title: string) {
		super({
			code: "DUPLICATE_ROUTE_TITLE",
			message: `Duplicate Route Title: ${title}.`,
			status: 500,
		});
	}
}

export class DuplicateSourceError extends RSSBookError {
	public constructor(sourceTitle: string, categoryName: string) {
		super({
			code: "DUPLICATE_SOURCE",
			message: `Source ${sourceTitle} is already added to category ${categoryName}`,
			status: 500,
		});
	}
}

export class FetchHtmlError extends RSSBookError {
	public constructor(url: string, cause?: unknown) {
		super({
			cause,
			code: "FETCH_HTML",
			message: `Failed to fetch or parse HTML from ${url}: ${cause instanceof Error ? cause.message : String(cause)}`,
			retryable: true,
			status: 502,
		});
	}
}

export class FilterFeedError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "FILTER_FEED",
			message,
			status: 500,
		});
	}
}

export class FeedFormatError extends RSSBookError {
	public constructor(format: string) {
		super({
			code: "FEED_FORMAT",
			message: `Invalid feed format: ${format}.`,
			status: 400,
		});
	}
}

export class FeedRenderError extends RSSBookError {
	public constructor(format: string, cause?: unknown) {
		super({
			cause,
			code: "FEED_RENDER",
			message: `Failed to generate ${format} feed: ${cause instanceof Error ? cause.message : String(cause)}`,
			status: 500,
		});
	}
}

export class FeedNotFoundError extends RSSBookError {
	public constructor(resource: string) {
		super({
			code: "FEED_NOT_FOUND",
			message: resource,
			status: 404,
		});
	}
}

export class InvalidDomainNameError extends RSSBookError {
	public constructor() {
		super({
			code: "INVALID_DOMAIN_NAME",
			message: "Invalid domain name",
			status: 400,
		});
	}
}

export class InvalidDomainSuffixError extends RSSBookError {
	public constructor() {
		super({
			code: "INVALID_DOMAIN_SUFFIX",
			message: "Local domain suffixes are not allowed",
			status: 400,
		});
	}
}

export class InvalidFeedFormatError extends RSSBookError {
	public constructor(format: string) {
		super({
			code: "INVALID_FEED_FORMAT",
			message: `Invalid feed format: ${format}.`,
			status: 400,
		});
	}
}

export class InvalidJsonError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "INVALID_JSON",
			message,
			status: 400,
		});
	}
}

export class InvalidOverrideJsonError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "INVALID_OVERRIDE_JSON",
			message,
			status: 400,
		});
	}
}

export class InvalidPrivateNetworkError extends RSSBookError {
	public constructor() {
		super({
			code: "INVALID_PRIVATE_NETWORK",
			message: "Private network addresses are not allowed",
			status: 400,
		});
	}
}

export class InvalidProtocolError extends RSSBookError {
	public constructor() {
		super({
			code: "INVALID_PROTOCOL",
			message: "Only http and https protocols are allowed",
			status: 400,
		});
	}
}

export class InvalidRawContentError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "INVALID_RAW_CONTENT",
			message,
			status: 400,
		});
	}
}

export class InvalidRoutePathError extends RSSBookError {
	public constructor() {
		super({
			code: "INVALID_ROUTE_PATH",
			message: "Path must start with a leading slash (/).",
			status: 400,
		});
	}
}

export class InvalidSourceSlugError extends RSSBookError {
	public constructor(slug: string) {
		super({
			code: "INVALID_SOURCE_SLUG",
			message: `Error Source Slug: ${slug}.`,
			status: 500,
		});
	}
}

export class InvalidUrlError extends RSSBookError {
	public constructor() {
		super({
			code: "INVALID_URL",
			message: "Invalid URL format",
			status: 400,
		});
	}
}

export class LocalAddressError extends RSSBookError {
	public constructor() {
		super({
			code: "LOCAL_ADDRESS",
			message: "Local addresses are not allowed",
			status: 400,
		});
	}
}

export class LocalIpAddressError extends RSSBookError {
	public constructor() {
		super({
			code: "LOCAL_IP_ADDRESS",
			message: "IP addresses are not allowed",
			status: 400,
		});
	}
}

export class ParseError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "PARSE_ERROR",
			message,
			status: 400,
		});
	}
}

export class PrivateNetworkError extends RSSBookError {
	public constructor() {
		super({
			code: "PRIVATE_NETWORK",
			message: "Private network addresses are not allowed",
			status: 400,
		});
	}
}

export class SourceFetchError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "SOURCE_FETCH",
			message,
			retryable: true,
			status: 502,
		});
	}
}

export class SortFeedError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "SORT_FEED",
			message,
			status: 500,
		});
	}
}

export class UnionFeedError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "UNION_FEED",
			message,
			status: 500,
		});
	}
}

export class IntersectionFeedError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "INTERSECTION_FEED",
			message,
			status: 500,
		});
	}
}

export class UnsupportedFeedFormatError extends RSSBookError {
	public constructor(format: string) {
		super({
			code: "UNSUPPORTED_FEED_FORMAT",
			message: `Unsupported feed format: ${format}.`,
			status: 400,
		});
	}
}

export class UnsupportedBrowserError extends RSSBookError {
	public constructor(message: string) {
		super({
			code: "UNSUPPORTED_BROWSER",
			message,
			status: 500,
		});
	}
}

export class UnsupportedProtocolError extends RSSBookError {
	public constructor(protocol: string) {
		super({
			code: "UNSUPPORTED_PROTOCOL",
			message: `Unsupported Puppeteer browser endpoint protocol: ${protocol}`,
			status: 400,
		});
	}
}

export class TransformFeedError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "TRANSFORM_FEED",
			message,
			status: 500,
		});
	}
}

export class ValidationError extends RSSBookError {
	public constructor(message: string, cause?: unknown) {
		super({
			cause,
			code: "VALIDATION",
			message,
			status: 500,
		});
	}
}
