import type { ReactNode } from "react";
import type { JSX } from "react";

export type BadgeTone = "current" | "warning" | "muted";

const badgeTones: Record<BadgeTone, string> = {
  current: "bg-mint-pale text-mint",
  warning: "bg-amber text-ink",
  muted: "bg-mist text-slate",
};

/** A badge always names a state, it is never decorative (13 px minimum). */
export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }): JSX.Element {
  return <span className={`inline-flex items-center rounded px-2 py-[3px] font-display text-[13px] font-semibold ${badgeTones[tone]}`}>{children}</span>;
}
