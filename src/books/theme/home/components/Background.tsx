export function Background() {
	return (
		<>
			<svg class="hidden">
				<title>Background Patterns and Textures</title>
				<defs>
					<pattern
						height="100"
						id="book-pattern-light"
						patternUnits="userSpaceOnUse"
						width="100"
						x="0"
						y="0"
					>
						<rect fill="#fef5f1" height="100" width="100" />
						<path
							d="M0 0 L100 0 L100 100 L0 100 Z"
							fill="none"
							opacity="0.3"
							stroke="#f4e4dd"
							stroke-width="0.5"
						/>
						<circle cx="20" cy="20" fill="#e8d5cc" opacity="0.2" r="1" />
						<circle cx="80" cy="50" fill="#e8d5cc" opacity="0.2" r="1" />
						<circle cx="50" cy="80" fill="#e8d5cc" opacity="0.2" r="1" />
						<path
							d="M10 30 Q30 20 50 30 T90 30"
							fill="none"
							opacity="0.15"
							stroke="#e8d5cc"
							stroke-width="0.3"
						/>
					</pattern>

					<pattern
						height="100"
						id="book-pattern-dark"
						patternUnits="userSpaceOnUse"
						width="100"
						x="0"
						y="0"
					>
						<rect fill="#1a1412" height="100" width="100" />
						<path
							d="M0 0 L100 0 L100 100 L0 100 Z"
							fill="none"
							opacity="0.3"
							stroke="#2d1f1a"
							stroke-width="0.5"
						/>
						<circle cx="20" cy="20" fill="#3d2b22" opacity="0.3" r="1" />
						<circle cx="80" cy="50" fill="#3d2b22" opacity="0.3" r="1" />
						<circle cx="50" cy="80" fill="#3d2b22" opacity="0.3" r="1" />
						<path
							d="M10 30 Q30 20 50 30 T90 30"
							fill="none"
							opacity="0.2"
							stroke="#3d2b22"
							stroke-width="0.3"
						/>
					</pattern>

					<filter id="noise">
						<feTurbulence
							baseFrequency="0.9"
							numOctaves="4"
							stitchTiles="stitch"
							type="fractalNoise"
						/>
						<feColorMatrix type="saturate" values="0" />
					</filter>
				</defs>
			</svg>

			<div class="-z-10 fixed inset-0 overflow-hidden">
				<svg class="absolute inset-0 h-full w-full">
					<title>Book Page Pattern Background</title>
					<rect
						class="fill-[url(#book-pattern-light)] dark:fill-[url(#book-pattern-dark)]"
						height="100%"
						width="100%"
					/>
				</svg>

				<div class="absolute inset-0 dark:hidden">
					<div class="absolute inset-0 bg-gradient-to-br from-rose-50/40 via-orange-50/30 to-amber-50/40"></div>
					<div class="absolute inset-0 bg-gradient-to-tr from-red-100/20 via-transparent to-orange-100/20"></div>
					<div class="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-rose-200/10 blur-3xl"></div>
					<div class="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-orange-200/10 blur-3xl"></div>
				</div>

				<div class="absolute inset-0 hidden dark:block">
					<div class="absolute inset-0 bg-gradient-to-br from-rose-950/30 via-stone-950/40 to-amber-950/30"></div>
					<div class="absolute inset-0 bg-gradient-to-tr from-red-900/10 via-transparent to-orange-900/10"></div>
					<div class="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-rose-800/5 blur-3xl"></div>
					<div class="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-orange-800/5 blur-3xl"></div>
				</div>

				<div class="-z-10 absolute inset-0 bg-stone-50 dark:bg-stone-950"></div>
			</div>
		</>
	);
}
