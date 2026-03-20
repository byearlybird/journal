import type { MonthlyGoal } from "@/db/schema";
import * as monthlyLogService from "@/services/monthly-log-service";
import { useRouter } from "@tanstack/react-router";

export function useUpdateIntention() {
  const router = useRouter();

  return async (logId: string, content: string | null) => {
    await monthlyLogService.updateIntention(logId, content);
    await router.invalidate();
  };
}

export function useAddGoal() {
  const router = useRouter();

  return async (logId: string, content: string) => {
    await monthlyLogService.addGoal(logId, content);
    await router.invalidate();
  };
}

export function useUpdateGoal() {
  const router = useRouter();

  return async (id: string, updates: Partial<Pick<MonthlyGoal, "content" | "status">>) => {
    await monthlyLogService.updateGoal(id, updates);
    await router.invalidate();
  };
}

export function useDeleteGoal() {
  const router = useRouter();

  return async (id: string) => {
    await monthlyLogService.deleteGoal(id);
    await router.invalidate();
  };
}

export function useToggleGoalStatus() {
  const router = useRouter();

  return async (id: string) => {
    await monthlyLogService.toggleGoalStatus(id);
    await router.invalidate();
  };
}
