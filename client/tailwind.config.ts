import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF4FF",
          100: "#D9E5FE",
          200: "#B8D0FD",
          300: "#86B0FA",
          400: "#4F88F4",
          500: "#2864E8",
          600: "#1C4AC7",
          700: "#173BA1",
          800: "#173382",
          900: "#172D6D",
          DEFAULT: "#2864E8",
        },
        surface: "#FFFFFF",
        canvas: "#F7F8FA",
        ink: {
          primary: "#171A21",
          secondary: "#626B78",
          tertiary: "#8A94A6",
          border: "#E5E8ED",
        },
        status: {
          success: "#168653",
          warning: "#B7791F",
          danger: "#C43D45",
          info: "#2864E8",
        },
      },
      borderRadius: {
        card: "14px",
        btn: "10px",
        input: "10px",
        badge: "999px",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 8px 20px -4px rgba(23, 26, 33, 0.08), 0 4px 8px -4px rgba(23, 26, 33, 0.04)",
        subtle: "0 2px 8px rgba(0, 0, 0, 0.04)",
        float: "0 12px 32px rgba(23, 26, 33, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
