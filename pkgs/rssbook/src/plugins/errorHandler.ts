import { Elysia } from "elysia";
import pkg from "../../package.json" with { type: "json" };

const { version } = pkg;

import { defaultErrorPage } from "@/books/error";
import type { ErrorPageProps } from "@/types";
import { RSSBookError } from "@/utils/error";

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
		if (error instanceof RSSBookError) {
			set.status = error.status;
		}

		set.headers["content-type"] = "text/html";

		const props: ErrorPageProps = {
			code,
			error,
			version,
		};

		return defaultErrorPage(props);
	},
);
