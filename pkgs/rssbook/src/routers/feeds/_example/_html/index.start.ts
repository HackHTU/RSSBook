import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";
export default new Source({
	description: ``,
	domain: "",
	slug: "slug",
	title: "",
}).feed(
	{
		description: ``,
		fulltext: true,
		language: ["en-US"],
		maintainer: { name: "RSSBook" },
		title: "",
		withImage: "If-Present",
	},
	(app) =>
		app.get(
			"/user/:username",
			async ({ meta: { domain }, params: { username } }) => {
				const link = `https://${domain}/user/${username}`;
				return {
					item: [] satisfies DataItem[],
					link,
					title: "Hello World",
				} satisfies Data;
			},
			{
				params: t.Object({
					username: t.String({}),
				}),
			},
		),
);
