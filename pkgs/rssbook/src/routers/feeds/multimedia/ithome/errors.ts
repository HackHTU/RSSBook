import { RSSBookError } from "@/utils/error";

export class InvalidRankingTypeError extends RSSBookError {
	public constructor(type: string) {
		super({
			code: "INVALID_RANKING_TYPE",
			message: `Invalid ranking type: ${type}`,
			status: 400,
		});
	}
}
