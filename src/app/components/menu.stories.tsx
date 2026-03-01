import type { Meta, StoryObj } from "@storybook/react";
import {
  MenuRoot,
  MenuTrigger,
  MenuPortal,
  MenuPositioner,
  MenuPopup,
  MenuItem,
  MenuSeparator,
} from "./menu";

const meta = {
  title: "Components/Menu",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MenuRoot>
      <MenuTrigger className="rounded-md bg-slate-light px-4 py-2 text-ivory-light">
        Open Menu
      </MenuTrigger>
      <MenuPortal>
        <MenuPositioner>
          <MenuPopup>
            <MenuItem>Edit</MenuItem>
            <MenuItem>Duplicate</MenuItem>
            <MenuSeparator />
            <MenuItem>Archive</MenuItem>
            <MenuItem>Delete</MenuItem>
          </MenuPopup>
        </MenuPositioner>
      </MenuPortal>
    </MenuRoot>
  ),
};
