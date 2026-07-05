import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: {
		compilerOptions: {
			ignoreDeprecations: "6.0",
			skipLibCheck: true,
		},
	},
	outDir: "dist",
	clean: false,
	external: [
		"elysia",
		"@elysiajs/eden",
		"@elysiajs/html",
		"@elysiajs/openapi",
		"@elysiajs/server-timing",
		"@elysiajs/static",
	],
	splitting: false,
	sourcemap: true,
});
