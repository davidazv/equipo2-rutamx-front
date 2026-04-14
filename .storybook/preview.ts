import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f8fafc" },
        { name: "surface", value: "#ffffff" },
        { name: "elevated", value: "#f1f5f9" },
      ],
    },
    layout: "centered",
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
