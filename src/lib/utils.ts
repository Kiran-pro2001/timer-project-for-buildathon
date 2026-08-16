import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Pad a number to 2 digits, e.g. 7 -> "07". */
export function pad(n: number) {
  return n.toString().padStart(2, "0");
}
