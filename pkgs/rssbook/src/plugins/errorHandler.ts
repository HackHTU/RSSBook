import { Elysia } from "elysia";
import pkg from "../../package.json" with { type: "json" };

const { version } = pkg;

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
