import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        civic: {
          50: "#f0f6fe",
          100: "#dde9fb",
          200: "#c2daf9",
          300: "#97c3f5",
          400: "#65a2ef",
          500: "#3d7fe7",
          600: "#2762db",
          700: "#1e4db9",
          800: "#1d4196",
          900: "#1d3877",
          950: "#12234c",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e6ede6",
          500: "#5c7965",
          700: "#3d5343",
          900: "#223126",
        },
        sand: {
          50: "#faf8f5",
          100: "#f3ede3",
          200: "#e7d9c6",
          500: "#bda07b",
          700: "#866d4f",
          900: "#493b2a",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
