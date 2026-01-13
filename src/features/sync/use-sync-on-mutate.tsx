import { useSession } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { sync } from "./client";

export function useSyncOnMutate() {
	const { isSignedIn } = useSession();
	const queryClient = useQueryClient();

	useEffect(() => {
		const unsubscribe = queryClient.getMutationCache().subscribe((mutation) => {
			if (mutation.mutation?.state.status === "success") {
				if (!navigator.onLine || !isSignedIn) return;

				sync().then((pullSucceeded) => {
					if (pullSucceeded) {
						queryClient.invalidateQueries();
					}
				});
			}
		});

		return () => unsubscribe();
	}, [queryClient, isSignedIn]);
}
