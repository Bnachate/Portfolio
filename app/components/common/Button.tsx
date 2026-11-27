import type { ComponentProps } from "react";
import { AppLink } from "./AppLink";
import { cn } from "./utils";
import type { JSX } from "react";

/**
 * Buttons of the "Encre et menthe" design system, shared by the public site and the admin.
 * 8 px radius, at least 44 px high. Hover transitions only.
 */

export type ButtonVariant =
  // On light backgrounds
  | "primary" // ink, mint on hover
  | "outline" // ink border
  | "danger" // red, for deletions
  | "dangerOutline"
  | "ghost" // no background; with aria-pressed="true" it shows as selected (filters, toggles)
  // On ink backgrounds
  | "mint"
  | "outlineOnInk"
  | "ghostOnInk";

export type ButtonSize = "md" | "lg";

const base =
  "inline-flex max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg font-display font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-base",
  // Public site calls to action
  lg: "min-h-[52px] px-[26px] text-[17px]",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-ink hover:bg-mint",
  outline: "border-[1.5px] border-ink text-ink hover:border-mint hover:text-mint",
  danger: "bg-danger text-on-ink hover:bg-ink",
  dangerOutline: "border-[1.5px] border-danger text-danger hover:bg-danger-pale",
  ghost: "text-ink hover:bg-mist aria-pressed:bg-ink aria-pressed:text-on-ink",
  mint: "bg-mint-light text-ink hover:bg-white",
  outlineOnInk: "border-[1.5px] border-line text-on-ink hover:border-mint-light hover:text-mint-light",
  ghostOnInk: "text-line hover:text-mint-light",
};

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize };

/** Class names of a button, for elements that cannot be a `Button` or a `ButtonLink`. */
export function buttonClass({ variant = "primary", size = "md" }: StyleProps = {}, className?: string): string {
  return cn(base, sizes[size], variants[variant], className);
}

/** Native button. `type` defaults to "button": submit buttons say so explicitly. */
export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps): JSX.Element {
  return <button type={type} className={buttonClass({ variant, size }, className)} {...props} />;
}

/** Link styled as a button (internal routes, external URLs, mailto:). */
export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof AppLink> & StyleProps): JSX.Element {
  return <AppLink className={buttonClass({ variant, size }, className)} {...props} />;
}
