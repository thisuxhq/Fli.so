export const tailwindColors = {
  red: "red",
  yellow: "yellow", 
  orange: "orange",
  blue: "blue",
  sky: "sky",
  green: "green",
  purple: "purple",
  pink: "pink",
  slate: "slate",
  gray: "gray",
  zinc: "zinc",
  neutral: "neutral",
  stone: "stone",
  amber: "amber",
  lime: "lime",
  emerald: "emerald",
  teal: "teal",
  cyan: "cyan",
  rose: "rose"
} as const;

export type TailwindColor = keyof typeof tailwindColors; 