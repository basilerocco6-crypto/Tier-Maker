import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

/**
 * API route to create checkout configuration for in-app purchases
 * 
 * Creates a checkout configuration using whopsdk.checkoutConfigurations.create()
 * Returns the checkout config which is used by the client to initiate in-app purchase
 */
export async function POST(request: Request) {
	try {
		// Verify user authentication
		const { userId } = await whopsdk.verifyUserToken(await headers());
		const body = await request.json();

		const { templateId, price } = body;

		// Validate required fields
		if (!templateId || !price) {
			return NextResponse.json(
				{ error: "templateId and price are required" },
				{ status: 400 }
			);
		}

		// Validate company ID is set
		const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
		if (!companyId) {
			console.error("[CHECKOUT CREATE ERROR] NEXT_PUBLIC_WHOP_COMPANY_ID not set");
			return NextResponse.json(
				{ error: "Company ID not configured" },
				{ status: 500 }
			);
		}

		// Create checkout configuration using Whop SDK
		const checkoutConfig = await whopsdk.checkoutConfigurations.create({
			company_id: companyId,
			initial_price: price, // Price in cents
			plan_type: "one_time", // or "recurring" for subscriptions
			metadata: {
				templateId: templateId,
				template_id: templateId,
				userId: userId,
				user_id: userId,
				item_id: templateId, // For identification
				variant: "tier_list_access", // Product variant
			},
		});

		console.log("[CHECKOUT CREATE] Configuration created:", {
			checkoutConfigId: checkoutConfig.id,
			templateId,
			userId,
			price,
		});

		return NextResponse.json({
			checkoutConfig: {
				id: checkoutConfig.id,
				planId: checkoutConfig.id, // For use with inAppPurchase
			},
		});
	} catch (error: any) {
		console.error("[CHECKOUT CREATE ERROR]", error);
		return NextResponse.json(
			{ 
				error: error.message || "Failed to create checkout configuration",
				details: error.response?.data || error,
			},
			{ status: 500 }
		);
	}
}

