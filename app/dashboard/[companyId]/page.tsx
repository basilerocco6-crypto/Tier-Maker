import { ExternalLinkButton } from "@/components/ExternalLinkButton";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
    await params; // route exists but we don't fetch Whop data anymore
    const displayName = "there";

	return (
		<div className="flex flex-col p-4 sm:p-6 md:p-8 gap-4">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
				<h1 className="text-7 sm:text-8 md:text-9">
					Hi <strong>{displayName}</strong>!
				</h1>
				<ExternalLinkButton href="https://docs.whop.com/apps" variant="classic" className="w-full sm:w-auto" size="3">
					Developer Docs
				</ExternalLinkButton>
			</div>

			<p className="text-3 text-gray-10">
				Welcome to you whop app! Replace this template with your own app. To
				get you started, here's some helpful data you can fetch from whop.
			</p>

            <h3 className="text-5 sm:text-6 font-bold">Demo</h3>
            <p className="text-3 text-gray-10">This page no longer pulls data from Whop.</p>
		</div>
	);
}

function JsonViewer({ data }: { data: any }) {
	return (
		<pre className="text-2 border border-gray-a4 rounded-lg p-4 bg-gray-a2 max-h-72 overflow-y-auto">
			<code className="text-gray-10">{JSON.stringify(data, null, 2)}</code>
		</pre>
	);
}
