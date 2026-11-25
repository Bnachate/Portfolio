import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Shared building blocks of the public site ("Encre et menthe" design system).
 * Radii: 4 px tags, 8 px buttons and fields, 16 px tiles and cards. Hover transitions only.
 */

const buttonBase =
  "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg px-[26px] font-display text-[17px] font-semibold transition-colors duration-150";

export const buttonStyles = {
  // On light backgrounds
  ink: `${buttonBase} bg-ink text-on-ink hover:bg-mint`,
  outline: `${buttonBase} border-[1.5px] border-ink text-ink hover:border-mint hover:text-mint`,
  // On ink backgrounds
  mint: `${buttonBase} bg-mint-light text-ink hover:bg-white`,
  outlineOnInk: `${buttonBase} border-[1.5px] border-line text-on-ink hover:border-mint-light hover:text-mint-light`,
};

/** Underlined text link (mint rule), on light backgrounds. */
export const underlineLink =
  "self-start border-b-2 border-mint pb-0.5 font-display text-[17px] font-semibold text-ink transition-colors duration-150 hover:text-mint";

/** Centered content column: max 1120 px, 20 to 80 px side margins. */
export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-[1120px] ${className}`} {...props} />;
}

export function Section({ className = "", children, ...props }: ComponentProps<"section">) {
  return (
    <section className={`px-[clamp(20px,6vw,80px)] ${className}`} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

/** Page title block (inner pages). */
export function PageTitle({ title, lead }: { title: string; lead: string }) {
  return (
    <Section className="pt-[72px]">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-[clamp(48px,7vw,80px)] font-bold leading-[0.98] tracking-[-0.035em]">{title}</h1>
        <p className="max-w-[60ch] text-[21px] leading-[1.6] text-slate">{lead}</p>
      </div>
    </Section>
  );
}

type TechTagVariant = "label" | "now" | "before";

const techTagStyles: Record<TechTagVariant, string> = {
  // Plain label
  label: "bg-mist px-2.5 py-1.5 text-[13px] text-ink",
  // Used in the current position
  now: "border-[1.5px] border-ink bg-ink px-3 py-2 text-sm font-semibold text-on-ink",
  // Used in a previous position or a project
  before: "border-[1.5px] border-slate px-3 py-2 text-sm font-semibold text-ink",
};

/** Technology name (monospace, 4 px radius). */
export function TechTag({ name, variant = "label" }: { name: string; variant?: TechTagVariant }) {
  // inline-block so the vertical padding takes up room and wrapped rows keep their gap
  return <span className={`inline-block rounded font-mono leading-tight ${techTagStyles[variant]}`}>{name}</span>;
}

export function TechTagList({ names, label }: { names: string[]; label?: string }) {
  if (names.length === 0) return null;
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {names.map((name) => (
        <li key={name}>
          <TechTag name={name} />
        </li>
      ))}
    </ul>
  );
}

export function ArrowIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Next.js link with the given button style. */
export function ButtonLink({ variant, className = "", ...props }: ComponentProps<typeof Link> & { variant: keyof typeof buttonStyles }) {
  return <Link className={`${buttonStyles[variant]} ${className}`} {...props} />;
}
