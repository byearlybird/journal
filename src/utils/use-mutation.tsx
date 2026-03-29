import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async <T,>(fn: () => Promise<T>): Promise<T> => {
    const result = await fn();
    await queryClient.invalidateQueries();
    await router.invalidate();
    return result;
  };
}
