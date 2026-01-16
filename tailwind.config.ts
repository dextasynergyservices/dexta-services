import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00B2FF",
          50: "#E6F7FF",
          100: "#B3E9FF",
          200: "#80DBFF",
          300: "#4DCDFF",
          400: "#1ABFFF",
          500: "#00B2FF",
          600: "#0099D6",
          700: "#0073AD",
          800: "#004D84",
          900: "#00275B",
        },
        secondary: {
          DEFAULT: "#212529",
          50: "#F5F5F6",
          100: "#E8E9EB",
          200: "#D1D3D7",
          300: "#B9BCC3",
          400: "#A1A5AF",
          500: "#898D9B",
          600: "#717580",
          700: "#595D65",
          800: "#41454A",
          900: "#212529",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-manrope)", "sans-serif"],
        display: ["var(--font-poppins)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
