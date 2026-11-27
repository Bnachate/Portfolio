"use client";

import { useEffect, useRef, useState } from "react";
import { Tag, type TagVariant } from "./Tag";
import { cn } from "./utils";

/**
 * Tag kept on one line: a long text ends with "…" and shows in full in a tooltip below it,
 * on hover (the tooltip itself can be hovered) or when the surrounding `group` (e.g. a card link)
 * has the keyboard focus. Escape hides it (WCAG 1.4.13). The tooltip only exists when the text is
 * actually cut, and it is aria-hidden: the full text is already in the tag for assistive technologies.
 */
export function TruncatedTag({ name, variant = "outline", className }: { name: string; variant?: TagVariant; className?: string }) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [truncated, setTruncated] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Measured after layout and again whenever the card changes width
  useEffect(() => {
    const tag = wrapperRef.current?.firstElementChild as HTMLElement | null;
    if (!tag) return;
    const measure = () => setTruncated(tag.scrollWidth > tag.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tag);
    return () => observer.disconnect();
  }, [name]);

  useEffect(() => {
    if (!truncated) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [truncated]);

  return (
    <span
      ref={wrapperRef}
      className={cn("relative min-w-0 max-w-full", className)}
      onMouseEnter={() => {
        setHovered(true);
        setDismissed(false);
      }}
      onMouseLeave={() => setHovered(false)}
    >
      <Tag name={name} variant={variant} className="block max-w-full truncate" />
      {truncated && (
        <span
          aria-hidden="true"
          data-testid="truncated-tag-tooltip"
          className={cn(
            "absolute top-full left-0 z-10 mt-2 w-max max-w-[min(320px,80vw)] rounded-lg border border-line bg-white px-3 py-2 font-mono text-[13px] leading-snug whitespace-normal text-ink shadow-md",
            hovered && !dismissed ? "block" : "hidden",
            !dismissed && "group-focus-visible:block",
          )}
        >
          {name}
        </span>
      )}
    </span>
  );
}
