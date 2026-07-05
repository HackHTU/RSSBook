import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import github from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("GitHub", () => {
	test("fetches user events", async () => {
		const data = await getRouteData(github, "/events/torvalds");

		expectData(data);
	}, 20_000);

	test("fetches repository releases", async () => {
		const data = await getRouteData(github, "/repo/nodejs/node/releases");

		expectData(data);
	}, 20_000);

	test("accepts optional token config", async () => {
		const data = await getRouteData(github, "/events/torvalds", {
			config: {
				GITHUB_TOKEN: "",
			},
		});

		expect(data.title).toContain("GitHub Events");
	}, 20_000);

	test("fetches user repositories", async () => {
		const data = await getRouteData(github, "/repos/torvalds");

		expectData(data);
	}, 20_000);

	test("fetches repository issues", async () => {
		const data = await getRouteData(github, "/repo/nodejs/node/issues");

		expectData(data);
	}, 20_000);

	test("fetches repository pull requests", async () => {
		const data = await getRouteData(github, "/repo/nodejs/node/pulls");

		expectData(data);
	}, 20_000);

	test("fetches repository commits", async () => {
		const data = await getRouteData(github, "/repo/nodejs/node/commits");

		expectData(data);
	}, 20_000);

	test("fetches repository tags", async () => {
		const data = await getRouteData(github, "/repo/nodejs/node/tags");

		expectData(data);
	}, 20_000);

	test("fetches repository wiki", async () => {
		const data = await getRouteData(github, "/repo/microsoft/vscode/wiki");

		expectData(data);
	}, 20_000);

	test("searches repositories", async () => {
		const data = await getRouteData(github, "/search/RSSHub");

		expectData(data);
	}, 20_000);

	test("fetches trending repositories", async () => {
		const data = await getRouteData(github, "/trending/daily/typescript");

		expectData(data);
	}, 20_000);

	test("fetches topic repositories", async () => {
		const data = await getRouteData(github, "/topics/framework");

		expectData(data);
	}, 20_000);

	test("fetches user activity", async () => {
		const data = await getRouteData(github, "/activity/torvalds");

		expectData(data);
	}, 20_000);
});
