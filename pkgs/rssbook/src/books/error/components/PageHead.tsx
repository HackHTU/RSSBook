interface PageHeadProps {
	code: string | number;
}

export function PageHead({ code }: PageHeadProps) {
	return (
		<>
			<title safe>{code} - RSSBook</title>
			<meta charset="UTF-8" />
			<meta content="width=device-width, initial-scale=1.0" name="viewport" />
			<link href="/favicon.svg" rel="icon" type="image/svg+xml" />
			<link href="/favicon.svg" rel="mask-icon" />

			<script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>

			<link href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css" rel="stylesheet" />

			<link
				href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/default.min.css"
				rel="stylesheet"
			/>
			<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/highlight.min.js"></script>
			<script safe>{`hljs.highlightAll();`}</script>
			<style>{`[un-cloak] { display: none; } body {background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ff9d9f' fill-opacity='0.23'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}`}</style>
		</>
	);
}
