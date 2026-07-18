export const touchTargets = {
  minimumCssPixels: 44,
  comfortableCssPixels: 48
} as const;

export const statusTones = {
  success: "#157347",
  warning: "#996300",
  danger: "#b42318",
  info: "#0b5cab",
  neutral: "#414651"
} as const;

export { iconMap } from "./icons/icon-map";
export type { AdegaIconName, LucideIconName } from "./icons/icon-map";
