import { routePlugin } from "@/routers";
import { InvalidRoutePathError } from "@/utils/error";

type LocalRoutePath = `/${string}`;

/**
 * Handles an internal route request using the feeds application.
 *
 * This function creates a mock HTTP `GET` request for the given path
 *
 * ! **Usually, you will not need to use this function directly.**
 *
 * @async
 * @function route
 * @param {string} path - The route path to handle. **Must start with a leading slash `/`.**
 * @returns {Promise<Response>} A promise that resolves to a standard Fetch API `Response` object.
 *
 * @example
 * ```ts
 * const res = await route("/feeds/school/htu");
 * ```
 */
export function dispatchRoute(path: LocalRoutePath): Promise<Response> {
	if (!path.startsWith("/")) {
		throw new InvalidRoutePathError();
	}

	const req = new Request(`http://rssbook.test${path}`, {
		method: "GET",
	});
	return routePlugin.handle(req);
}
