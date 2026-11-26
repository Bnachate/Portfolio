import type { ComponentProps, ReactNode } from "react";
import { AppLink } from "./AppLink";
import { cn } from "./utils";

/**
 * Icon-only button. `label` is required: it becomes the accessible name (aria-label),
 * so name the action and its target ("Supprimer le message de Jean"). Pass the icon with aria-hidden.
 */

export type IconButtonTone = "neutral" | "danger" | "ghost" | "ghostDanger" | "outline";
export type IconButtonSize = "md" | "sm" | "xs";

const base =
  "inline-flex shrink-0 cursor-pointer items-center justify-center transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

const sizes: Record<IconButtonSize, string> = {
  md: "h-11 w-11 rounded-lg",
  sm: "h-9 w-9 rounded-lg",
  // Inside a tag
  xs: "h-5 w-5 rounded-full",
};

const tones: Record<IconButtonTone, string> = {
  neutral: "bg-mist text-ink hover:bg-ink hover:text-on-ink",
  danger: "bg-danger-pale text-danger hover:bg-danger hover:text-on-ink",
  ghost: "text-slate hover:bg-mist hover:text-ink",
  ghostDanger: "text-danger hover:bg-danger-pale",
  outline: "border border-line bg-white text-ink hover:bg-mist",
};

type StyleProps = { tone?: IconButtonTone; size?: IconButtonSize };

export const iconButtonClass = ({ tone = "neutral", size = "md" }: StyleProps = {}, className?: string) => cn(base, sizes[size], tones[tone], className);

export function IconButton({
  label,
  tone,
  size,
  className,
  type = "button",
  ...props
}: Omit<ComponentProps<"button">, "aria-label"> & StyleProps & { label: string; children: ReactNode }) {
  return <button type={type} aria-label={label} className={iconButtonClass({ tone, size }, className)} {...props} />;
}

/** Icon-only link, same look as `IconButton`. */
export function IconLink({
  label,
  tone,
  size,
  className,
  ...props
}: Omit<ComponentProps<typeof AppLink>, "aria-label"> & StyleProps & { label: string; children: ReactNode }) {
  return <AppLink aria-label={label} className={iconButtonClass({ tone, size }, className)} {...props} />;
}
