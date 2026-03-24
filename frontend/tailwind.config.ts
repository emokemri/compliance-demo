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
        purple: {
          DEFAULT: "#7F77DD",
          50: "#F3F2FB",
          100: "#E7E5F7",
          200: "#CECBEF",
          300: "#B6B1E7",
          400: "#9D97DF",
          500: "#7F77DD",
          600: "#6059C4",
          700: "#4A44A0",
          800: "#342F7C",
          900: "#1E1A58",
        },
        teal: {
          DEFAULT: "#1D9E75",
          50: "#E8F7F2",
          100: "#D1EFE5",
          500: "#1D9E75",
          600: "#177D5C",
          700: "#115C43",
        },
        amber: {
          DEFAULT: "#BA7517",
          50: "#FEF4E6",
          100: "#FCE9CD",
          500: "#BA7517",
          600: "#955E12",
          700: "#6F460D",
        },
        coral: {
          DEFAULT: "#D85A30",
          50: "#FBEDE8",
          100: "#F7DBD1",
          500: "#D85A30",
          600: "#B84A26",
          700: "#8C381C",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
