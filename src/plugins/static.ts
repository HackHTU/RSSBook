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
		return app.use(
			staticPlugin({
				assets: "src/public",
				prefix: "",
			}),
		);
	} else {
		return app;
	}
};
