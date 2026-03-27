import { TextareaDialog } from "@/components/entries/textarea-dialog";
import { intentionService } from "@/app";
import { useMutation } from "@/utils/use-mutation";

export function IntentionDialog({
  month,
  open,
  onClose,
}: {
  month: string;
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useMutation();

  return (
    <TextareaDialog
      open={open}
      onClose={onClose}
      onSave={(content) => mutation(() => intentionService.upsert(month, content))}
      title="Monthly intention"
      placeholder="What's your intention for this month?"
    />
  );
}
