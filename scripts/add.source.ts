/// <reference types="bun-types" />
/** biome-ignore-all lint/suspicious/noConsole: true */

import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import * as readline from "node:readline/promises";

const FEEDS_DIR = join(import.meta.dir, "../src/routers/feeds");
const EXAMPLE_DIR = join(FEEDS_DIR, "_example");

// ANSI color codes
const colors = {
	blue: "\x1b[36m",
	dim: "\x1b[2m",
	green: "\x1b[32m",
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

function header(message: string) {
	console.log();
	log(`${"=".repeat(60)}`, colors.blue);
	log(`  ${message}`, colors.blue);
	log(`${"=".repeat(60)}`, colors.blue);
	console.log();
}

// Get all categories (folders not starting with _)
function getCategories(): string[] {
	const items = readdirSync(FEEDS_DIR);
	return items
		.filter((item) => {
			const path = join(FEEDS_DIR, item);
			return statSync(path).isDirectory() && !item.startsWith("_") && item !== "index.ts";
		})
		.sort();
}

// Get all feed types from _example folder
function getFeedTypes(): string[] {
	const items = readdirSync(EXAMPLE_DIR);
	return items
		.filter((item) => {
			const path = join(EXAMPLE_DIR, item);
			return statSync(path).isDirectory() && item.startsWith("_");
		})
		.map((item) => item.substring(1)) // Remove leading underscore
		.sort();
}

// Check if feed already exists in a category
function feedExists(category: string, name: string): boolean {
	const feedPath = join(FEEDS_DIR, category, name);
	return existsSync(feedPath);
}

// Display options in a grid layout
function displayGrid(items: string[], columns = 3) {
	const maxWidth = Math.max(...items.map((item) => item.length));
	const columnWidth = maxWidth + 4;

	for (let i = 0; i < items.length; i += columns) {
		const row = items.slice(i, i + columns);
		const formattedRow = row.map((item, idx) => {
			const num = i + idx + 1;
			const numStr = `${num}.`.padEnd(4);
			const itemStr = item.padEnd(columnWidth);
			return `${colors.dim}${numStr}${colors.reset}${colors.green}${itemStr}${colors.reset}`;
		});
		console.log(`  ${formattedRow.join("")}`);
	}
	console.log();
}

// Prompt user for input
async function prompt(question: string, rl: readline.Interface): Promise<string> {
	const answer = await rl.question(`${colors.yellow}? ${question}${colors.reset} `);
	return answer.trim();
}

// Validate feed name
function isValidFeedName(name: string): boolean {
	// Only allow lowercase letters, numbers, hyphens, and underscores
	return /^[a-z0-9_-]+$/.test(name);
}

// Main execution
async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	try {
		header("📝 RSSBook Source Generator");

		// Step 1: Select category
		const categories = getCategories();
		if (categories.length === 0) {
			error("No categories found in src/routers/feeds/");
			process.exit(1);
		}

		info("Available categories:");
		displayGrid(categories, 4);

		let categoryIndex: number;
		let category: string;

		while (true) {
			const categoryInput = await prompt(`Select category (1-${categories.length}):`, rl);

			categoryIndex = Number.parseInt(categoryInput, 10);

			if (Number.isNaN(categoryIndex) || categoryIndex < 1 || categoryIndex > categories.length) {
				error(`Please enter a number between 1 and ${categories.length}`);
				continue;
			}

			category = categories[categoryIndex - 1];
			success(`Selected category: ${category}`);
			break;
		}

		// Step 2: Enter feed name
		let feedName: string;

		while (true) {
			feedName = await prompt("Enter feed name (lowercase, use hyphens for spaces):", rl);

			if (!feedName) {
				error("Source name cannot be empty");
				continue;
			}

			if (!isValidFeedName(feedName)) {
				error("Source name can only contain lowercase letters, numbers, hyphens, and underscores");
				continue;
			}

			if (feedExists(category, feedName)) {
				error(`Source '${feedName}' already exists in category '${category}'`);
				const overwrite = await prompt("Do you want to choose a different name? (y/n):", rl);
				if (overwrite.toLowerCase() === "y" || overwrite.toLowerCase() === "yes") {
					continue;
				}
				error("Aborted: Source already exists");
				process.exit(1);
			}

			success(`Source name: ${feedName}`);
			break;
		}

		// Step 3: Select feed type
		const feedTypes = getFeedTypes();
		if (feedTypes.length === 0) {
			error("No feed types found in src/routers/feeds/_example/");
			process.exit(1);
		}

		console.log();
		info("Available feed types:");
		displayGrid(feedTypes, 5);

		let feedTypeIndex: number;
		let feedType: string;

		while (true) {
			const typeInput = await prompt(`Select feed type (1-${feedTypes.length}):`, rl);

			feedTypeIndex = Number.parseInt(typeInput, 10);

			if (Number.isNaN(feedTypeIndex) || feedTypeIndex < 1 || feedTypeIndex > feedTypes.length) {
				error(`Please enter a number between 1 and ${feedTypes.length}`);
				continue;
			}

			feedType = feedTypes[feedTypeIndex - 1];
			success(`Selected feed type: ${feedType}`);
			break;
		}

		// Step 4: Confirmation
		console.log();
		header("📋 Summary");
		log(`  Category:  ${colors.green}${category}${colors.reset}`);
		log(`  Source Name: ${colors.green}${feedName}${colors.reset}`);
		log(`  Source Type: ${colors.green}${feedType}${colors.reset}`);
		log(`  Path:      ${colors.dim}src/routers/feeds/${category}/${feedName}/${colors.reset}`);
		console.log();

		const confirm = await prompt("Create this feed? (y/n):", rl);

		if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
			error("Aborted by user");
			process.exit(0);
		}

		// Step 5: Create feed
		console.log();
		info("Creating Source...");

		const targetPath = join(FEEDS_DIR, category, feedName);
		const sourcePath = join(EXAMPLE_DIR, `_${feedType}`);

		try {
			// Create target directory
			mkdirSync(targetPath, { recursive: true });

			// Copy files from template
			cpSync(sourcePath, targetPath, { recursive: true });

			console.log();
			success(`Source created successfully!`);
			console.log();
			log(`  📁 Location: ${colors.blue}src/routers/feeds/${category}/${feedName}/${colors.reset}`);
			console.log();
			info("Next steps:");
			log(
				`  1. Edit the files in ${colors.dim}src/routers/feeds/${category}/${feedName}/${colors.reset}`,
			);
			log(`  2. Read Docs, implement your feed logic, write description.`);
			log(
				`  3. Add your source to the category ${colors.dim}src/routers/feeds/${category}/index.ts${colors.reset}`,
			);
			log(
				`  4. Write tests for your feed in ${colors.dim}src/tests/feeds/${category}/${feedName}.test.ts${colors.reset}`,
			);
			log(`  5. Test it, commit your changes, and submit a pull request!`);

			console.log();
		} catch (err) {
			error(`Failed to create feed: ${err}`);
			process.exit(1);
		}
	} catch (err) {
		error(`An error occurred: ${err}`);
		process.exit(1);
	} finally {
		rl.close();
	}
}

// Run the script
main();
