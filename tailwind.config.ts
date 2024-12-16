import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "20px",
        md: "40px",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-urbanist)"],
      },
      colors: {
        purple: {
          900: "#0B050F",
          800: "#23102E",
          700: "#3B2654",
          600: "#58397F",
          500: "#7F54B3",
          400: "#9572C0",
          300: "#B59CD3",
          200: "#CAB9DF",
          100: "#EAE3F2",
        },
        lime: {
          800: "#80B602",
          500: "#CDFD5D",
          400: "#DBFE87",
          100: "#F9FFEB",
        },
        pink: {
          800: "#A81059",
          600: "#E01577",
          500: "#ED4395",
        },
        blue: {
          600: "#1FA1C1",
          500: "#3EBFE0",
          300: "#A7E2F1",
        },
        grey: {
          800: "#56564E",
          700: "#76766B",
          600: "#A8A89F",
          500: "#C5C5BF",
          400: "#D8D8D4",
          300: "#E2E2DF",
          200: "#ECECEA",
          100: "#F5F5F4",
        },
        yes: "#80B602",
        maybe: "#FFA333",
        no: "#A81059",
      },
      boxShadow: {
        button: "-3px 6px 8px 0px #23102E33",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
