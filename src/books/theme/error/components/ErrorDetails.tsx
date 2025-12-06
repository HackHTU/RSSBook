interface ErrorDetailsProps {
	code: string | number;
	error: Error | { code: string | number; response: unknown };
}

export function ErrorDetails({ code, error }: ErrorDetailsProps) {
	return (
		<div class="h-fit w-4/5 grow rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_20px_0px_rgba(0,0,0,0.1)] md:w-3/5">
			<div class="mb-4 border-slate-200 border-b pb-3">
				<div class="mb-2 flex items-center gap-4">
					<span
						class="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 font-medium text-rose-800 text-xs"
						safe
					>
						{code}
					</span>
					<span class="text-slate-500 text-xs" safe>
						{new Date().toLocaleString()}
					</span>
				</div>
			</div>
			{"message" in error && !!error.message && (
				<div class="mb-4">
					<h3 class="mb-2 font-semibold text-slate-600 text-xs uppercase tracking-wide">
						Error Message
					</h3>
					<p class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-600 text-sm" safe>
						{error.message}
					</p>
				</div>
			)}
			{"stack" in error && !!error.stack && (
				<div class="mb-4">
					<h3 class="mb-2 font-semibold text-slate-600 text-xs uppercase tracking-wide">
						Stack Trace
					</h3>
					<pre class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700 text-xs">
						<code class="language-bash" safe>
							{error.stack}
						</code>
					</pre>
				</div>
			)}
			<div>
				<h3 class="mb-2 font-semibold text-slate-600 text-xs uppercase tracking-wide">
					Error Details
				</h3>
				<pre class="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700 text-xs">
					<code class="language-json" safe>
						{JSON.stringify(error, null, 2)}
					</code>
				</pre>
			</div>
		</div>
	);
}
