import { twMerge } from "tailwind-merge";

/** Join class names, skipping falsy values; later Tailwind utilities override earlier ones. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
