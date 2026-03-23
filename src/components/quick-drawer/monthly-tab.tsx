import type { Goal, Intention } from "@/models";
import { IntentionSection } from "./intention-section";
import { GoalSection } from "./goal-section";

export function MonthlyTab({
  intention,
  goals,
  month,
}: {
  intention: Intention | null;
  goals: Goal[];
  month: string;
}) {
  return (
    <>
      <IntentionSection intention={intention} month={month} />
      <GoalSection goals={goals} month={month} />
    </>
  );
}
