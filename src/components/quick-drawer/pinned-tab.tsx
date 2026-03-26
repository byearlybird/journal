import type { Intention } from "@/models";
import { IntentionSection } from "./intention-section";

export function PinnedTab({
  intention,
  month,
}: {
  intention: Intention | null;
  month: string;
}) {
  return (
    <>
      <IntentionSection intention={intention} month={month} />
    </>
  );
}
