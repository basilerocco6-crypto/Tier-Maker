import { Whop } from "@whop/sdk";

// Lazy initialization of Whop SDK
// This prevents build-time errors when environment variables are not yet set
let _whopsdk: Whop | null = null;

function getWhopSdk(): Whop {
	if (!_whopsdk) {
		// Always provide values - use placeholders during build if env vars aren't set
		// Vercel will have real env vars at runtime
		const appID = process.env.NEXT_PUBLIC_WHOP_APP_ID || "app_placeholder_build";
		const apiKey = process.env.WHOP_API_KEY || "whop_placeholder_build";
		const webhookSecret = process.env.WHOP_WEBHOOK_SECRET || "placeholder_secret_build";

		// Create SDK instance - placeholders allow build to succeed
		// Real values from Vercel env vars will be used at runtime
        const toBase64 = (value: string): string => {
            // Use browser btoa when available; fallback to Node Buffer on server
            try {
                // @ts-ignore - btoa may not exist on Node
                if (typeof btoa === "function") return btoa(value);
            } catch {}
            return Buffer.from(value, "utf8").toString("base64");
        };

        _whopsdk = new Whop({
            appID,
            apiKey,
            webhookKey: toBase64(webhookSecret),
        });
	}
	return _whopsdk;
}

// Export a Proxy that lazily initializes the SDK
// This ensures SDK is only created when actually used, not during import
export const whopsdk = new Proxy({} as Whop, {
	get(_target, prop) {
		const sdk = getWhopSdk();
		const value = sdk[prop as keyof Whop];
		return typeof value === "function" ? value.bind(sdk) : value;
	},
}) as Whop;
