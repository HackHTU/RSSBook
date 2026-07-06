import { InfoCard } from "./InfoCard";

export function InfoSection() {
	return (
		<div class="flex flex-col gap-y-4 sm:mx-auto sm:w-7/12 md:w-1/2 lg:mx-0 lg:mb-20 lg:w-2/5 lg:gap-y-6 xl:w-1/3">
			<InfoCard
				description="Review your configuration settings and API endpoints to ensure everything is set up correctly."
				link="/openapi"
				linkText="Learn more"
				title="Check OpenAPI Documentation"
			></InfoCard>
			<InfoCard
				description="Dive into our comprehensive GitHub repository for detailed guides, examples, and troubleshooting tips."
				link="https://github.com/HackHTU/RSSBook"
				linkText="Visit RSSBook GitHub Repository"
				title="Explore RSSBook Documentation"
			></InfoCard>
			<InfoCard
				description="If you think this isn't your problem, report bugs or request features by creating an issue on our GitHub repository."
				link="https://github.com/HackHTU/RSSBook/issues/new"
				linkText="Create an Issue"
				title="Create an Issue"
			></InfoCard>
		</div>
	);
}
