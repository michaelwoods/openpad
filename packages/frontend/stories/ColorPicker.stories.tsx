import type { Meta, StoryObj } from "@storybook/react";
import ColorPicker from "../components/preview/ColorPicker";

const meta: Meta<typeof ColorPicker> = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "color",
      description: "Current color value",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  args: {
    color: "#ffaa00",
    onChange: (color: string) => console.log("Color changed:", color),
  },
};

export const Blue: Story = {
  args: {
    color: "#0000ff",
    onChange: (color: string) => console.log("Color changed:", color),
  },
};

export const White: Story = {
  args: {
    color: "#ffffff",
    onChange: (color: string) => console.log("Color changed:", color),
  },
};

export const Black: Story = {
  args: {
    color: "#000000",
    onChange: (color: string) => console.log("Color changed:", color),
  },
};
