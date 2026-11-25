"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Trash2 } from "lucide-react";

/**
 * Admin building blocks ("Encre et menthe"): 44 px icon buttons with accessible names,
 * in-row deletion confirmation, move up / down buttons and state badges.
 */

const iconButtonBase =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

export function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`${iconButtonBase} bg-mist text-ink hover:bg-ink hover:text-on-ink`}>
      <Pencil size={20} aria-hidden="true" />
    </button>
  );
}

export function DeleteButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={`${iconButtonBase} bg-danger-pale text-danger hover:bg-danger hover:text-on-ink`}>
      <Trash2 size={20} aria-hidden="true" />
    </button>
  );
}

export function ViewLink({ label, href }: { label: string; href: string }) {
  const external = /^https?:\/\//.test(href);
  const className = `${iconButtonBase} bg-mist text-ink hover:bg-ink hover:text-on-ink`;
  const icon = <ExternalLink size={20} aria-hidden="true" />;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={className}>
      {icon}
    </a>
  ) : (
    <Link href={href} aria-label={label} className={className}>
      {icon}
    </Link>
  );
}

/**
 * Deletion asks for confirmation in place, inside the row: "Supprimer ? Oui / Non".
 * Focus moves to "Non" (the safe answer); Escape cancels.
 */
export function InlineDeleteConfirm({
  question = "Supprimer ?",
  onConfirm,
  onCancel,
  busy = false,
}: {
  question?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cancelRef.current?.focus(), []);

  return (
    <div
      role="group"
      aria-label={question}
      className="flex flex-wrap items-center justify-end gap-2 font-display"
      onKeyDown={(event) => {
        if (event.key === "Escape") onCancel();
      }}
    >
      <span className="text-[15px] font-semibold text-danger">{question}</span>
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className="inline-flex min-h-11 items-center rounded-lg bg-danger px-3.5 text-[15px] font-semibold text-on-ink transition-colors duration-150 hover:bg-ink disabled:opacity-50"
      >
        Oui
      </button>
      <button
        ref={cancelRef}
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="inline-flex min-h-11 items-center rounded-lg border-[1.5px] border-slate px-3.5 text-[15px] font-semibold text-ink transition-colors duration-150 hover:border-ink disabled:opacity-50"
      >
        Non
      </button>
    </div>
  );
}

/** Move up / down buttons for the display order. */
export function ReorderButtons({
  name,
  onUp,
  onDown,
  isFirst,
  isLast,
  disabled = false,
}: {
  name: string;
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
}) {
  const className = `${iconButtonBase} h-9 w-9 border border-line bg-white text-ink hover:bg-mist`;
  return (
    <div className="flex gap-1">
      <button type="button" aria-label={`Monter ${name}`} onClick={onUp} disabled={disabled || isFirst} className={className}>
        <ArrowUp size={18} aria-hidden="true" />
      </button>
      <button type="button" aria-label={`Descendre ${name}`} onClick={onDown} disabled={disabled || isLast} className={className}>
        <ArrowDown size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

type BadgeTone = "current" | "warning" | "muted";

const badgeTones: Record<BadgeTone, string> = {
  current: "bg-mint-pale text-mint",
  warning: "bg-amber text-ink",
  muted: "bg-mist text-slate",
};

/** A badge always names a state, it is never decorative (13 px minimum). */
export function StatusBadge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded px-2 py-[3px] font-display text-[13px] font-semibold ${badgeTones[tone]}`}>{children}</span>;
}

/** White panel holding one admin section: title, count line, primary action. */
export function AdminPanel({
  title,
  summary,
  action,
  children,
}: {
  title: string;
  summary?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[28px] font-bold tracking-[-0.02em]">{title}</h2>
          {summary && <p className="font-display text-[15px] text-slate">{summary}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Position that puts a new item at the end of the list (gaps left by deletions are fine). */
export function nextPosition(items: { position: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.position + 1), 0);
}

/** Moves the item at `index` one step up or down and returns the new id order. */
export function movedIds<T extends { id: number }>(items: T[], index: number, direction: -1 | 1) {
  const ids = items.map((item) => item.id);
  const target = index + direction;
  if (target < 0 || target >= ids.length) return ids;
  [ids[index], ids[target]] = [ids[target], ids[index]];
  return ids;
}
