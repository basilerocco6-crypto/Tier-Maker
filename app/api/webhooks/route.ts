import { waitUntil } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import {
	createOrUpdateUser,
	createPurchase,
	getUserByWhopId,
} from "@/lib/supabase-helpers";

/**
 * Webhook handler for Whop events
 * 
 * Handles:
 * - payment_succeeded / payment.succeeded: Grants access to paid tier lists
 * - invoice_paid: Grants access when invoice is paid
 * - invoice_voided: Revokes access when invoice is voided
 * - membership_activated / membership.activated: Activates membership access
 * - membership_deactivated / membership.deactivated: Deactivates membership access
 * 
 * Always returns 200 quickly to avoid retries.
 * Uses waitUntil() for async processing.
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

		// 4. Handle different webhook event types
		// Whop SDK uses dot notation (payment.succeeded), but dashboard may use snake_case
		const eventType = webhookData.type as string;

		// Normalize event type to dot notation for comparison
		const normalizedType = eventType.replace(/_/g, ".");

		if (normalizedType === "payment.succeeded" || eventType === "payment_succeeded") {
			// Use waitUntil for async processing without blocking response
			waitUntil(handlePaymentSucceeded(webhookData.data));
		} else if (normalizedType === "invoice.paid" || eventType === "invoice_paid") {
			waitUntil(handleInvoicePaid(webhookData.data));
		} else if (normalizedType === "invoice.voided" || eventType === "invoice_voided") {
			waitUntil(handleInvoiceVoided(webhookData.data));
		} else if (normalizedType === "membership.activated" || eventType === "membership_activated") {
			waitUntil(handleMembershipActivated(webhookData.data));
		} else if (normalizedType === "membership.deactivated" || eventType === "membership_deactivated") {
			waitUntil(handleMembershipDeactivated(webhookData.data));
		} else {
			// Log unhandled events for monitoring
			console.log(`[WEBHOOK] Unhandled event type: ${eventType}`, webhookData.data);
		}

		// 5. Always return 200 status quickly to avoid retries
		return new Response("OK", { status: 200 });
	} catch (error: any) {
		console.error("[WEBHOOK ERROR]", error);
		// Still return 200 to prevent webhook retries
		// Log error for debugging
		return new Response("Error processing webhook", { status: 200 });
	}
}

/**
 * Handle payment.succeeded event
 * Grants access to paid tier lists by creating user_paid_access record
 * Also creates/updates user and purchase records
 */
async function handlePaymentSucceeded(payment: any) {
	try {
		console.log("[PAYMENT SUCCEEDED]", {
			paymentId: payment.id,
			userId: payment.user_id,
			amount: payment.amount,
			metadata: payment.metadata,
		});

		const whopUserId = payment.user_id;
		if (!whopUserId) {
			console.warn("[PAYMENT SUCCEEDED] Missing userId");
			return;
		}

		// Step 1: Get or create user in Supabase
		let user = await getUserByWhopId(whopUserId);
		if (!user) {
			// Fetch user details from Whop API if needed
			try {
				const whopUser = await whopsdk.users.retrieve(whopUserId);
				user = await createOrUpdateUser({
					whop_user_id: whopUserId,
					whop_username: whopUser.username || undefined,
					email: whopUser.email || undefined,
				});
			} catch (error: any) {
				console.error(
					"[PAYMENT SUCCEEDED ERROR] Failed to fetch user from Whop:",
					error,
				);
				// Create user with minimal data
				user = await createOrUpdateUser({
					whop_user_id: whopUserId,
				});
			}
		}

		// Step 2: Create purchase record
		try {
			await createPurchase({
				user_id: user.id,
				whop_payment_id: payment.id,
				amount: payment.amount || 0,
				status: "completed",
				metadata: payment.metadata || {},
			});
			console.log("[PAYMENT SUCCEEDED] Purchase record created:", {
				userId: user.id,
				paymentId: payment.id,
			});
		} catch (error: any) {
			console.error("[PAYMENT SUCCEEDED ERROR] Failed to create purchase:", error);
			// Continue even if purchase record fails - access should still be granted
		}

		// Step 3: Access metadata from webhookData.data.metadata
		const metadata = payment.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// If metadata contains templateId, grant access to that tier list
		if (templateId) {
			// Insert into user_paid_access table
			const { data, error } = await supabaseAdmin
				.from("user_paid_access")
				.upsert(
					{
						user_id: whopUserId, // Still using Whop user ID for backward compatibility
						template_id: templateId,
					},
					{
						onConflict: "user_id,template_id",
					},
				)
				.select()
				.single();

			if (error) {
				console.error("[PAYMENT SUCCEEDED ERROR] Failed to grant access:", error);
				throw error;
			}

			console.log("[PAYMENT SUCCEEDED] Access granted:", {
				userId: whopUserId,
				templateId,
				accessId: data.id,
			});
		} else {
			console.warn("[PAYMENT SUCCEEDED] Missing templateId in metadata:", {
				userId: whopUserId,
				metadata,
			});
		}

		// Additional processing can go here:
		// - Send confirmation email
		// - Update analytics
		// - Notify user
	} catch (error: any) {
		console.error("[PAYMENT SUCCEEDED ERROR]", error);
		// Don't throw - we've already returned 200 to Whop
		// Log error for debugging and manual intervention
	}
}

