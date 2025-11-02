import { Whop } from "@whop/sdk";

// Initialize Whop SDK with environment variables
// During build time, these may be undefined - they'll be set at runtime in Vercel
export const whopsdk = new Whop({
	appID: process.env.NEXT_PUBLIC_WHOP_APP_ID || "",
	apiKey: process.env.WHOP_API_KEY || "",
	webhookKey: btoa(process.env.WHOP_WEBHOOK_SECRET || ""),
});
