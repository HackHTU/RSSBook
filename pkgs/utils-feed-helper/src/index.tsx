import { Elysia } from "elysia";

export const app = new Elysia()
	.get("/", () => (
		<html lang="zh-CN">
			<head>
				<title safe>Utils Feed Helper</title>
				<meta charset="UTF-8" />
				<meta content="width=device-width, initial-scale=1.0" name="viewport" />
				<meta content="Utils Feed Helper" name="description" />

				<link href="https://cdn.jsdelivr.net" rel="preconnect" />
				<link href="https://cdn.jsdelivr.net" rel="dns-prefetch" />

				{/* UnoCSS Runtime */}
				<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>

				{/* Datastar */}
				<script
					src="https://cdn.jsdelivr.net/gh/starfederation/datastar@1.0.0-RC.5/bundles/datastar.js"
					type="module"
				></script>

				{/* TailwindCSS Reset */}
				<link href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css" rel="stylesheet" />
				<style>{`[un-cloak] { display: none; }`}</style>
			</head>
			<body class="min-h-screen transition-colors duration-300" un-cloak>
				<div class="flex min-h-screen items-center justify-center">
					<div class="text-center">
						<h1 class="mb-4 font-bold text-4xl">Utils Feed Helper</h1>
						<p class="mb-8 text-gray-600">Utility functions for feed processing</p>
						<div class="inline-block rounded-lg bg-green-50 p-4">
							<code class="text-sm">UnoCSS and Datastar enabled</code>
						</div>
					</div>
				</div>
			</body>
		</html>
	))
	.listen(3000);

// console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
