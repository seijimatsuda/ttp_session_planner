import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and resolves Tailwind CSS conflicts using tailwind-merge.
 *
 * Example:
 *   cn("px-2 py-1", "px-4") → "py-1 px-4" (px-4 overwrites px-2)
 *   cn("text-red-500", condition && "text-blue-500") → conditional class application
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
