import { Elysia, t } from "elysia";
import { type Data, feedData, feedType } from "@/types";
import { render } from "@/utils";

export const renderQuery = {
	styled: t.Optional(
		t.Boolean({
			default: true,
			title: "Whether to apply `xls` style to rss/atom feed.",
		}),
	),
	type: t.Optional(feedType),
};

export const renderPlugin = new Elysia({
	name: "RSSBook/Render",
})
	.model({
		feedData,
		feedQuery: t.Object(renderQuery),
		feedType,
	})
	.guard({
		as: "scoped",
		query: "feedQuery",
		response: "feedData",
		schema: "standalone",
	})
	.onAfterHandle(
		{
			as: "scoped",
		},
		({ responseValue, set, query: { type, styled } }) => {
			const isStyled = !!(styled ?? true);

			switch (type) {
				case "json":
					set.headers["content-type"] = "application/json";
					return render(responseValue as Data, "json");
				case "raw":
					set.headers["content-type"] = "application/json";
					return responseValue;
				case "atom":
					set.headers["content-type"] = "application/xml";
					return render(responseValue as Data, "atom", isStyled);
				default:
					set.headers["content-type"] = "application/xml";
					return render(responseValue as Data, "rss", isStyled);
			}
		},
	);
