import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans'],
        logo: ['Varela Round'],
        jp: ['serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
