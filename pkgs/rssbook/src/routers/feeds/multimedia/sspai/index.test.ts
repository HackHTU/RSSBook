import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("SSPAI", () => {
	test("fetches home articles", async () => {
		const data = await getRouteData(source, "/index");

		expectData(data);
	}, 20_000);

	test("fetches matrix articles", async () => {
		const data = await getRouteData(source, "/matrix");

		expectData(data);
	}, 20_000);

	test("fetches author articles", async () => {
		const data = await getRouteData(source, "/author/796518");

		expectData(data);
	}, 20_000);

	test("fetches column articles", async () => {
		const data = await getRouteData(source, "/column/262");

		expectData(data);
	}, 20_000);

	test("fetches paid series updates", async () => {
		const data = await getRouteData(source, "/series/77");

		expectData(data);
	}, 20_000);

	test("fetches tag articles", async () => {
		const data = await getRouteData(source, "/tag/apple");

		expectData(data);
	}, 20_000);

	test("fetches topic articles", async () => {
		const data = await getRouteData(source, "/topic/250");

		expectData(data);
	}, 20_000);

	test("fetches topic square updates", async () => {
		const data = await getRouteData(source, "/topics");

		expectData(data);
	}, 20_000);

	test("fetches user bookmarks", async () => {
		const data = await getRouteData(source, "/bookmarks/urfp0d9i");

		expectData(data);
	}, 20_000);

	test("fetches newly listed paid series", async () => {
		const data = await getRouteData(source, "/series");

		expectData(data);
	}, 20_000);

	test("fetches user activity", async () => {
		const data = await getRouteData(source, "/activity/urfp0d9i");

		expectData(data);
	}, 20_000);
});
