import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import duration from "dayjs/plugin/duration.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import weekday from "dayjs/plugin/weekday.js";
import { logger } from "./logger";

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(utc);
dayjs.extend(timezone);

const MINUTES_PER_HOUR = 60;

/**
 * Word rule type for matching date words and calculating start times.
 */
type WordRule = {
	regExp: RegExp;
	startAt: (timezone?: number) => dayjs.Dayjs;
};

/**
 * Patterns for time units in Chinese and English.
 */
const patterns: Array<{ unit: string; regExp: RegExp }> = [
	{ regExp: /(\d+)(?:年|y(?:ea)?rs?)/, unit: "years" },
	{ regExp: /(\d+)(?:[个個]?月|months?)/, unit: "months" },
	{ regExp: /(\d+)(?:周|[个個]?星期|weeks?)/, unit: "weeks" },
	{ regExp: /(\d+)(?:天|日|d(?:ay)?s?)/, unit: "days" },
	{ regExp: /(\d+)(?:[个個]?(?:小?时|時|点|點)|h(?:(?:ou)?r)?s?)/, unit: "hours" },
	{ regExp: /(\d+)(?:分[鐘钟]?|m(?:in(?:ute)?)?s?)/, unit: "minutes" },
	{ regExp: /(\d+)(?:秒[鐘钟]?|s(?:ec(?:ond)?)?s?)/, unit: "seconds" },
];

const PATTERN_SIZE = patterns.length;

/**
 * Word rules for relative dates like "today", "yesterday", etc.
 */
const wordRules: WordRule[] = [
	{
		regExp: /^(?:今[天日]|to?day?)(.*)/,
		startAt: (tz) => getNowWithTimezone(tz),
	},
	{
		regExp: /^(?:昨[天日]|y(?:ester)?day?)(.*)/,
		startAt: (tz) => getNowWithTimezone(tz).subtract(1, "day"),
	},
	{
		regExp: /^(?:前天|(?:the)?d(?:ay)?b(?:eforeyesterda)?y)(.*)/,
		startAt: (tz) => getNowWithTimezone(tz).subtract(2, "day"),
	},
	{
		regExp: /^(?:周|星期)一(.*)/,
		startAt: (tz) => getWeekdayReference(1, tz),
	},
	{
		regExp: /^(?:周|星期)二(.*)/,
		startAt: (tz) => getWeekdayReference(2, tz),
	},
	{
		regExp: /^(?:周|星期)三(.*)/,
		startAt: (tz) => getWeekdayReference(3, tz),
	},
	{
		regExp: /^(?:周|星期)四(.*)/,
		startAt: (tz) => getWeekdayReference(4, tz),
	},
	{
		regExp: /^(?:周|星期)五(.*)/,
		startAt: (tz) => getWeekdayReference(5, tz),
	},
	{
		regExp: /^(?:周|星期)六(.*)/,
		startAt: (tz) => getWeekdayReference(6, tz),
	},
	{
		regExp: /^(?:周|星期)[天日](.*)/,
		startAt: (tz) => getWeekdayReference(7, tz),
	},
	{
		regExp: /^(?:明[天日]|to?m(?:orrow)?)(.*)/,
		startAt: (tz) => getNowWithTimezone(tz).add(1, "day"),
	},
	{
		regExp: /^(?:[后後][天日]|(?:the)?dayaftertomorrow)(.*)/,
		startAt: (tz) => getNowWithTimezone(tz).add(2, "day"),
	},
];

/**
 * Supported absolute date formats.
 */
const ABSOLUTE_FORMATS: string[] = [
	"YYYY-MM-DDTHH:mm:ss.SSSZ",
	"YYYY-MM-DDTHH:mm:ssZ",
	"YYYY-MM-DDTHH:mmZ",
	"YYYY-MM-DD HH:mm:ss",
	"YYYY-MM-DD HH:mm",
	"YYYY/MM/DD HH:mm:ss",
	"YYYY/MM/DD HH:mm",
	"YYYY-MM-DD",
	"YYYY/MM/DD",
	"MM/DD/YYYY HH:mm:ss",
	"MM/DD/YYYY HH:mm",
	"MM/DD/YYYY",
	"DD/MM/YYYY HH:mm:ss",
	"DD/MM/YYYY HH:mm",
	"DD/MM/YYYY",
	"YYYYMMDDTHHmmssZ",
	"YYYYMMDDHHmmss",
];

/**
 * Regex for extracting timezone hints from date strings.
 */
const TIMEZONE_HINT_REGEX = /\s+(?:utc|gmt)?([+-]\d{1,2})(?::?(\d{2}))?\s*$/i;

/**
 * Normalize relative date input.
 * @param value - Input string
 * @returns Normalized string
 */
const normalizeRelativeInput = (value: string) =>
	value
		.toLowerCase()
		.replaceAll(/(^an?\s)|(\san?\s)/g, "1")
		.replaceAll(/几|幾/g, "3")
		.replaceAll(/[\s,]/g, "");

/**
 * Sanitize time portion string.
 * @param value - Time string
 * @returns Sanitized time string
 */
