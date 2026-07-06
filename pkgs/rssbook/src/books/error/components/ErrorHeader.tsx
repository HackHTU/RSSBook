interface ErrorHeaderProps {
	code: string | number;
}

export function ErrorHeader({ code }: ErrorHeaderProps) {
	return (
		<div class="flex flex-col items-center sm:text-center md:px-4 lg:items-start lg:px-8 lg:text-left">
			<div
				class="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-rose-600 px-2.5 py-1 font-medium text-neutral-100 text-sm shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)]"
				safe
			>
				Error Code: {code}
			</div>
			<div class="mt-6 font-semibold text-3xl text-rose-600 lg:mt-8 lg:w-5/6 lg:text-5xl lg:leading-tight xl:w-3/4">
				Oops! Something went wrong.
			</div>
			<p class="mt-4 font-medium text-slate-600 text-sm sm:w-1/2 lg:w-2/5">
				An unexpected error occurred. Please check the details below or try refreshing the page. If
				the problem persists, contact support.
			</p>
		</div>
	);
}
