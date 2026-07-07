export class BrowserUnavailableError extends Error {
	public constructor() {
		super("This feed route requires browser support, but RSSBook was created with browser: false.");
		this.name = "BrowserUnavailableError";
	}
}

export class BrowserRouteNotEnabledError extends Error {
	public constructor(route: string) {
		super(
			`This feed route attempted to use browser support, but routeConfig.browser is not true for ${route}.`,
		);
		this.name = "BrowserRouteNotEnabledError";
	}
}
