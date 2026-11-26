import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "./utils";

type AppLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  /** Opens in a new tab (with rel="noopener noreferrer"). */
  newTab?: boolean;
};

// Absolute URLs, mailto:, tel: and files are not Next.js routes: render a plain <a> for them.
// Only known file extensions count as files, so a route such as /projets/v2.0 keeps client navigation.
const FILE_EXTENSION = /\.(pdf|txt|xml|json|csv|zip|png|jpe?g|gif|webp|svg|ico|docx?)$/i;
const isPlainHref = (href: string) => /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href) || FILE_EXTENSION.test(href.split(/[?#]/)[0]);

/**
 * Link that picks the right element: Next.js `Link` for internal routes (client navigation),
 * a plain `<a>` for external URLs, mailto: links and files such as the CV PDF.
 */
export function AppLink({ href, newTab = false, ...props }: AppLinkProps) {
  const tabProps = newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return isPlainHref(href) ? <a href={href} {...tabProps} {...props} /> : <Link href={href} {...tabProps} {...props} />;
}

export type TextLinkVariant = "underline" | "inline" | "onInk";

const textLinkStyles: Record<TextLinkVariant, string> = {
  // Mint rule under the text, on light backgrounds (public site calls to action)
  underline: "self-start border-b-2 border-mint pb-0.5 font-display text-[17px] font-semibold text-ink transition-colors duration-150 hover:text-mint",
  // Link inside a sentence or a table cell
  inline: "underline underline-offset-2 transition-colors duration-150 hover:text-mint",
  // Secondary link on ink backgrounds (footer, hero)
  onInk: "text-line underline-offset-4 transition-colors duration-150 hover:text-mint-light hover:underline",
};

/** Class names of a text link, for elements that cannot be a `TextLink`. */
export const textLinkClass = (variant: TextLinkVariant = "inline", className?: string) => cn(textLinkStyles[variant], className);

export function TextLink({ variant = "inline", className, ...props }: ComponentProps<typeof AppLink> & { variant?: TextLinkVariant }) {
  return <AppLink className={textLinkClass(variant, className)} {...props} />;
}
