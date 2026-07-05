import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import kr36 from ".";

describe("36Kr", () => {
	test("fetches news", async () => {
		const data = await getRouteData(kr36, "/news");

		expect(data.title).toContain("36Kr");
	}, 20_000);
});
