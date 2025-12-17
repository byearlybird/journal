import { useAuth } from "@/lib/auth/context";

/**
 * Hook for syncing journal data to account
 * Only works when user is authenticated
 *
 * @returns Object with sync function and authentication status
 *
 * @example
 * const { sync, isAuthenticated, canSync } = useSyncData();
 *
 * if (canSync) {
 *   await sync();
 * }
 */
export function useSyncData() {
	const { isAuthenticated } = useAuth();

	const sync = async () => {
		if (!isAuthenticated) {
			throw new Error("Must be authenticated to sync data");
		}

		// TODO: Implement actual sync functionality
		// This will upload local data to the server and merge with remote data
		console.log("Sync functionality not yet implemented");
	};

	return {
		sync,
		isAuthenticated,
		canSync: isAuthenticated,
	};
}
