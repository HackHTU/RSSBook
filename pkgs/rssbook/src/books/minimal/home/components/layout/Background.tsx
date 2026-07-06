export function Background() {
	return (
		<>
			<svg class="hidden">
				<title>Geometric Grid Pattern</title>
				<defs>
					<pattern height="40" id="grid-light" patternUnits="userSpaceOnUse" width="40" x="0" y="0">
						<rect fill="#ffffff" height="40" width="40" />
						<path
							d="M 40 0 L 0 0 0 40"
							fill="none"
							opacity="0.08"
							stroke="#000000"
							stroke-width="0.5"
						/>
					</pattern>

					<pattern height="40" id="grid-dark" patternUnits="userSpaceOnUse" width="40" x="0" y="0">
						<rect fill="#0a0a0a" height="40" width="40" />
						<path
							d="M 40 0 L 0 0 0 40"
							fill="none"
							opacity="0.12"
							stroke="#ffffff"
							stroke-width="0.5"
						/>
					</pattern>
				</defs>
			</svg>

			<div class="fixed inset-0 -z-10 overflow-hidden">
				<svg class="absolute inset-0 h-full w-full">
					<title>Minimal Grid Background</title>
					<rect
						class="fill-[url(#grid-light)] dark:fill-[url(#grid-dark)]"
						height="100%"
						width="100%"
					/>
				</svg>

				<div class="absolute inset-0 bg-white dark:bg-neutral-950"></div>
			</div>
		</>
	);
}
