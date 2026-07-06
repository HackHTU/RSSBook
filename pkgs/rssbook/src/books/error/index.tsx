import type { ErrorPageProps } from "@/types";
import { ErrorDetails, ErrorFooter, ErrorHeader, InfoSection, PageHead } from "./components";

export function defaultErrorPage({ code, error, version }: ErrorPageProps) {
	return (
		<html lang="zh-CN">
			<head>
				<PageHead code={code}></PageHead>
			</head>
			<body class="relative max-w-screen" un-cloak>
				<main class="w-full py-20">
					<div class="mx-auto flex max-w-7xl flex-col px-4 xl:px-0">
						<ErrorHeader code={code}></ErrorHeader>
						<div class="mt-6 flex flex-col items-center justify-center gap-y-6 sm:px-4 lg:mt-9 lg:flex-row lg:items-start lg:gap-x-9 lg:gap-y-0 lg:px-8">
							<InfoSection></InfoSection>
							<ErrorDetails code={code} error={error}></ErrorDetails>
						</div>
					</div>
				</main>
				<ErrorFooter version={version}></ErrorFooter>
			</body>
		</html>
	);
}
