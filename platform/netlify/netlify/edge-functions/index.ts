/**
 * Netlify Edge Functions entrypoint
 */

import { createRSSBookApp } from "rssbook";

export const config = { path: "/*" };

const app = createRSSBookApp();

export default app.fetch;
