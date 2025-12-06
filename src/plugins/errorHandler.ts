import { Elysia } from "elysia";
import { version } from "@/../package.json";

import { defaultErrorPage } from "@/books/theme/error";
import type { ErrorPageProps } from "@/types";

/**
 * Error Handler Plugin
 *
 * Handles errors globally and renders a custom error page.
 */
export const errorHandlerPlugin = new Elysia({ name: "RSSBook/ErrorHandler" }).onError(
	{
		as: "global",
	},
	({ code, error, set }) => {
		set.headers["content-type"] = "text/html";

		const props: ErrorPageProps = {
			code,
			error,
			version,
		};

		return defaultErrorPage(props);
	},
);
