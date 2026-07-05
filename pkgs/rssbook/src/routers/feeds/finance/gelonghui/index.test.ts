import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import gelonghui from ".";

describe("Gelonghui", () => {
	test("fetches live updates", async () => {
		const data = await getRouteData(gelonghui, "/live");

		expect(data.title).toContain("Gelonghui");
	}, 20_000);
});
