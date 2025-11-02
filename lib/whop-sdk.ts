import { Whop } from "@whop/sdk";

// Lazy initialization of Whop SDK
// This prevents build-time errors when environment variables are not yet set
let _whopsdk: Whop | null = null;

function getWhopSdk(): Whop {
	if (!_whopsdk) {
		const appID = process.env.NEXT_PUBLIC_WHOP_APP_ID;
		const apiKey = process.env.WHOP_API_KEY;
		const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

		// Only create SDK if required vars are present (runtime)
		// During build, these may be undefined - that's OK
		if (appID && apiKey) {
			_whopsdk = new Whop({
				appID,
				apiKey,
				webhookKey: webhookSecret ? btoa(webhookSecret) : "",
			});
		} else {
			// Create a minimal SDK instance for build-time
			// This will fail at runtime if vars aren't set, which is expected
			_whopsdk = new Whop({
				appID: appID || "",
				apiKey: apiKey || "",
				webhookKey: webhookSecret ? btoa(webhookSecret) : "",
			});
		}
	}
	return _whopsdk;
}

export const whopsdk = new Proxy({} as Whop, {
	get(_target, prop) {
		return getWhopSdk()[prop as keyof Whop];
	},
});
