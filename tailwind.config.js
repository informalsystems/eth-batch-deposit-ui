/** @type {import('tailwindcss').Config} */

import formsPlugin from "@tailwindcss/forms"
import colors from "tailwindcss/colors"
import plugin from "tailwindcss/plugin"

const neutral = colors.slate

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./index.html"],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        accentColor: "#2f87a5",
        brandColor: "#0b2d7c",
        fadedTextColor: neutral[400],
        textColor: neutral[900],
      },
      fontFamily: {
        body: ["Inter, sans-seirf"],
        code: ["'Source Code Pro', monospace"],
        display: ["Glegoo, serif"],
      },
    },
  },
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        "*": {
          scrollbarColor: `${theme("colors.brandColor")} transparent`,
        },
        "*::-webkit-scrollbar": {
          height: theme("spacing.2"),
          width: theme("spacing.2"),
        },
        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "*::-webkit-scrollbar-thumb": {
          background: theme("colors.brandColor"),
          borderRadius: theme("spacing.8"),
        },
      })
    }),
    formsPlugin,
  ],
}