/**
 * Handle membership.activated event
 * Activates membership access for a user
 */
async function handleMembershipActivated(membership: any) {
	try {
		console.log("[MEMBERSHIP ACTIVATED]", {
			membershipId: membership.id,
			userId: membership.user_id,
			companyId: membership.company_id,
			metadata: membership.metadata,
		});

		// Access metadata from webhookData.data.metadata
		const metadata = membership.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// If membership is for a specific tier list, grant access
		if (templateId && membership.user_id) {
			const { data, error } = await supabaseAdmin
				.from("user_paid_access")
				.upsert(
					{
						user_id: membership.user_id,
						template_id: templateId,
					},
					{
						onConflict: "user_id,template_id",
					}
				)
				.select()
				.single();

			if (error) {
				console.error("[MEMBERSHIP ACTIVATED ERROR] Failed to grant access:", error);
				throw error;
			}

			console.log("[MEMBERSHIP ACTIVATED] Access granted:", {
				userId: membership.user_id,
				templateId,
				accessId: data.id,
			});
		} else {
			console.log("[MEMBERSHIP ACTIVATED] No specific template access needed");
		}

		// Additional processing:
		// - Welcome user
		// - Send onboarding email
		// - Update user status
	} catch (error: any) {
		console.error("[MEMBERSHIP ACTIVATED ERROR]", error);
	}
}

/**
 * Handle invoice_paid event
 * Grants access to paid tier lists when invoice is paid
 * This is often more reliable than payment_succeeded
 * Also creates/updates user and purchase records
 */
async function handleInvoicePaid(invoice: any) {
	try {
		console.log("[INVOICE PAID]", {
			invoiceId: invoice.id,
			userId: invoice.user_id,
			amount: invoice.amount,
			metadata: invoice.metadata,
		});

		const whopUserId = invoice.user_id;
		if (!whopUserId) {
			console.warn("[INVOICE PAID] Missing userId");
			return;
		}

		// Step 1: Get or create user in Supabase
		let user = await getUserByWhopId(whopUserId);
		if (!user) {
			// Fetch user details from Whop API if needed
			try {
				const whopUser = await whopsdk.users.retrieve(whopUserId);
				user = await createOrUpdateUser({
					whop_user_id: whopUserId,
					whop_username: whopUser.username || undefined,
					email: whopUser.email || undefined,
				});
			} catch (error: any) {
				console.error("[INVOICE PAID ERROR] Failed to fetch user from Whop:", error);
				// Create user with minimal data
				user = await createOrUpdateUser({
					whop_user_id: whopUserId,
				});
			}
		}

		// Step 2: Create purchase record
		try {
			await createPurchase({
				user_id: user.id,
				whop_payment_id: invoice.id,
				amount: invoice.amount || 0,
				status: "completed",
				metadata: invoice.metadata || {},
			});
			console.log("[INVOICE PAID] Purchase record created:", {
				userId: user.id,
				invoiceId: invoice.id,
			});
		} catch (error: any) {
			console.error("[INVOICE PAID ERROR] Failed to create purchase:", error);
			// Continue even if purchase record fails - access should still be granted
		}

		// Step 3: Access metadata from webhookData.data.metadata
		const metadata = invoice.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// If metadata contains templateId, grant access to that tier list
		if (templateId) {
			// Insert into user_paid_access table
			const { data, error } = await supabaseAdmin
				.from("user_paid_access")
				.upsert(
					{
						user_id: whopUserId, // Still using Whop user ID for backward compatibility
						template_id: templateId,
					},
					{
						onConflict: "user_id,template_id",
					},
				)
				.select()
				.single();

			if (error) {
				console.error("[INVOICE PAID ERROR] Failed to grant access:", error);
				throw error;
			}

			console.log("[INVOICE PAID] Access granted:", {
				userId: whopUserId,
				templateId,
				accessId: data.id,
			});
		} else {
			console.warn("[INVOICE PAID] Missing templateId in metadata:", {
				userId: whopUserId,
				metadata,
			});
		}

		// Additional processing:
		// - Send confirmation email
		// - Update analytics
		// - Notify user
	} catch (error: any) {
		console.error("[INVOICE PAID ERROR]", error);
	}
}

