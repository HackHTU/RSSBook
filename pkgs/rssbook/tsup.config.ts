import { defineConfig } from "tsup";
import pkg from "./package.json" with { type: "json" };

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
	external: Object.keys(pkg.dependencies),
	splitting: false,
	sourcemap: true,
});
