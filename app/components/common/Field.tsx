import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Label } from "./label";
import { cn } from "./utils";

/**
 * Form field layout: visible label above the control, optional help text and footer below.
 * `id` must be the id of the control passed as children, so the label names it.
 * When the child is a single element, the help text is linked to it with aria-describedby.
 */
export function Field({
  id,
  label,
  hint,
  footer,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  /** Shown after the help text (e.g. a character counter). */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const hintId = `${id}-hint`;
  const control =
    hint && isValidElement<{ "aria-describedby"?: string }>(children)
      ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, { "aria-describedby": hintId })
      : children;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {control}
      {hint && (
        <p id={hintId} className="font-display text-sm text-slate">
          {hint}
        </p>
      )}
      {footer}
    </div>
  );
}

/** Group of fields under a title (a `fieldset` with its `legend`). */
export function FieldGroup({ title, className, children }: { title: ReactNode; className?: string; children: ReactNode }) {
  return (
    <fieldset className={cn("flex min-w-0 flex-col gap-4", className)}>
      <legend className="mb-4 w-full border-b border-line pb-2 font-display text-lg font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}
