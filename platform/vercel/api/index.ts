import { createRSSBookApp } from "rssbook";
import { VercelChromiumBrowser } from "./_browser";

const app = createRSSBookApp({
	browser: new VercelChromiumBrowser(),
});

export default {
	fetch: app.fetch,
};
