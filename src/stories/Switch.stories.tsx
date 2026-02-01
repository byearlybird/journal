import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "@app/components/switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
  args: {
    checked: false,
  },
};

export const WithLabel: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
  args: {
    checked: false,
    label: "Enable notifications",
  },
};

export const Checked: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
  args: {
    checked: true,
    label: "Enabled",
  },
};
