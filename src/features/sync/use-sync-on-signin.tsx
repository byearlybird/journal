import { useSession } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { sync } from "./client";

export function useSyncOnSignin() {
	const { isSignedIn } = useSession();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (isSignedIn) {
			sync().then((pullSucceeded) => {
				if (pullSucceeded) {
					queryClient.invalidateQueries();
				}
			});
		}
	}, [isSignedIn, queryClient]);
}
