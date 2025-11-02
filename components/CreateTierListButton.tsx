"use client";

import { Button } from "@whop/react/components";
import { useIframeSdk } from "@whop/react";

export function CreateTierListButton() {
	const iframeSdk = useIframeSdk();

	const navigateTo = (path: string) => {
		if (iframeSdk && typeof (iframeSdk as any).navigate === "function") {
			(iframeSdk as any).navigate(path);
		} else {
			// Fallback to window.location for localhost/development
			window.location.href = path;
		}
	};

	return (
		<Button
			variant="classic"
			size="4"
			onClick={() => navigateTo("/builder/new")}
		>
			Create New List
		</Button>
	);
}
