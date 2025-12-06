import { type Language, languageCodes } from "@/types";

const languageMap: Map<string, Language> = new Map(
	languageCodes.map((language) => [language.toLowerCase(), language] as const),
);
/**
 * Parse the Accept-Language header and detect the preferred language.
 *
 * @param acceptLanguage language string from the Accept-Language header
 * @returns the detected language or undefined if not found
 */
export function detectLanguage(acceptLanguage?: string): Language | undefined {
	const normalizedAcceptLanguage = acceptLanguage?.trim();
	if (!normalizedAcceptLanguage || normalizedAcceptLanguage === "*") {
		return undefined;
	}

	type ParsedRange = { tag: string; q: number };
	const parsedRanges: ParsedRange[] = normalizedAcceptLanguage
		.split(",")
		.map((segment) => {
			const [tagPart, qPart] = segment.trim().split(";");
			const q = qPart?.trim().startsWith("q=") ? Number.parseFloat(qPart.trim().slice(2)) : 1;
			return { q: Number.isNaN(q) ? 1 : q, tag: tagPart.trim() };
		})
		.filter((r) => r.tag)
		.sort((a, b) => b.q - a.q); // sort by q descending

	for (const { tag } of parsedRanges) {
		const tagLower = tag.toLowerCase();

		const exact = languageMap.get(tagLower);
		if (exact) return exact;

		const primary = tagLower.split("-")[0];
		const primaryExact = languageMap.get(primary);
		if (primaryExact) return primaryExact;
	}

	return "other";
}
