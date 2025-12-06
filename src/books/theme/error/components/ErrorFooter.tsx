interface ErrorFooterProps {
	version: string;
}

export function ErrorFooter({ version }: ErrorFooterProps) {
	return (
		<footer class="fixed bottom-0 mt-5 w-full border-t border-t-neutral-100 bg-white px-4 xl:px-0">
			<div class="my-3 text-center font-medium text-neutral-500 text-sm">
				Powered by
				<a class="px-1 font-black underline" href="http://github.com/HackHTU/RSSBook">
					RSSBook
				</a>
				<span safe> V{version} </span>
			</div>
		</footer>
	);
}
