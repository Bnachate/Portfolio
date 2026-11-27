import type { ComponentProps } from "react";
import { AppLink } from "@/app/components/common/AppLink";
import { cn } from "@/app/components/common/utils";
import type { JSX } from "react";

/**
 * Layout building blocks of the public site ("Encre et menthe" design system).
 * Buttons, links and tags are shared with the admin: see `app/components/common/`.
 * Radii: 4 px tags, 8 px buttons and fields, 16 px tiles and cards. Hover transitions only.
 */

/** Side margins of a full-width band: 20 to 80 px. */
export const gutter = "px-[clamp(20px,6vw,80px)]";

/** Centered content column: max 1120 px. */
export function Container({ className, ...props }: ComponentProps<"div">): JSX.Element {
  return <div className={cn("mx-auto w-full max-w-[1120px]", className)} {...props} />;
}

export function Section({ className, children, ...props }: ComponentProps<"section">): JSX.Element {
  return (
    <section className={cn(gutter, className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

/** Page title block (inner pages). */
export function PageTitle({ title, lead }: { title: string; lead: string }): JSX.Element {
  return (
    <Section className="pt-[72px]">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-[clamp(48px,7vw,80px)] font-bold leading-[0.98] tracking-[-0.035em]">{title}</h1>
        <p className="max-w-[60ch] text-[21px] leading-[1.6] text-slate">{lead}</p>
      </div>
    </Section>
  );
}

/** White tile that turns ink on hover, used as a whole-card link. */
export function TileLink({ className, ...props }: ComponentProps<typeof AppLink>): JSX.Element {
  return <AppLink className={cn("rounded-2xl border border-line bg-white text-ink transition-colors duration-150 hover:bg-ink hover:text-on-ink", className)} {...props} />;
}

export function ArrowIcon({ size = 20 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
