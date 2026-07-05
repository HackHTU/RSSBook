/** biome-ignore-all lint/suspicious/noConsole: true */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PKG_PATH = join(import.meta.dir, "../pkgs/rssbook/package.json");

const colors = {
	blue: "\x1b[36m",
	green: "\x1b[32m",
	red: "\x1b[31m",
	reset: "\x1b[0m",
};

function log(message: string, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

function error(message: string) {
	log(`✗ ${message}`, colors.red);
	process.exit(1);
}

function run(command: string) {
	const result = Bun.spawnSync(["sh", "-c", command], {
		stdio: ["inherit", "inherit", "inherit"],
	});
	if (!result.success) {
		error(`Command failed: ${command}`);
	}
}

function bumpVersion(version: string, type: string): string {
	const [major, minor, patch] = version.split(".").map(Number);
	switch (type) {
		case "major":
			return `${major + 1}.0.0`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
		default:
			error(`Invalid bump type: ${type}. Use major, minor, or patch.`);
	}
}

const type = process.argv[2];
if (!type || !["major", "minor", "patch"].includes(type)) {
	error("Usage: bun run release <major|minor|patch>");
}

const pkg = JSON.parse(readFileSync(PKG_PATH, "utf-8"));
const oldVersion = pkg.version;
const newVersion = bumpVersion(oldVersion, type);
const tag = `v${newVersion}`;

log(`Bumping ${pkg.name}: ${oldVersion} → ${newVersion}`, colors.blue);

pkg.version = newVersion;
writeFileSync(PKG_PATH, JSON.stringify(pkg, null, "\t") + "\n");

run(`git add ${PKG_PATH}`);
run(`git commit -m "chore(${pkg.name}): release ${tag}"`);
run(`git tag ${tag}`);
run("git push --follow-tags");

log(`✓ Released ${tag}`, colors.green);
