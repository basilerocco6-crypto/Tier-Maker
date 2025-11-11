"use client";

import React from "react";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("[ERROR BOUNDARY]", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-a1">
					<div className="max-w-md w-full bg-gray-a2 border border-gray-a4 rounded-lg p-6 sm:p-8 text-center">
						<h1 className="text-7 sm:text-8 md:text-9 font-bold text-gray-12 mb-4">
							Something went wrong
						</h1>
						<p className="text-3 sm:text-4 text-gray-10 mb-4">
							{this.state.error?.message || "An unexpected error occurred"}
						</p>
						<button
							onClick={() => {
								this.setState({ hasError: false, error: null });
								window.location.reload();
							}}
							className="px-4 py-2 bg-blue-6 text-white rounded-md hover:bg-blue-7 transition-colors"
						>
							Reload Page
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

