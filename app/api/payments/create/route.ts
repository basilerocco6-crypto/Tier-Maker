import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
	try {
		const { userId } = await whopsdk.verifyUserToken(await headers());
		const body = await request.json();

		// This route is deprecated - use /api/checkout/create instead
		// Redirect to checkout creation endpoint
		return NextResponse.json(
			{ 
				error: "This endpoint is deprecated. Use /api/checkout/create instead.",
				message: "Use the checkout configuration endpoint for in-app purchases"
			},
			{ status: 410 } // Gone
		);
	} catch (error: any) {
		console.error("Payment creation error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create payment" },
			{ status: 500 }
		);
	}
}

