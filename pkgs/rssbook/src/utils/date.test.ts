import { afterAll, beforeAll, describe, expect, setSystemTime, test } from "bun:test";
import { date } from "@/utils";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;
const month = 30 * day;
const year = 365 * day;

const base = new Date("2025-10-18T00:00:00.000Z"); // Sat

beforeAll(() => {
	setSystemTime(base);
});

afterAll(() => {
	setSystemTime();
});

const lastWeekdayTs = (d: number, base: Date) => {
	// d: 1..7 => Mon..Sun，Date.getDay(): 0..6 => Sun..Sat；
	const target = d % 7;
	const now = new Date(+base);
	const nowDay = now.getDay(); // 0..6
	// if target <= nowDay, go back to this week's target; else go back to last week's target
	const delta = target - (nowDay <= target ? nowDay + 7 : nowDay);
	return +new Date(now.getFullYear(), now.getMonth(), now.getDate() + delta);
};

describe("date", () => {
	const now: Date = new Date();

	test("now", () => {
		expect(date(now)).toBeInstanceOf(Date);

		expect(+date(now)).toBe(+now);
		expect(+date(now.toISOString())).toBe(+now);
	});

	const date1 = new Date(Date.UTC(2025, 10, 1, 12, 3, 22));

	test("UTC date", () => {
		expect(date(date1)).toBeInstanceOf(Date);

		expect(+date(date1)).toBe(+date1);
		expect(+date(date1.toISOString())).toBe(+date1);
	});
});

describe("Date - relative time", () => {
	test("s秒钟前", () => {
		expect(+date("10秒前")).toBe(+base - 10 * second);
	});

	test("m分钟前", () => {
		expect(+date("10分钟前")).toBe(+base - 10 * minute);
	});

	test("m分鐘前", () => {
		expect(+date("10分鐘前")).toBe(+base - 10 * minute);
	});

	test("m分钟后", () => {
		expect(+date("10分钟后")).toBe(+base + 10 * minute);
	});

	test("a minute ago", () => {
		expect(+date("a minute ago")).toBe(+base - 1 * minute);
	});

	test("s minutes ago", () => {
		expect(+date("10 minutes ago")).toBe(+base - 10 * minute);
	});

	test("s mins ago", () => {
		expect(+date("10 mins ago")).toBe(+base - 10 * minute);
	});

	test("in s minutes", () => {
		expect(+date("in 10 minutes")).toBe(+base + 10 * minute);
	});

	test("in an hour", () => {
		expect(+date("in an hour")).toBe(+base + 1 * hour);
	});

	test("H小时前", () => {
		expect(+date("10小时前")).toBe(+base - 10 * hour);
	});

	test("H个小时前", () => {
		expect(+date("10个小时前")).toBe(+base - 10 * hour);
	});

	test("D天前", () => {
		expect(+date("10天前")).toBe(+base - 10 * day);
	});

	test("W周前", () => {
		expect(+date("10周前")).toBe(+base - 10 * week);
	});

	test("W星期前", () => {
		expect(+date("10星期前")).toBe(+base - 10 * week);
	});

	test("W个星期前", () => {
		expect(+date("10个星期前")).toBe(+base - 10 * week);
	});

	test("M月前", () => {
		expect(+date("1月前")).toBe(+base - 1 * month);
	});

	test("M个月前", () => {
		expect(+date("1个月前")).toBe(+base - 1 * month);
	});

	test("Y年前", () => {
		expect(+date("1年前")).toBe(+base - 1 * year);
	});

	test("Y年M个月前", () => {
		expect(+date("1年1个月前")).toBe(+base - 1 * year - 1 * month);
	});

	test("D天H小时前", () => {
		expect(+date("1天1小时前")).toBe(+base - 1 * day - 1 * hour);
	});

	test("H小时m分钟s秒钟前", () => {
		expect(+date("1小时1分钟1秒钟前")).toBe(+base - 1 * hour - 1 * minute - 1 * second);
	});

	test("Dd Hh mm ss ago", () => {
		expect(+date("1d 1h 1m 1s ago")).toBe(+base - 1 * day - 1 * hour - 1 * minute - 1 * second);
	});

	test("H小时m分钟s秒钟后", () => {
		expect(+date("1小时1分钟1秒钟后")).toBe(+base + 1 * hour + 1 * minute + 1 * second);
	});

	test("今天 => 当日零点", () => {
		const midnight = new Date(+base);
		midnight.setHours(0, 0, 0, 0);
		expect(+date("今天")).toBe(+midnight);
	});

	test("Today H:m", () => {
		expect(+date("Today 08:00")).toBe(+base + 8 * hour);
	});

	test("Today, h:m a", () => {
		expect(+date("Today, 8:00 pm")).toBe(+base + 20 * hour);
	});

	test("今天 H:m", () => {
		expect(+date("今天 08:00")).toBe(+base + 8 * hour);
	});

	test("今天H点m分", () => {
		expect(+date("今天8点0分")).toBe(+base + 8 * hour);
	});

	test("昨日H点m分s秒", () => {
		expect(+date("昨日20时0分0秒")).toBe(+base - 4 * hour);
	});

	test("前天 H:m", () => {
		expect(+date("前天 20:00")).toBe(+base - 1 * day - 4 * hour);
	});

	test("明天 H:m", () => {
		expect(+date("明天 20:00")).toBe(+base + 1 * day + 20 * hour);
	});

	test("星期几 h:m (星期一)", () => {
		expect(+date("星期一 8:00")).toBe(lastWeekdayTs(1, base) + 8 * hour);
	});

	test("周几 h:m (周二)", () => {
		expect(+date("周二 8:00")).toBe(lastWeekdayTs(2, base) + 8 * hour);
	});

	test("星期天 h:m", () => {
		expect(+date("星期天 8:00")).toBe(lastWeekdayTs(7, base) + 8 * hour);
	});

	test("Invalid => Invalid Date", () => {
		expect(+date("Ciallo～(∠・ω< )☆")).toBe(+base);
	});
});

