import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * className combiner for the DiffAudit design system.
 *
 * clsx handles conditional class composition; tailwind-merge dedupes
 * conflicting Tailwind utilities so later classes win (e.g.
 * `cn("px-2", condition && "px-4")` keeps only `px-4`). This is the single
 * entry point every primitive uses, so variant conflicts cannot accumulate —
 * the exact failure mode where "the same button gets different spacing".
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
