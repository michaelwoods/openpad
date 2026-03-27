import type { Meta, StoryObj } from "@storybook/react";
import ChatInput from "../components/chat/ChatInput";

const meta: Meta<typeof ChatInput> = {
  title: "Components/ChatInput",
  component: ChatInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
  args: {
    onSend: (message: string) => console.log("Message sent:", message),
  },
};

export const Disabled: Story = {
  args: {
    onSend: (message: string) => console.log("Message sent:", message),
    disabled: true,
  },
};

export const WithLongMessage: Story = {
  args: {
    onSend: (message: string) => console.log("Message sent:", message),
  },
  play: async ({ canvasElement }) => {
    const textarea = canvasElement.querySelector("textarea");
    if (textarea) {
      textarea.value =
        "This is a long message that should wrap to multiple lines when the user types a lot of text into the chat input field.";
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  },
};
