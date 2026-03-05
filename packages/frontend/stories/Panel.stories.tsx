import type { Meta, StoryObj } from "@storybook/react";
import Panel from "../components/layout/Panel";

const meta: Meta<typeof Panel> = {
  title: "Components/Panel",
  component: Panel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Default: Story = {
  render: () => (
    <Panel>
      <div className="p-4 text-zinc-200">Panel Content</div>
    </Panel>
  ),
};

export const WithCustomClass: Story = {
  render: () => (
    <Panel className="border border-blue-500 rounded-lg">
      <div className="p-4 text-zinc-200">Panel with custom class</div>
    </Panel>
  ),
};

export const NestedPanels: Story = {
  render: () => (
    <Panel className="p-2">
      <Panel className="p-2">
        <div className="p-4 text-zinc-200">Nested Panels</div>
      </Panel>
    </Panel>
  ),
};
