import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import type { Page } from "puppeteer";
import { Browser } from "@/browser";
import { initPlugin } from "@/plugins";
import type { Data } from "@/types";
import source from ".";

const bilibiliDynamicHTML = /* html */ `
<html>
	<body>
		<div class="h-name">鹿目圆</div>
		<div class="bili-dyn-list__item">
			<div class="bili-dyn-title__text">鹿目圆</div>
			<div class="bili-dyn-time">2025年03月03日</div>
			<div class="bili-rich-text">馒头卡mvp，吼姆拉躺赢狗</div>
			<a class="bili-dyn-card-video" href="//www.bilibili.com/video/BV1MaXZYQEZr/">
				晓美焰：救不了小圆怎么不找找自己问题
			</a>
			<img src="//i1.hdslb.com/bfs/archive/5414e6ba39e0be45897191486e10fd0fddc6fc4d.jpg@472w_264h_1c_!web-dynamic.webp">
		</div>
		<div class="bili-dyn-list__item">
			<div class="bili-dyn-title__text">鹿目圆</div>
			<div class="bili-dyn-time">2025年11月08日</div>
			<div class="opus-paragraph-children">好像被片姐盯上了，被误清的只能说抱歉了</div>
			<img src="//i1.hdslb.com/bfs/new_dyn/0c62799cc7ce723d4a35c00ef9547d1150.jpg@574w_560h_1e_1c.webp">
		</div>
	</body>
</html>
`;

class StaticHTMLBrowser extends Browser {
	public constructor(private readonly html: string) {
		super(() => {
			throw new Error("StaticHTMLBrowser does not create a Puppeteer browser.");
		});
	}

	public override async withPage<T>(callback: (page: Page) => Promise<T>): Promise<T> {
		return callback({
			close: async () => {},
			content: async () => this.html,
			goto: async () => null,
			waitForSelector: async () => null,
		} as unknown as Page);
	}
}

describe("Browser example", () => {
	test("builds Bilibili space dynamic feed from rendered HTML", async () => {
		const sourceConfig = source.getConfig();
		const app = new Elysia()
			.use(
				initPlugin({
					browser: new StaticHTMLBrowser(bilibiliDynamicHTML),
				}),
			)
			.use(source.getApp());

		const response = await app.handle(
			new Request(`http://rssbook.test/${sourceConfig.slug}/bilibili/space/50/dynamic?type=raw`),
		);
		const data = (await response.json()) as Data;

		expect(response.status).toBe(200);
		expect(data.title).toBe("鹿目圆 - Bilibili Dynamics");
		expect(data.item).toHaveLength(2);
		expect(data.item?.[0]?.link).toBe("https://www.bilibili.com/video/BV1MaXZYQEZr/");
		expect(data.item?.[0]?.image).toContain("/bfs/archive/");
		expect(data.item?.[1]?.title).toContain("好像被片姐盯上了");
		expect(data.item?.[1]?.image).toContain("/bfs/new_dyn/");
	});
});
