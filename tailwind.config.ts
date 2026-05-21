import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        geist: ["Geist", "system-ui", "sans-serif"],
      },
      colors: {
        accent: "#5B7FFF",
        teal: "#3ED9B8",
      },
    },
  },
  plugins: [],
};

export default config;
