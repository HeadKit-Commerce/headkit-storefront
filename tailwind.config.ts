import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";
import scrollbarHide from "tailwind-scrollbar-hide";

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
          "100": "#EAE3F2",
          "200": "#CAB9DF",
          "300": "#B59CD3",
          "400": "#9572C0",
          "500": "#7F54B3",
          "600": "#58397F",
          "700": "#3B2654",
          "800": "#23102E",
          "900": "#0B050F",
        },
        lime: {
          "100": "#F9FFEB",
          "400": "#DBFE87",
          "500": "#CDFD5D",
          "800": "#80B602",
        },
        pink: {
          "500": "#ED4395",
          "600": "#E01577",
          "800": "#A81059",
        },
        blue: {
          "300": "#A7E2F1",
          "500": "#3EBFE0",
          "600": "#1FA1C1",
        },
        grey: {
          "100": "#F5F5F4",
          "200": "#ECECEA",
          "300": "#E2E2DF",
          "400": "#D8D8D4",
          "500": "#C5C5BF",
          "600": "#A8A89F",
          "700": "#76766B",
          "800": "#56564E",
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
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography, scrollbarHide],
};
export default config;
