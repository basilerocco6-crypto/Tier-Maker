import { Whop } from "@whop/sdk";

// Lazy initialization of Whop SDK
// This prevents build-time errors when environment variables are not yet set
let _whopsdk: Whop | null = null;

function getWhopSdk(): Whop {
	if (!_whopsdk) {
		const appID = process.env.NEXT_PUBLIC_WHOP_APP_ID || "placeholder-app-id";
		const apiKey = process.env.WHOP_API_KEY || "placeholder-api-key";
		const webhookSecret = process.env.WHOP_WEBHOOK_SECRET || "";

		// Create SDK instance - will work at runtime when real env vars are set
		// During build, placeholder values prevent errors
		_whopsdk = new Whop({
			appID,
			apiKey,
			webhookKey: webhookSecret ? btoa(webhookSecret) : btoa("placeholder-secret"),
		});
	}
	return _whopsdk;
}

// Export a Proxy that lazily initializes the SDK
export const whopsdk = new Proxy({} as Whop, {
	get(_target, prop) {
		const sdk = getWhopSdk();
		const value = sdk[prop as keyof Whop];
		return typeof value === "function" ? value.bind(sdk) : value;
	},
}) as Whop;
