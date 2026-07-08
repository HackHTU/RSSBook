import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";

const assetsPath = new URL("../public", import.meta.url).pathname;
const port = Number(Bun.env.PORT ?? 3000);

const app = new Elysia()
	.use(
		await staticPlugin({
			assets: assetsPath,
			bunFullstack: true,
			prefix: "/",
		}),
	)
	.listen(port, () =>
		console.log(`Server running on http://localhost:${port}`),
	);

export type App = typeof app;
