import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

/**
 * Webhook handler for Whop events
 * 
 * Payment-related webhooks are no longer handled since all tier lists are free.
 * This handler now only logs webhook events for monitoring purposes.
 * 
 * Always returns 200 quickly to avoid retries.
 */
export async function POST(request: NextRequest): Promise<Response> {
	try {
		// Validate WHOP_WEBHOOK_SECRET is set
		if (!process.env.WHOP_WEBHOOK_SECRET) {
			console.error("[WEBHOOK ERROR] WHOP_WEBHOOK_SECRET not set in environment variables");
			return new Response("Webhook secret not configured", { status: 500 });
		}

		// 1. Get request body as text
		const requestBodyText = await request.text();

		// 2. Get headers as object
		const headers = Object.fromEntries(request.headers);

		// 3. Unwrap webhook to validate and parse
		const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });

		// 4. Log webhook events for monitoring (no payment processing needed)
		const eventType = webhookData.type as string;
		console.log(`[WEBHOOK] Received event: ${eventType}`, webhookData.data);

		// 5. Always return 200 status quickly to avoid retries
		return new Response("OK", { status: 200 });
	} catch (error: any) {
		console.error("[WEBHOOK ERROR]", error);
		// Still return 200 to prevent webhook retries
		// Log error for debugging
		return new Response("Error processing webhook", { status: 200 });
	}
}

