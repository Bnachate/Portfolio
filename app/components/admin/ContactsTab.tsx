"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Button, ButtonLink } from "../common/Button";
import { TextLink } from "../common/AppLink";
import { ErrorBanner } from "../common/ErrorBanner";
import { StatusBadge } from "../common/StatusBadge";
import { AdminPanel, InlineDeleteConfirm } from "./common/AdminUi";
import { getContacts, updateContactStatus, deleteContact } from "@/app/services/admin/contacts.service";
import { getErrorMessage } from "@/app/config/api.config";
import type { ContactMessage, ContactStatus } from "@/app/types/api";

type Filter = "all" | "unread";

const STATUS_LABELS: Record<ContactStatus, { label: string; tone: "warning" | "muted" | "current" }> = {
  new: { label: "Non lu", tone: "warning" },
  read: { label: "Lu", tone: "muted" },
  done: { label: "Traité", tone: "current" },
};

const formatDate = (value: string) => new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/**
 * Inbox in two columns: the list (with an "unread" filter) and the open message.
 * `onUnreadCountChange` keeps the badge of the Messages tab up to date.
 */
export function ContactsTab({ onUnreadCountChange }: { onUnreadCountChange?: (count: number) => void }) {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getContacts()
      .then((list) => {
        setContacts(list);
        setLoaded(true);
      })
      .catch((err) => setError(getErrorMessage(err, "Impossible de charger les messages")));
  }, []);

  const unreadCount = contacts.filter((c) => c.status === "new").length;
  // Only once the messages are loaded: before that, the dashboard's own count is the right one
  useEffect(() => {
    if (loaded) onUnreadCountChange?.(unreadCount);
  }, [loaded, unreadCount, onUnreadCountChange]);

  const selected = contacts.find((c) => c.id === selectedId) ?? null;
  const shown = filter === "all" ? contacts : contacts.filter((c) => c.status === "new");

  const replaceContact = (updated: ContactMessage) => setContacts((current) => current.map((c) => (c.id === updated.id ? updated : c)));

  const handleStatusChange = async (id: number, status: ContactStatus) => {
    try {
      replaceContact(await updateContactStatus(id, status));
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de modifier le statut"));
    }
  };

  const handleOpen = (contact: ContactMessage) => {
    setSelectedId(contact.id);
    setConfirmingDelete(false);
    // Opening a new message marks it as read
    if (contact.status === "new") handleStatusChange(contact.id, "read");
  };

  const handleDelete = async (id: number) => {
    setIsBusy(true);
    try {
      await deleteContact(id);
      setContacts((current) => current.filter((c) => c.id !== id));
      setSelectedId(null);
      setConfirmingDelete(false);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de supprimer le message"));
    } finally {
      setIsBusy(false);
    }
  };

  const count = contacts.length;
  const filterButton = (value: Filter, label: string) => (
    <Button variant="ghost" aria-pressed={filter === value} onClick={() => setFilter(value)} className="px-4 text-[15px]">
      {label}
    </Button>
  );

  return (
    <AdminPanel
      title="Messages"
      summary={
        <>
          {count} message{count > 1 ? "s" : ""} au total
          {unreadCount > 0 && <> • {unreadCount} non lu{unreadCount > 1 ? "s" : ""}</>}
        </>
      }
    >
      <ErrorBanner message={error} onClose={() => setError("")} className="m-4" />
      <div className="grid min-h-[420px] md:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* List */}
        <div className="border-b border-line md:border-r md:border-b-0">
          <div role="group" aria-label="Filtrer les messages" className="flex gap-1 border-b border-line p-3">
            {filterButton("all", "Tous")}
            {filterButton("unread", `Non lus (${unreadCount})`)}
          </div>
          {shown.length === 0 ? (
            <p className="p-6 font-display text-base text-slate">Aucun message à afficher.</p>
          ) : (
            <ul aria-label="Messages reçus">
              {shown.map((contact) => {
                const unread = contact.status === "new";
                const current = contact.id === selectedId;
                return (
                  <li key={contact.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      onClick={() => handleOpen(contact)}
                      aria-current={current ? "true" : undefined}
                      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left font-display transition-colors duration-150 ${current ? "bg-mist" : "hover:bg-paper"}`}
                    >
                      {/* Indicator slot kept on every row so names line up; the dot marks unread messages */}
                      <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${unread ? "bg-amber" : ""}`} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={`truncate text-base ${unread ? "font-bold" : "font-medium"}`}>
                            {unread && (
                              <>
                                <span className="sr-only">Nouveau message :</span>{" "}
                              </>
                            )}
                            {contact.name}
                          </span>
                          <span className="shrink-0 font-mono text-xs text-slate">{formatDate(contact.createdAt)}</span>
                        </span>
                        <span className="truncate text-sm text-slate">{contact.subject ?? "Sans sujet"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Open message */}
        <div className="min-w-0 p-6" aria-live="polite">
          {!selected ? (
            <p className="font-display text-base text-slate">Sélectionnez un message pour le lire.</p>
          ) : (
            <article aria-label={`Message de ${selected.name}`} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl font-bold tracking-[-0.01em]">{selected.subject ?? "Sans sujet"}</h3>
                  <StatusBadge tone={STATUS_LABELS[selected.status].tone}>{STATUS_LABELS[selected.status].label}</StatusBadge>
                </div>
                <p className="font-display text-base">
                  <span className="font-semibold">{selected.name}</span>
                  {" · "}
                  <TextLink href={`mailto:${selected.email}`}>
                    {selected.email}
                  </TextLink>
                </p>
                <p className="font-mono text-sm text-slate">
                  {new Date(selected.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <p className="whitespace-pre-line rounded-lg border border-line bg-paper p-5 text-lg leading-relaxed">{selected.message}</p>

              {confirmingDelete ? (
                <InlineDeleteConfirm question="Supprimer ce message ?" onConfirm={() => handleDelete(selected.id)} onCancel={() => setConfirmingDelete(false)} busy={isBusy} />
              ) : (
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject ?? ""}`)}`}>
                    <Mail size={18} aria-hidden="true" />
                    Répondre par e-mail
                  </ButtonLink>
                  {selected.status !== "done" && (
                    <Button variant="outline" onClick={() => handleStatusChange(selected.id, "done")}>
                      Marquer comme traité
                    </Button>
                  )}
                  {selected.status !== "new" && (
                    <Button variant="outline" onClick={() => handleStatusChange(selected.id, "new")}>
                      Marquer comme non lu
                    </Button>
                  )}
                  <Button variant="dangerOutline" onClick={() => setConfirmingDelete(true)}>
                    Supprimer
                  </Button>
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </AdminPanel>
  );
}
