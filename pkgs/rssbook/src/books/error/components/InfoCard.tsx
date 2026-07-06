interface InfoCardProps {
	title: string;
	description: string;
	link: string;
	linkText: string;
}

export function InfoCard({ title, description, link, linkText }: InfoCardProps) {
	return (
		<article class="flex flex-col items-start">
			<div class="mt-3 font-bold text-neutral-700 md:text-lg lg:mt-4 xl:text-xl" safe>
				{title}
			</div>
			<p class="mt-2 font-medium text-neutral-500 text-sm" safe>
				{description}
			</p>
			<a class="mt-2 text-blue-600 text-sm hover:underline" href={link} safe>
				{linkText}
			</a>
		</article>
	);
}
