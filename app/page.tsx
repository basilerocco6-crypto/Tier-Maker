import { getUserId } from "@/lib/auth-helper";
import { supabaseAdmin } from "@/lib/supabase";
import type { TierListTemplate } from "@/lib/types";

async function getTierLists(userId: string | null) {
	// Fetch all published tier lists (everyone sees the same lists)
	const { data, error } = await supabaseAdmin
		.from("tier_list_templates")
		.select("*")
		.eq("status", "published")
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching tier lists:", error);
		return [];
	}

	return data as TierListTemplate[];
}

export default async function DashboardPage() {
	try {
		const userId = await getUserId();
		console.log("[DASHBOARD PAGE] Authenticated userId:", userId);
		
		const tierLists = await getTierLists(userId);

		// Everyone uses the member interface - no admin/member distinction
		return (
			<div className="min-h-screen p-8 bg-gray-a1">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-9 font-bold text-gray-12 mb-8">Tier Lists</h1>
					
					{tierLists.length === 0 ? (
						<div className="text-center py-16">
							<p className="text-4 text-gray-10 mb-4">
								No tier lists yet.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{tierLists.map((template) => (
								<div key={template.id} className="bg-gray-a2 border border-gray-a4 rounded-lg p-6 hover:border-gray-a6 transition-colors cursor-pointer" onClick={() => {
									window.location.href = `/list/${template.id}`;
								}}>
									<h2 className="text-7 font-bold text-gray-12 mb-2">{template.title}</h2>
									<p className="text-3 text-gray-10 mb-4">
										{template.status === "published" ? "Published" : "Draft"}
									</p>
									<p className="text-2 text-gray-9">
										Click to view and create your tier list
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	} catch (error: any) {
		// Handle authentication errors gracefully
		console.error("[DASHBOARD PAGE] Error:", error);
		
		// If accessing directly (not through Whop iframe), show a helpful message
		return (
			<div className="min-h-screen flex items-center justify-center p-8 bg-gray-a1">
				<div className="max-w-md w-full bg-gray-a2 border border-gray-a4 rounded-lg p-8 text-center">
					<h1 className="text-9 font-bold text-gray-12 mb-4">
						Authentication Required
					</h1>
					<p className="text-4 text-gray-10 mb-4">
						This app must be accessed through the Whop platform.
					</p>
					<p className="text-3 text-gray-9 mb-2">
						To use this app:
					</p>
					<ul className="text-2 text-gray-9 text-left space-y-2 mb-6">
						<li>• Access it through your Whop experience</li>
						<li>• Ensure you're logged in to Whop</li>
						<li>• Use the Whop app iframe</li>
					</ul>
					<p className="text-2 text-gray-8">
						If you're the app developer, make sure your app is properly configured in the Whop dashboard.
					</p>
				</div>
			</div>
		);
	}
}
