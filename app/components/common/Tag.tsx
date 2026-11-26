import { X } from "lucide-react";
import { IconButton } from "./IconButton";
import { cn } from "./utils";

/** Technology name (monospace, 4 px radius), on the public site and in the admin. */

export type TagVariant = "label" | "onMist" | "outline" | "now" | "before" | "compact";

const tagStyles: Record<TagVariant, string> = {
  // Plain label
  label: "bg-mist px-2.5 py-1.5 text-[13px] text-ink",
  // White label, on a mist background
  onMist: "border border-line bg-white px-2.5 py-1.5 text-[13px] text-ink",
  // Border in the text color (on tiles that switch to ink on hover)
  outline: "border border-current px-2.5 py-[5px] text-[13px]",
  // Used in the current position
  now: "border-[1.5px] border-ink bg-ink px-3 py-2 text-sm font-semibold text-on-ink",
  // Used in a previous position or a project
  before: "border-[1.5px] border-slate px-3 py-2 text-sm font-semibold text-ink",
  // Admin tables
  compact: "bg-mist px-2 py-1 text-xs text-ink",
};

/**
 * `onRemove` adds a remove button (a real <button>, so the tag must not sit inside another button).
 * inline-block so the vertical padding takes up room and wrapped rows keep their gap.
 */
export function Tag({ name, variant = "label", onRemove, className }: { name: string; variant?: TagVariant; onRemove?: () => void; className?: string }) {
  return (
    <span className={cn("inline-block rounded font-mono leading-tight", tagStyles[variant], onRemove && "inline-flex items-center gap-1 py-1 pr-1", className)}>
      {name}
      {onRemove && (
        <IconButton label={`Retirer ${name}`} tone="ghost" size="xs" onClick={onRemove} className="hover:bg-white">
          <X size={12} aria-hidden="true" />
        </IconButton>
      )}
    </span>
  );
}

/**
 * List of tags with an accessible name. `limit` shows the first tags and "+N" for the others.
 */
export function TagList({ names, label, variant, limit, className }: { names: string[]; label: string; variant?: TagVariant; limit?: number; className?: string }) {
  if (names.length === 0) return null;
  const shown = limit === undefined ? names : names.slice(0, limit);
  const hidden = names.length - shown.length;
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {shown.map((name) => (
        <li key={name}>
          <Tag name={name} variant={variant} />
        </li>
      ))}
      {hidden > 0 && (
        <li className="px-1 py-1 font-mono text-xs text-slate">
          +{hidden} <span className="sr-only">autres tags</span>
        </li>
      )}
    </ul>
  );
}
