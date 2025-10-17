import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/globals.css",
  ],
  theme: {
    extend: {
      backgroundImage: {
        fire: "linear-gradient(to top, #dc2626, #ea580c, #facc15)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        "bridge-border": "#6d9765",
        "bridge-background": "rgba(11, 46, 4, 0.4)",
        "chain-selector": "#191918",
        "icon-background": "#122a10",
        "max-border": "#162b24",
        "max-background": "#10170e",
        "coin-amount": "#a1fea0",
        "rewards-panel-border": "#8ae5cf",
        "rewards-number": "#93d581",
        grey: "#7b7b7c",
        "swap-route": "#242428",
        "swap-route-box": "#b1b1b2",
        "neutral-700": "#404040",
        "neutral-900": "#171717",
        "bridge-button": "#387533",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.8)", opacity: "0" },
        },
        fireRise: {
          "0%": { backgroundPosition: "0% 100%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease",
        "scale-in": "scaleIn 0.3s ease-out",
        "scale-out": "scaleOut 0.3s ease-out",
        fireRise: "fireRise 3s ease-in-out infinite",
      },
      fontFamily: {
        "montserrat-alternates": ["var(--font-montserrat-alternates)"],
        inter: ["var(--font-inter)"],
      },
      boxShadow: {
        quote:
          "0px 0px 10px 0px rgba(112, 205, 135, 0.25), 0px 0px 12px 0px rgba(112, 205, 135, 0.50)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
