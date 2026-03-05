import type { Meta, StoryObj } from "@storybook/react";
import LoadingOverlay from "../components/preview/LoadingOverlay";

const meta: Meta<typeof LoadingOverlay> = {
  title: "Components/LoadingOverlay",
  component: LoadingOverlay,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    message: {
      control: "text",
      description: "Message to display below the spinner",
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

export const Default: Story = {
  render: () => (
    <div className="w-64 h-48 relative bg-zinc-800 rounded-lg overflow-hidden">
      <LoadingOverlay />
    </div>
  ),
};

export const CustomMessage: Story = {
  render: () => (
    <div className="w-64 h-48 relative bg-zinc-800 rounded-lg overflow-hidden">
      <LoadingOverlay message="Generating 3D model..." />
    </div>
  ),
};

export const LongMessage: Story = {
  render: () => (
    <div className="w-64 h-48 relative bg-zinc-800 rounded-lg overflow-hidden">
      <LoadingOverlay message="This is a longer loading message that might wrap to multiple lines" />
    </div>
  ),
};