/**
 * Handle invoice_voided event
 * Optionally revokes access when invoice is voided
 */
async function handleInvoiceVoided(invoice: any) {
	try {
		console.log("[INVOICE VOIDED]", {
			invoiceId: invoice.id,
			userId: invoice.user_id,
			amount: invoice.amount,
			metadata: invoice.metadata,
		});

		// Access metadata from webhookData.data.metadata
		const metadata = invoice.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// Optionally revoke access when invoice is voided
		// Note: You may want to keep access for historical reasons
		if (templateId && invoice.user_id) {
			// Option 1: Remove access (uncomment to enable)
			// const { error } = await supabaseAdmin
			//   .from("user_paid_access")
			//   .delete()
			//   .eq("user_id", invoice.user_id)
			//   .eq("template_id", templateId);

			// if (error) {
			//   console.error("[INVOICE VOIDED ERROR] Failed to revoke access:", error);
			//   throw error;
			// }

			// Option 2: Keep access but mark as voided (recommended)
			// Add a status column to track voided invoices if needed

			console.log("[INVOICE VOIDED] Access handling:", {
				userId: invoice.user_id,
				templateId,
				note: "Access retained (historical records preserved)",
			});
		} else {
			console.warn("[INVOICE VOIDED] Missing templateId or userId in metadata:", {
				userId: invoice.user_id,
				metadata,
			});
		}

		// Additional processing:
		// - Send notification to user
		// - Update analytics
		// - Refund processing
	} catch (error: any) {
		console.error("[INVOICE VOIDED ERROR]", error);
	}
}

/**
 * Handle membership.deactivated event
 * Deactivates membership access for a user
 */
async function handleMembershipDeactivated(membership: any) {
	try {
		console.log("[MEMBERSHIP DEACTIVATED]", {
			membershipId: membership.id,
			userId: membership.user_id,
			companyId: membership.company_id,
			metadata: membership.metadata,
		});

		// Access metadata from webhookData.data.metadata
		const metadata = membership.metadata || {};
		const templateId = metadata.templateId || metadata.template_id;

		// If membership was for a specific tier list, optionally revoke access
		// Note: You may want to keep access even after deactivation for historical reasons
		// Adjust this logic based on your business requirements
		if (templateId && membership.user_id) {
			// Option 1: Remove access (uncomment to enable)
			// const { error } = await supabaseAdmin
			//   .from("user_paid_access")
			//   .delete()
			//   .eq("user_id", membership.user_id)
			//   .eq("template_id", templateId);

			// if (error) {
			//   console.error("[MEMBERSHIP DEACTIVATED ERROR] Failed to revoke access:", error);
			//   throw error;
			// }

			// Option 2: Keep access but mark as inactive (recommended)
			// Add a column to track active/inactive status if needed

			console.log("[MEMBERSHIP DEACTIVATED] Access handling:", {
				userId: membership.user_id,
				templateId,
				note: "Access retained (historical records preserved)",
			});
		} else {
			console.log("[MEMBERSHIP DEACTIVATED] No specific template access to revoke");
		}

		// Additional processing:
		// - Send cancellation email
		// - Update analytics
		// - Offer renewal discounts
	} catch (error: any) {
		console.error("[MEMBERSHIP DEACTIVATED ERROR]", error);
	}
}
