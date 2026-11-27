"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { Button } from "../../common/Button";
import { IconButton, IconLink } from "../../common/IconButton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../common/dialog";
import type { JSX, KeyboardEvent as ReactKeyboardEvent } from "react";

/**
 * Admin building blocks ("Encre et menthe"): named icon buttons, deletion confirmations,
 * move up / down buttons and the section panel. Generic pieces live in `app/components/common/`.
 */

export function EditButton({ label, onClick }: { label: string; onClick: () => void }): JSX.Element {
  return (
    <IconButton label={label} onClick={onClick}>
      <Pencil size={20} aria-hidden="true" />
    </IconButton>
  );
}

export function DeleteButton({ label, onClick }: { label: string; onClick: () => void }): JSX.Element {
  return (
    <IconButton label={label} tone="danger" onClick={onClick}>
      <Trash2 size={20} aria-hidden="true" />
    </IconButton>
  );
}

/** Opens a page of the site (or an external URL, in a new tab). */
export function ViewLink({ label, href }: { label: string; href: string }): JSX.Element {
  return (
    <IconLink label={label} href={href} newTab={/^https?:\/\//.test(href)}>
      <ExternalLink size={20} aria-hidden="true" />
    </IconLink>
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
}): JSX.Element {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cancelRef.current?.focus(), []);

  return (
    <div
      role="group"
      aria-label={question}
      className="flex flex-wrap items-center justify-end gap-2"
      onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") onCancel();
      }}
    >
      <span className="font-display text-[15px] font-semibold text-danger">{question}</span>
      <Button variant="danger" onClick={onConfirm} disabled={busy}>
        Oui
      </Button>
      <Button ref={cancelRef} variant="outline" onClick={onCancel} disabled={busy}>
        Non
      </Button>
    </div>
  );
}

/**
 * Deletion confirmation in a modal (alertdialog named after the question): "Oui" / "Non".
 * Focus starts on "Non" (the safe answer); Escape, the close button or a click outside cancel,
 * except while the deletion is running. The parent unmounts it once the server has answered.
 */
export function DeleteConfirmDialog({
  question,
  detail = "Cette action est définitive.",
  onConfirm,
  onCancel,
  busy = false,
}: {
  question: string;
  detail?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}): JSX.Element {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog open onOpenChange={(open: boolean) => !open && !busy && onCancel()}>
      <DialogContent
        role="alertdialog"
        className="sm:max-w-md"
        onOpenAutoFocus={(event: Event) => {
          event.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>{question}</DialogTitle>
          <DialogDescription>{detail}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button ref={cancelRef} variant="outline" onClick={onCancel} disabled={busy}>
            Non
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Suppression..." : "Oui"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Save / cancel icon buttons of an inline edit (rename in a table row). */
export function InlineEditActions({
  name,
  onSave,
  onCancel,
  canSave,
  busy = false,
}: {
  /** Current name of the item being renamed, used in the accessible names. */
  name: string;
  onSave: () => void;
  onCancel: () => void;
  canSave: boolean;
  busy?: boolean;
}): JSX.Element {
  return (
    <div className="flex justify-end gap-2">
      <IconButton label={`Enregistrer le nouveau nom de ${name}`} tone="ghost" onClick={onSave} disabled={busy || !canSave} className="text-ink">
        <Check size={20} aria-hidden="true" />
      </IconButton>
      <IconButton label={`Annuler le renommage de ${name}`} tone="ghostDanger" onClick={onCancel} disabled={busy}>
        <X size={20} aria-hidden="true" />
      </IconButton>
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
}): JSX.Element {
  return (
    <div className="flex gap-1">
      <IconButton label={`Monter ${name}`} tone="outline" size="sm" onClick={onUp} disabled={disabled || isFirst}>
        <ArrowUp size={18} aria-hidden="true" />
      </IconButton>
      <IconButton label={`Descendre ${name}`} tone="outline" size="sm" onClick={onDown} disabled={disabled || isLast}>
        <ArrowDown size={18} aria-hidden="true" />
      </IconButton>
    </div>
  );
}

/** White panel holding one admin section: title, count line, primary action. */
export function AdminPanel({
  title,
  summary,
  action,
  children,
}: {
  title: string;
  summary?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}): JSX.Element {
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
export function nextPosition(items: { position: number }[]): number {
  return items.reduce((max: number, item: { position: number }) => Math.max(max, item.position + 1), 0);
}

/** Moves the item at `index` one step up or down and returns the new id order. */
export function movedIds<T extends { id: number }>(items: T[], index: number, direction: -1 | 1): number[] {
  const ids = items.map((item: T) => item.id);
  const target = index + direction;
  const current: number | undefined = ids[index];
  const other: number | undefined = ids[target];
  if (current === undefined || other === undefined) return ids;
  ids[index] = other;
  ids[target] = current;
  return ids;
}