const sanitizeTimePortion = (value: string) =>
	/(?:am|pm)$/.test(value) ? value.replace(/a|pm/, " $&") : value;

/**
 * Set timezone on a dayjs instance.
 * @param instance - Dayjs instance
 * @param timezone - Timezone offset in hours
 * @param keepLocalTime - Whether to keep local time
 * @returns Dayjs instance with timezone set
 */
const setTimezone = (instance: dayjs.Dayjs, timezone?: number, keepLocalTime = false) => {
	if (typeof timezone !== "number" || !Number.isFinite(timezone)) {
		return instance;
	}
	const offsetMinutes = timezone * MINUTES_PER_HOUR;
	return instance.utcOffset(offsetMinutes, keepLocalTime);
};

/**
 * Get current time with timezone.
 * @param timezone - Timezone offset in hours
 * @returns Dayjs instance
 */
const getNowWithTimezone = (timezone?: number) => setTimezone(dayjs(), timezone);

/**
 * Get weekday reference date.
 * @param weekdayIndex - Weekday index (1=Monday, 7=Sunday)
 * @param timezone - Timezone offset in hours
 * @returns Dayjs instance
 */
const getWeekdayReference = (weekdayIndex: number, timezone?: number) => {
	const now = getNowWithTimezone(timezone);
	const target = setTimezone(dayjs(), timezone).weekday(weekdayIndex);
	return now.isSameOrBefore(target) ? target.subtract(1, "week") : target;
};

/**
 * Convert matched time strings to duration object.
 * @param matches - Array of matched strings
 * @returns Duration object
 */
const toDurations = (matches: string[]): Record<string, number> => {
	const durations: Record<string, number> = {};
	if (!matches || matches.length === 0) {
		return durations;
	}

	let lastPatternIndex = 0;

	for (const matchText of matches) {
		for (let idx = lastPatternIndex; idx < PATTERN_SIZE; idx++) {
			const matched = patterns[idx].regExp.exec(matchText);
			if (matched) {
				const numericValue = Number(matched[1]);
				if (!Number.isNaN(numericValue)) {
					const unit = patterns[idx].unit;
					if (unit === "weeks") {
						durations.days = (durations.days ?? 0) + numericValue * 7;
					} else {
						durations[unit] = numericValue;
					}
				}
				lastPatternIndex = idx;
				break;
			}
		}
	}

	return durations;
};

/**
 * Convert dayjs instance to native Date.
 * @param instance - Dayjs instance
 * @returns Native Date or null if invalid
 */
const toNativeDate = (instance: dayjs.Dayjs): Date | null =>
	instance.isValid() ? instance.toDate() : null;

/**
 * Check if date string has explicit timezone.
 * @param value - Date string
 * @returns True if has timezone
 */
const hasExplicitTimezone = (value: string) => /([zZ]|[+-]\d{2}(?::?\d{2})?)$/.test(value.trim());

/**
 * Extract timezone hint from date string.
 * @param raw - Raw date string
 * @returns Object with sanitized string and timezone
 */
const extractTimezoneHint = (raw: string): { sanitized: string; timezone?: number } => {
	const match = raw.match(TIMEZONE_HINT_REGEX);
	if (!match || match.index === undefined) {
		return { sanitized: raw };
	}

	const hoursWithSign = match[1];
	const minutesPart = match[2];
	const sign = hoursWithSign.startsWith("-") ? -1 : 1;
	const hour = Math.abs(Number(hoursWithSign));
	const minute = minutesPart ? Number(minutesPart) : 0;

	if (Number.isNaN(hour) || Number.isNaN(minute)) {
		return { sanitized: raw };
	}

	const offsetHours = sign * (hour + minute / MINUTES_PER_HOUR);
	const sanitized = raw.slice(0, match.index).trim();

	return { sanitized, timezone: offsetHours };
};

/**
 * Parse relative date string.
 * @param input - Relative date string
 * @param timezone - Timezone offset in hours
 * @returns Date or null
 */
