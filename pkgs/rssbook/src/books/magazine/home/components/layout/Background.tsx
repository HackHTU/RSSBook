export function Background() {
	return (
		<div class="fixed inset-0 -z-10 overflow-hidden">
			<div class="absolute inset-0 bg-[#faf8f5] dark:bg-[#1a1a1a]" />
			<div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
				<div
					class="h-full w-full"
					style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23000000&quot; fill-opacity=&quot;1&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
				/>
			</div>
		</div>
	);
}
