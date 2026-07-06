import { createRSSBookApp } from "rssbook";

const app = createRSSBookApp();

export default {
	fetch: app.fetch,
};