const parseRelativeDate = (input: string, timezone?: number): Date | null => {
	if (!input.trim()) {
		return null;
	}

	const normalized = normalizeRelativeInput(input);
	const matches = normalized.match(/(?:\D+)?\d+(?!:|-|\/|(a|p)m)\D+/g);

	if (matches?.length) {
		const parts = [...matches];
		const lastPart = parts.pop();

		if (lastPart) {
			const beforeMatches = /(.*)(?:[之以]?前|ago)$/.exec(lastPart);
			if (beforeMatches) {
				const value = beforeMatches[1]?.trim();
				if (value) {
					parts.push(value);
				}
				const durationsObject = toDurations(parts);
				const result = getNowWithTimezone(timezone).subtract(dayjs.duration(durationsObject));
				return toNativeDate(result);
			}

			const afterMatches = /^(?:in(.*)|(.*)[之以]?[后後])$/.exec(lastPart);
			if (afterMatches) {
				const value = (afterMatches[1] ?? afterMatches[2] ?? "").trim();
				if (value) {
					parts.push(value);
				}
				const durationsObject = toDurations(parts);
				const result = getNowWithTimezone(timezone).add(dayjs.duration(durationsObject));
				return toNativeDate(result);
			}

			parts.push(lastPart);
		}

		const firstPart = parts.shift();

		if (firstPart) {
			for (const rule of wordRules) {
				const wordMatches = rule.regExp.exec(firstPart);
				if (wordMatches) {
					const remainder = wordMatches[1]?.trim();
					if (remainder) {
						parts.unshift(remainder);
					}
					const durationsObject = toDurations(parts);
					const startAt = rule.startAt(timezone).startOf("day");
					const result = startAt.add(dayjs.duration(durationsObject));
					return toNativeDate(result);
				}
			}
		}
	} else {
		for (const rule of wordRules) {
			const wordMatches = rule.regExp.exec(normalized);
			if (wordMatches) {
				const timePortion = wordMatches[1]?.trim() ?? "";
				const startAt = rule.startAt(timezone).startOf("day");

				if (!timePortion) {
					return toNativeDate(startAt);
				}

				const candidate =
					`${startAt.format("YYYY-MM-DD")} ${sanitizeTimePortion(timePortion)}`.trim();
				const parsed = parseAbsoluteDate(candidate, timezone);
				if (parsed) {
					return parsed;
				}
			}
		}
	}

	return null;
};

/**
 * Parse absolute date string.
 * @param input - Absolute date string
 * @param timezone - Timezone offset in hours
 * @returns Date or null
 */
const parseAbsoluteDate = (input: string, timezone?: number): Date | null => {
	const value = input.trim();
	if (!value) {
		return null;
	}

	if (/^\d+$/.test(value)) {
		const numeric = Number(value);
		if (!Number.isFinite(numeric)) {
			return null;
		}
		const result = value.length <= 10 ? dayjs.unix(numeric) : dayjs(numeric);
		return result.isValid() ? result.toDate() : null;
	}

	const timeOnlyMatch = value.match(/^(\d{1,2}:\d{2}(?::\d{2})?)(am|pm)?$/);
	if (timeOnlyMatch) {
		const now = getNowWithTimezone(timezone).startOf("day");
		const candidate = `${now.format("YYYY-MM-DD")} ${sanitizeTimePortion(value)}`;
		return parseAbsoluteDate(candidate, timezone);
	}

	for (const format of ABSOLUTE_FORMATS) {
		const parsed = dayjs(value, format, true);
		if (parsed.isValid()) {
			const adjusted =
				!hasExplicitTimezone(value) && typeof timezone === "number" && Number.isFinite(timezone)
					? setTimezone(parsed, timezone, true)
					: parsed;
			return toNativeDate(adjusted);
		}
	}

	const fallback = dayjs(value);
	if (!fallback.isValid()) {
		return null;
	}

	if (!hasExplicitTimezone(value) && typeof timezone === "number" && Number.isFinite(timezone)) {
		const adjusted = setTimezone(fallback, timezone, true);
		return toNativeDate(adjusted);
	}

	return toNativeDate(fallback);
};

/**
 * Universal date parser.
 * @param date - Date input
 * @param timezone - Timezone offset in hours
 * @returns Date object
 */
export function date(date: Date | string | number): Date;

/**
 * Universal date parser.
 * @param timestamp - Unix timestamp
 * @returns Date object
 */
export function date(timestamp: number): Date;

/**
 * Universal date parser.
 * @param date - Date string
 * @param timezone - Timezone offset in hours
 * @returns Date object
 */
export function date(date: string, timezone?: number): Date;

/**
 * Universal date parser implementation.
 * @param date - Date input
 * @param timezone - Timezone offset in hours
 * @returns Date object, current date if parsing fails
 */
export function date(date: string | number | Date, timezone?: number): Date {
	if (date instanceof Date) {
		if (Number.isNaN(date.getTime())) {
			logger.info("Invalid Date instance provided.", date);
			return new Date();
		}
		return date;
	}

	try {
		if (typeof date === "number") {
			if (!Number.isFinite(date)) {
				logger.info("Invalid numeric timestamp provided.", date);
				return new Date();
			}
			const result = dayjs(date);
			if (!result.isValid()) {
				logger.info("Unable to parse numeric timestamp.", date);
				return new Date();
			}
			return result.toDate();
		}

		if (typeof date === "string") {
			const { sanitized, timezone: extractedTimezone } = extractTimezoneHint(date);
			const effectiveTimezone = extractedTimezone ?? timezone;
			const trimmedInput = sanitized.trim();

			const relativeResult = parseRelativeDate(trimmedInput, effectiveTimezone);
			if (relativeResult) {
				return relativeResult;
			}

			const absoluteResult = parseAbsoluteDate(trimmedInput, effectiveTimezone);
			if (absoluteResult) {
				return absoluteResult;
			}

			logger.info("Unable to parse date string.", date);
			return new Date();
		}
	} catch (error) {
		logger.info("Unexpected error while parsing date input.", date, error);
		return new Date();
	}

	logger.info("Unsupported input type for date parser.", date);
	return new Date();
}
