import aspectRatio from "@tailwindcss/aspect-ratio";
import containerQueries from "@tailwindcss/container-queries";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      boxShadow: {
        mild: "0px 0px 12px 0px rgba(0, 0, 0, 0.04)",
        subtle: "0px 0px 20px 0px rgba(0, 0, 0, 0.04)",
      },
    },
  },

  plugins: [typography, forms, containerQueries, aspectRatio, animate],
} as Config;
