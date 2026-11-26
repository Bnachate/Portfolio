import { cn } from "./utils";

/**
 * Shared look of text fields, text areas and selects ("Encre et menthe"): slate border, 8 px radius,
 * thicker mint border on focus (replaces the global focus ring), mist background when disabled.
 */
const fieldBase =
  "rounded-lg border-[1.5px] border-slate bg-white px-3.5 font-display text-ink transition-colors duration-150 focus:border-mint focus:shadow-[0_0_0_1px_var(--color-mint)] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-line disabled:bg-mist disabled:text-slate aria-invalid:border-danger";

export type FieldSize = "md" | "lg";

const fieldSizes: Record<FieldSize, string> = {
  // Admin forms
  md: "min-h-11 text-base",
  // Public forms (contact, login)
  lg: "min-h-12 text-[17px]",
};

export const fieldClass = (size: FieldSize = "md", className?: string) => cn(fieldBase, fieldSizes[size], className);
