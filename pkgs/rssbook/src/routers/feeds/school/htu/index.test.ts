import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import htu from ".";

describe("河南师范大学", () => {
	test("fetches official website news", async () => {
		const data = await getRouteData(htu, "/www/8954");

		expectHTUData(data);
	}, 20_000);

	test("fetches teaching notices", async () => {
		const data = await getRouteData(htu, "/teaching/3251");

		expectHTUData(data);
	}, 20_000);
});

function expectHTUData(data: Data) {
	expect(data.title).toContain("河南师范大学");
	expect(data.link).toStartWith("https://www.htu.edu.cn/");
	expect(data.language).toBe("zh-CN");
	expect(data.item?.length).toBeGreaterThan(0);

	const item = data.item?.[0];
	expect(item?.title.length).toBeGreaterThan(0);
	expect(item?.link).toStartWith("https://www.htu.edu.cn/");
}
