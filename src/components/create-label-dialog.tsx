import { useStore } from "@nanostores/react";
import { InputDialog } from "@/components/shared/input-dialog";
import { $createLabelOpen, closeCreateLabel } from "@/stores/create-label";
import { labelsService } from "@/services/label-service";

export function CreateLabelDialog() {
  const open = useStore($createLabelOpen);

  return (
    <InputDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeCreateLabel();
      }}
      title="New label"
      placeholder="Label name"
      onSave={(name) => labelsService.createLabel(name)}
    />
  );
}
