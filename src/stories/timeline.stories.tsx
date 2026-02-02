import type { Meta, StoryObj } from "@storybook/react";
import { Timeline } from "@app/features/entries/timeline";
import type { TimelineItem } from "@app/features/entries/types";

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    entries: [
      {
        id: "1",
        content:
          "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.",
        created_at: new Date().toISOString(),
        type: "note",
      },
      {
        id: "2",
        content:
          "Nam commodo mi in dui ultrices auctor. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        created_at: new Date().toISOString(),
        type: "task",
      } as TimelineItem,
      {
        id: "3",
        content:
          "Morbi diam ligula, faucibus id nisl ac, sollicitudin fermentum erat. Ut a ullamcorper turpis. Sed efficitur, ligula ac fermentum laoreet, sem libero consequat mauris, eget mollis felis ante a quam. Quisque in tristique purus. Donec mollis vulputate eleifend. Proin nec finibus orci. Curabitur dictum molestie massa laoreet ornare. Mauris mauris ligula, euismod sit amet urna sit amet, mollis mollis nunc. Aliquam tristique neque ut vestibulum congue. Suspendisse lectus diam, pellentesque eget massa a, viverra hendrerit leo. Suspendisse egestas sodales justo sed tristique.",
        created_at: new Date().toISOString(),
        type: "note",
      },
    ],
  },
};
