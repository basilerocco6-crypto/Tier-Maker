import { headers } from "next/headers";
import { Button } from "@whop/react/components";
import { whopsdk } from "@/lib/whop-sdk";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	// Handle experienceId from params (Promise in Next.js 15)
	const { experienceId } = await params;

	// 1. Implement authentication
	// Use await whopsdk.verifyUserToken(await headers()) to get userId
	// Wrap in try-catch to handle missing token gracefully
	let userId: string;
	try {
		const result = await whopsdk.verifyUserToken(await headers());
		userId = result.userId;
	} catch (error: any) {
		// If token is missing, show a helpful error message
		return (
			<div className="min-h-screen flex items-center justify-center p-8 bg-gray-a1">
				<div className="max-w-md w-full bg-gray-a2 border border-gray-a4 rounded-lg p-8 text-center">
					<h1 className="text-9 font-bold text-gray-12 mb-4">
						Authentication Required
					</h1>
					<p className="text-4 text-gray-10 mb-4">
						Whop user token not found.
					</p>
					<p className="text-3 text-gray-9 mb-2">
						To fix this:
					</p>
					<ul className="text-2 text-gray-9 text-left space-y-2 mb-6">
						<li>• Ensure you're accessing this through the Whop iframe</li>
						<li>• Enable the dev proxy in your Whop app settings</li>
						<li>• Make sure your app is running with <code className="bg-gray-a3 px-1 rounded">pnpm dev</code></li>
						<li>• Check that your environment variables are set correctly</li>
					</ul>
					<p className="text-2 text-gray-8">
						If you're the app developer, see the Whop documentation for setting up local development.
					</p>
				</div>
			</div>
		);
	}

	// Use await whopsdk.users.checkAccess(experienceId, { id: userId }) to verify access
	const access = await whopsdk.users.checkAccess(experienceId, { id: userId });

	// Check if access.has_access is true
	// Note: The SDK uses camelCase, so it's `hasAccess` not `has_access`
	if (!access.hasAccess) {
		// If no access, return an access denied message
		return (
			<div className="min-h-screen flex items-center justify-center p-8 bg-gray-a1">
				<div className="max-w-md w-full bg-gray-a2 border border-gray-a4 rounded-lg p-8 text-center">
					<h1 className="text-9 font-bold text-gray-12 mb-4">
						Access Denied
					</h1>
					<p className="text-4 text-gray-10 mb-6">
						You don't have access to this experience.
					</p>
					<p className="text-2 text-gray-9">
						Please contact the experience owner for access.
					</p>
				</div>
			</div>
		);
	}

	// Fetch the necessary data from whop
	const [experience, user] = await Promise.all([
		whopsdk.experiences.retrieve(experienceId),
		whopsdk.users.retrieve(userId),
	]);

	const displayName = user.name || `@${user.username}`;

	// 2. Build the UI with Frosted UI components
	// Using proper Frosted UI size scales (0-9 for text/headings)
	// Components auto-adapt to dark mode
	return (
		<div className="min-h-screen p-8 bg-gray-a1">
			<div className="max-w-7xl mx-auto">
				{/* Header Section */}
				<div className="mb-8">
					<h1 className="text-9 font-bold text-gray-12 mb-2">
						{experience.name || "Experience"}
					</h1>
					<p className="text-4 text-gray-10">
						Welcome, {displayName}!
					</p>
				</div>

				{/* Main Content Card */}
				<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-8 mb-6">
					<h2 className="text-7 font-semibold text-gray-12 mb-4">
						Experience Details
					</h2>
					<div className="space-y-4">
						<div>
							<p className="text-3 text-gray-9 mb-1">Experience ID</p>
							<p className="text-2 text-gray-11 font-mono">
								{experienceId}
							</p>
						</div>
						<div>
							<p className="text-3 text-gray-9 mb-1">User ID</p>
							<p className="text-2 text-gray-11 font-mono">
								{userId}
							</p>
						</div>
						{experience.description && (
							<div>
								<p className="text-3 text-gray-9 mb-1">Description</p>
								<p className="text-3 text-gray-10">
									{experience.description}
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Actions Card */}
				<div className="bg-gray-a2 border border-gray-a4 rounded-lg p-8">
					<h2 className="text-7 font-semibold text-gray-12 mb-4">
						Quick Actions
					</h2>
					<div className="flex gap-4 flex-wrap">
						<Button variant="classic" size="4">
							View Dashboard
						</Button>
						<Button variant="outline" size="4">
							Settings
						</Button>
					</div>
				</div>

				{/* Info Card - Frosted UI styling */}
				<div className="mt-6 bg-gray-a2 border border-gray-a4 rounded-lg p-6">
					<p className="text-2 text-gray-9">
						This is the experience view page. Replace this content with your
						actual Tier List application interface.
					</p>
				</div>
			</div>
		</div>
	);
}
