import type { Data, DataItem } from "./data";
import type { Meta } from "./meta";

///
/// ErrorPage Theme Type
///

/**
 * In handler, `throw status()` may throw a custom status.
 * @see {@link https://elysiajs.com/patterns/error-handling.html#custom-error}
 */
type customStatus = { code: string | number; response: unknown };

export interface ErrorPageProps {
	code: string | number;
	error: Error | customStatus;
	/**
	 * The version of the RSSBook application.
	 */
	version: string;
}

export type ErrorPageTheme = (
	_props: ErrorPageProps,
) => JSX.Element | Promise<JSX.Element> | string | Promise<string>;

///
/// Preview Theme Type
///

export interface PaginationInfo {
	/** current page */
	page: number;
	/** page size */
	limit: number;
	/** total items */
	total: number;
	totalPages: number;
	hasPrev: boolean;
	hasNext: boolean;
}

export interface FilterInfo {
	/** Current search keyword */
	search: string;
	/** Currently selected category */
	category: string;
}

export interface ThemeProps {
	meta: Meta;
	categories: {
		name: string;
	}[];

	dataInfo: Omit<Data, "items">;
	items: DataItem[];
	pagination: PaginationInfo;
	filter: FilterInfo;
}

export type Theme = {
	render: (_props: ThemeProps) => JSX.Element | Promise<JSX.Element> | string | Promise<string>;
};
