import { Elysia } from "elysia";
import { injectPlugin, renderPlugin } from "@/plugins";

import feeds from "./feeds";
import utils from "./utils";

export const routePlugin = new Elysia({
	name: "RSSBook/Router",
})
	// inject utils functions
	.use(injectPlugin)
	.use(renderPlugin)
	.use([feeds, utils]);
