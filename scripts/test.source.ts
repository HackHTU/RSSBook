/// <reference types="bun-types" />
/** biome-ignore-all lint/suspicious/noConsole: true */

import { existsSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import * as readline from "node:readline/promises";
import { $ } from "bun";

const FEEDS_DIR = join(import.meta.dir, "../src/routers/feeds");
const PROJECT_ROOT = join(import.meta.dir, "..");

// ANSI color codes
const colors = {
	blue: "\x1b[36m",
	dim: "\x1b[2m",
	green: "\x1b[32m",
	magenta: "\x1b[35m",
	red: "\x1b[31m",
	reset: "\x1b[0m",
	yellow: "\x1b[33m",
};

// Helper functions
function log(message: string, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

function error(message: string) {
	log(`✗ ${message}`, colors.red);
}

function success(message: string) {
	log(`✓ ${message}`, colors.green);
}

function info(message: string) {
	log(`ℹ ${message}`, colors.blue);
}

function warning(message: string) {
	log(`⚠ ${message}`, colors.yellow);
}

function header(message: string) {
	console.log();
	log(`${"=".repeat(60)}`, colors.blue);
	log(`  ${message}`, colors.blue);
	log(`${"=".repeat(60)}`, colors.blue);
	console.log();
}

// Prompt user for input
async function prompt(question: string, rl: readline.Interface): Promise<string> {
	const answer = await rl.question(`${colors.yellow}? ${question}${colors.reset} `);
	return answer.trim();
}

interface ModifiedFeed {
	category: string;
	name: string;
	path: string;
	hasTest: boolean;
	testPath?: string;
	modifiedFiles: string[];
}

// Get git modified files
async function getGitModifiedFiles(): Promise<string[]> {
	try {
		// Get both staged and unstaged changes
		const result = await $`git status --porcelain`.text();
		const lines = result.trim().split("\n").filter(Boolean);

		const modifiedFiles: string[] = [];

		for (const line of lines) {
			// Parse git status output
			// Format: XY filename
			// X = staged status, Y = unstaged status
			const status = line.substring(0, 2);
			const file = line.substring(3).trim();

			// Include new (A, ?), modified (M), renamed (R), copied (C) files
			if (status.match(/[MARC?]/)) {
				modifiedFiles.push(file);
			}
		}

		return modifiedFiles;
	} catch (err) {
		error(`Failed to get git status: ${err}`);
		return [];
	}
}

// Check if a path is a feed directory
function isFeedDirectory(path: string): { isValid: boolean; category?: string; name?: string } {
	const relativePath = relative(FEEDS_DIR, path);
	const parts = relativePath.split("/");

	// Should have at least 2 parts: category/name
	if (parts.length < 2) {
		return { isValid: false };
	}

	const [category, name] = parts;

	// Category should not start with _
	if (category.startsWith("_")) {
		return { isValid: false };
	}

	// Check if it's a valid directory
	const categoryPath = join(FEEDS_DIR, category);
	const feedPath = join(categoryPath, name);

	if (!existsSync(categoryPath) || !existsSync(feedPath)) {
		return { isValid: false };
	}

	if (!statSync(categoryPath).isDirectory() || !statSync(feedPath).isDirectory()) {
		return { isValid: false };
	}

	return { category, isValid: true, name };
}

// Get all modified feeds
async function getModifiedFeeds(): Promise<ModifiedFeed[]> {
	const modifiedFiles = await getGitModifiedFiles();
	const feedMap = new Map<string, ModifiedFeed>();

	for (const file of modifiedFiles) {
		// Only process files in src/routers/feeds/
		if (!file.startsWith("src/routers/feeds/")) {
			continue;
		}

		const fullPath = join(PROJECT_ROOT, file);
		const dirPath = dirname(fullPath);

		const feedInfo = isFeedDirectory(dirPath);
		if (!feedInfo.isValid || !feedInfo.category || !feedInfo.name) {
			continue;
		}

		const feedKey = `${feedInfo.category}/${feedInfo.name}`;
		const feedPath = join(FEEDS_DIR, feedInfo.category, feedInfo.name);

		if (!feedMap.has(feedKey)) {
			const testPath = join(feedPath, "index.test.ts");
			const hasTest = existsSync(testPath);

			feedMap.set(feedKey, {
				category: feedInfo.category,
				hasTest,
				modifiedFiles: [],
				name: feedInfo.name,
				path: feedPath,
				testPath: hasTest ? testPath : undefined,
			});
		}

		feedMap.get(feedKey)?.modifiedFiles.push(file);
	}

	return Array.from(feedMap.values());
}

// TODO: Generate test template
function generateTestTemplate(category: string, name: string): string {
	return `
import { describe, expect, test } from "bun:test";

describe("${category}/${name}", () => {
	test("should export a valid route", async () => {
		const route = await import("./index");
		expect(route.default).toBeDefined();
	});

	test("should handle requests correctly", async () => {
		const route = await import("./index");
		// TODO: Add your test cases here
		expect(route.default).toBeDefined();
	});
});
`;
}

// Create test file
async function createTestFile(feed: ModifiedFeed): Promise<boolean> {
	try {
		const testPath = join(feed.path, "index.test.ts");
		const testContent = generateTestTemplate(feed.category, feed.name);

		writeFileSync(testPath, testContent, "utf-8");
		success(`Created test file: ${relative(PROJECT_ROOT, testPath)}`);
		return true;
	} catch (err) {
		error(`Failed to create test file: ${err}`);
		return false;
	}
}

// Run tests for a specific feed
async function runFeedTests(feed: ModifiedFeed): Promise<boolean> {
	try {
		info(`Running tests for ${feed.category}/${feed.name}...`);

		const testPath = feed.testPath || join(feed.path, "index.test.ts");
		const relativePath = relative(PROJECT_ROOT, testPath);

		// Run bun test on the specific test file
		const result = await $`bun test ${relativePath}`.quiet();

		if (result.exitCode === 0) {
			success(`Tests passed for ${feed.category}/${feed.name}`);
			return true;
		}
		error(`Tests failed for ${feed.category}/${feed.name}`);
		return false;
	} catch (err) {
		error(`Failed to run tests for ${feed.category}/${feed.name}: ${err}`);
		return false;
	}
}

// Main execution
async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	try {
		header("🧪 RSSBook Feed Test Runner");

		info("Scanning for modified feeds...");
		const modifiedFeeds = await getModifiedFeeds();

		if (modifiedFeeds.length === 0) {
			warning("No modified feeds found");
			console.log();
			log("  Make sure you have uncommitted changes in feed directories:", colors.dim);
			log("  src/routers/feeds/{category}/{name}/", colors.dim);
			console.log();
			process.exit(0);
		}

		console.log();
		success(`Found ${modifiedFeeds.length} modified feed(s):`);
		console.log();

		// Display modified feeds
		for (const feed of modifiedFeeds) {
			const statusIcon = feed.hasTest ? "✓" : "✗";
			const statusColor = feed.hasTest ? colors.green : colors.red;
			const statusText = feed.hasTest ? "Has tests" : "No tests";

			log(
				`  ${statusColor}${statusIcon}${colors.reset} ${colors.blue}${feed.category}/${feed.name}${colors.reset} ${colors.dim}(${statusText})${colors.reset}`,
			);
			log(`     ${colors.dim}Modified files: ${feed.modifiedFiles.length}${colors.reset}`);
		}

		console.log();

		// Handle feeds without tests
		const feedsWithoutTests = modifiedFeeds.filter((f) => !f.hasTest);

		if (feedsWithoutTests.length > 0) {
			header("📝 Feeds Without Tests");

			for (const feed of feedsWithoutTests) {
				warning(`${feed.category}/${feed.name} does not have tests`);

				const createTest = await prompt(
					`Create index.test.ts for ${feed.category}/${feed.name}? (y/n):`,
					rl,
				);

				if (createTest.toLowerCase() === "y" || createTest.toLowerCase() === "yes") {
					const created = await createTestFile(feed);
					if (created) {
						feed.hasTest = true;
						feed.testPath = join(feed.path, "index.test.ts");
					}
				}
			}
			console.log();
		}

		// Run tests for all feeds with tests
		const feedsWithTests = modifiedFeeds.filter((f) => f.hasTest);

		if (feedsWithTests.length === 0) {
			warning("No feeds with tests to run");
			process.exit(0);
		}

		header("🧪 Running Tests");

		const results: { feed: ModifiedFeed; passed: boolean }[] = [];

		for (const feed of feedsWithTests) {
			const passed = await runFeedTests(feed);
			results.push({ feed, passed });
			console.log();
		}

		// Summary
		header("📊 Test Summary");

		const passedCount = results.filter((r) => r.passed).length;
		const failedCount = results.length - passedCount;

		if (passedCount > 0) {
			success(`${passedCount} feed(s) passed tests`);
		}

		if (failedCount > 0) {
			error(`${failedCount} feed(s) failed tests`);
		}

		console.log();

		// List failed feeds
		if (failedCount > 0) {
			log("Failed feeds:", colors.red);
			for (const result of results) {
				if (!result.passed) {
					log(`  - ${result.feed.category}/${result.feed.name}`, colors.red);
				}
			}
			console.log();
		}

		process.exit(failedCount > 0 ? 1 : 0);
	} catch (err) {
		error(`An error occurred: ${err}`);
		process.exit(1);
	} finally {
		rl.close();
	}
}

// Run the script
main();
