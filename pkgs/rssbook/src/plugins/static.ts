import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";

export const assetsPlugin = (enable: boolean = true) => {
	const app = new Elysia({
		detail: {
			hide: true,
		},
		name: "RSSBook/Static",
	});

	if (enable) {
		const assetsPath = new URL("../public", import.meta.url).pathname;

		return app.use(
			staticPlugin({
				assets: assetsPath,
				prefix: "",
			}),
		);
	} else {
		return app;
	}
};
