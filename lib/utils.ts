import { type ClassValue, clsx } from "clsx";
import colorFn from "color";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = (() => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const nanoid = customAlphabet(alphabet, 8);
  return () => nanoid();
})();

export function getBgColor(color?: string) {
  return color || "var(--xy-node-background-color-default)";
}

export function getBorderColor(color?: string) {
  return color ? colorFn(color).darken(0.2).toString() : "var(--xy-node-border-color-default)";
}

export function getBgBorderStyle(color?: string, borderWidth?: number) {
  return {
    backgroundColor: getBgColor(color),
    borderColor: getBorderColor(color),
    borderWidth: borderWidth || 1,
    borderStyle: "solid",
  };
}

export function getActiveColor(color?: string) {
  return color ? colorFn(color).lighten(0.8).toString() : "var(--xy-node-background-color-active-default)";
}
