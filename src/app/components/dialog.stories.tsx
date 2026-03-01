import type { Meta, StoryObj } from "@storybook/react";
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

const meta = {
  title: "Components/Dialog",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DialogRoot>
      <DialogTrigger className="rounded-md bg-slate-light px-4 py-2 text-ivory-light">
        Open Dialog
      </DialogTrigger>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6">
          <DialogTitle>Example Dialog</DialogTitle>
          <DialogDescription className="text-cloud-medium text-sm mb-4">
            This is a reusable dialog component built on @base-ui/react.
          </DialogDescription>
          <div className="flex justify-end">
            <DialogClose className="rounded-md bg-slate-light px-4 py-2 text-ivory-light">
              Close
            </DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  ),
};