describe("Date - edge cases", () => {
	test("handles invalid Date instance", () => {
		const invalidDate = new Date("invalid");
		const result = date(invalidDate);
		expect(Number.isNaN(result.getTime())).toBe(false);
		expect(result.getTime()).toBeGreaterThan(0);
	});

	test("handles numeric timestamp", () => {
		const timestamp = 1234567890000;
		const result = date(timestamp);
		expect(+result).toBe(timestamp);
		expect(result.getFullYear()).toBe(2009);
	});

	test("handles infinite number", () => {
		const result = date(Infinity);
		expect(Number.isNaN(result.getTime())).toBe(false);
		expect(result.getTime()).toBeGreaterThan(0);
	});

	test("handles NaN number", () => {
		const result = date(Number.NaN);
		expect(Number.isNaN(result.getTime())).toBe(false);
		expect(result.getTime()).toBeGreaterThan(0);
	});

	test("handles unix timestamp (seconds)", () => {
		const unixTimestamp = 1234567890;
		const result = date(unixTimestamp);
		expect(result.getFullYear()).toBe(1970);
		expect(result.getTime()).toBeGreaterThan(0);
	});

	test("handles date with timezone offset", () => {
		const result = date("2025-10-18T12:00:00+08:00");
		expect(result.getFullYear()).toBe(2025);
		expect(result.getMonth()).toBe(9); // October
		expect(result.getDate()).toBe(18);
	});

	test("handles date with Z timezone", () => {
		const result = date("2025-10-18T12:00:00Z");
		expect(result.getFullYear()).toBe(2025);
		expect(result.getMonth()).toBe(9); // October
		expect(result.getDate()).toBe(18);
	});

	test("handles time-only string", () => {
		const result = date("14:30");
		expect(result.getHours()).toBe(14);
		expect(result.getMinutes()).toBe(30);
	});

	test("handles time-only string with AM/PM", () => {
		const result = date("2:30pm");
		expect(result.getHours()).toBe(14);
		expect(result.getMinutes()).toBe(30);
	});

	test("handles empty string", () => {
		const result = date("");
		expect(Number.isNaN(result.getTime())).toBe(false);
		expect(result.getTime()).toBeGreaterThan(0);
	});

	test("handles string with timezone hint", () => {
		const result = date("2025-10-18 12:00 +0800");
		expect(result.getFullYear()).toBe(2025);
		expect(result.getMonth()).toBe(9); // October
		expect(result.getDate()).toBe(18);
	});
});
