import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";

// MUST WRAP IN FUNCTION
export const assetsPlugin = () =>
	new Elysia({
		detail: {
			hide: true,
		},
		name: "RSSBook/Static",
	}).use(
		staticPlugin({
			assets: "src/public",
			prefix: "",
		}),
	);
