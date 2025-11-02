// Database Types for Tier List App

export interface User {
	userId: string;
}

export interface TierRow {
	id: string;
	name: string;
	color: string;
}

export interface TierListItem {
	id: string;
	imageUrl: string;
}

export interface TierListTemplate {
	id: string;
	title: string;
	status: "draft" | "published" | "open_for_submission";
	accessType: "free"; // All tier lists are free
	tierRows: TierRow[];
	itemBank: TierListItem[];
	adminPlacement?: Record<string, string>; // { itemId: tierId }
	createdAt?: string;
	updatedAt?: string;
}

export interface TierListSubmission {
	id: string;
	templateId: string;
	userId: string;
	userPlacement: Record<string, string>; // { itemId: tierId }
	createdAt: string;
}

export interface UserPaidAccess {
	id: string;
	userId: string;
	templateId: string;
	createdAt: string;
}

